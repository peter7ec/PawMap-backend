import { prisma, Location, Prisma, LocationType } from "@backend/database";
import type { SearchQuerySchema } from "./locationSchema";
import type {
  NominatimPlace,
  NominatimSearchResponse,
  PaginatedResponse,
} from "../types/global";
import HttpError from "../utils/HttpError";
import { NOMINATIM_URL, USER_AGENT } from "../constants/global";
import { getCachedCoords, setCachedCoords } from "../utils/addressCache";

let nextAllowed = 0;

function waitForRateLimit() {
  const now = Date.now();
  const delay = Math.max(0, nextAllowed - now);
  return new Promise<void>((r) =>
    setTimeout(() => {
      nextAllowed = Date.now() + 1000;
      r();
    }, delay)
  );
}

export async function geocodeAddress(q: string, countrycodes = "hu") {
  if (!q?.trim()) return null;

  await waitForRateLimit();

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("format", "json");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");
  if (countrycodes) url.searchParams.set("countrycodes", countrycodes);

  const resp = await fetch(url.toString(), {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
  });

  if (resp.status === 429 || resp.status === 403) {
    await new Promise((r) => setTimeout(r, 2000));
    return await geocodeAddress(q, countrycodes);
  }

  if (!resp.ok) throw new Error(`Nominatim error ${resp.status}`);

  const arr: NominatimSearchResponse | unknown = await resp.json();
  if (!Array.isArray(arr) || arr.length === 0) return null;

  const best: NominatimPlace = arr[0];
  if (!best) return null;
  return {
    lat: parseFloat(best.lat),
    lon: parseFloat(best.lon),
    displayName: best.display_name as string,
    raw: best,
  };
}

const searchSelect = {
  id: true,
  name: true,
  address: true,
  description: true,
  images: true,
  createdById: true,
  createdAt: true,
  type: true,
  lat: true,
  lon: true,
  _count: {
    select: {
      comments: true,
      events: true,
    },
  },
};

type SearchedLocation = Prisma.LocationGetPayload<{
  select: typeof searchSelect;
}>;

type ReviewAggregateType = {
  locationId: string;
  _avg: {
    rating: number | null;
  };
  _count: {
    _all: number;
  };
};

export type LocationWithAggregates = SearchedLocation & {
  description?: string | null;
  reviewStats: {
    average: number | null;
    count: number;
  };
};

const locationService = {
  getAllLocation: async (
    queryParameters: SearchQuerySchema
  ): Promise<PaginatedResponse<LocationWithAggregates[]>> => {
    const currentPage = queryParameters.page > 0 ? queryParameters.page : 1;
    const currentPageSize =
      queryParameters.pageSize > 0 ? queryParameters.pageSize : 5;
    const skip = (currentPage - 1) * currentPageSize;

    const whereClause: Prisma.LocationWhereInput = {
      ...(queryParameters.searchTerm
        ? {
            OR: [
              {
                name: {
                  contains: queryParameters.searchTerm,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                address: {
                  contains: queryParameters.searchTerm,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : {}),
    };

    const totalLocations = await prisma.location.count({
      where: whereClause,
    });
    const totalPages = Math.ceil(totalLocations / currentPageSize);

    const locations: SearchedLocation[] = await prisma.location.findMany({
      where: whereClause,
      orderBy: [{ [queryParameters.sortBy]: queryParameters.order }],
      skip,
      take: currentPageSize,
      select: searchSelect,
    });

    const locationIds = locations.map((loc) => loc.id);

    const reviewAggregates = (await prisma.review.groupBy({
      by: ["locationId"],
      where: {
        locationId: {
          in: locationIds,
        },
      },
      _avg: {
        rating: true,
      },
      _count: {
        _all: true,
      },
    })) as unknown as ReviewAggregateType[];

    const reviewStatsMap = new Map(
      reviewAggregates.map((agg) => [
        agg.locationId,
        {
          average: agg._avg.rating,
          count: agg._count._all,
        },
      ])
    );

    const locationsWithAggregates: LocationWithAggregates[] = locations.map(
      (location) => ({
        ...location,
        reviewStats: reviewStatsMap.get(location.id) ?? {
          average: null,
          count: 0,
        },
      })
    );

    return {
      ok: true,
      message: "Locations retrieved successfully.",
      currentPage,
      pageSize: currentPageSize,
      totalItems: totalLocations,
      totalPages,
      data: locationsWithAggregates,
    };
  },
  getLocationById: async (locationId: string): Promise<Location> => {
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        reviews: {
          select: {
            id: true,
            comment: true,
            createdAt: true,
            rating: true,
            user: { select: { name: true, profile_avatar: true, id: true } },
          },
        },
        comments: {
          select: {
            user: { select: { id: true, name: true, profile_avatar: true } },
            content: true,
            createdAt: true,
            _count: {
              select: { replies: true },
            },
            id: true,
          },
        },
        events: true,
        createdBy: { select: { name: true } },
      },
    });
    if (!location) {
      throw new HttpError("Location is not found", 404);
    }
    return location;
  },
  createLocation: async (data: {
    name: string;
    address: string;
    type: LocationType;
    createdById: string;
    images: string[];
    description?: string;
    lat?: number;
    lon?: number;
  }): Promise<Location> => {
    try {
      const userExists = await prisma.user.findUnique({
        where: { id: data.createdById },
      });
      if (!userExists) {
        throw new HttpError("Cannot create location: User does not exist", 404);
      }
      let lat = data.lat;
      let lon = data.lon;
      if ((!lat || !lon) && data.address) {
        const cached = await getCachedCoords(data.address);
        if (cached) {
          lat = cached.lat;
          lon = cached.lon;
        } else {
          const geocoded = await geocodeAddress(data.address);
          if (geocoded) {
            lat = geocoded.lat;
            lon = geocoded.lon;
            await setCachedCoords(data.address, lat, lon);
          }
        }
      }

      const createData: Prisma.LocationCreateInput = {
        name: data.name,
        address: data.address,
        type: data.type,
        createdBy: { connect: { id: data.createdById } },
        images: data.images,
        description: data.description ?? "",
        lat: lat ?? null,
        lon: lon ?? null,
      };

      return await prisma.location.create({ data: createData });
    } catch (error: any) {
      throw new HttpError(
        `Failed to create location: ${error.message || "Unknown error"}`,
        error instanceof HttpError ? error.statusCode : 400
      );
    }
  },
  updateLocation: async (
    id: string,
    data: Prisma.LocationUpdateInput
  ): Promise<Location> => {
    const existing = await prisma.location.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpError("Location with ID ${id} does not exist", 404);
    }
    if (
      typeof data.address === "string" &&
      data.address !== existing.address &&
      !data.lat &&
      !data.lon
    ) {
      const cached = await getCachedCoords(data.address);
      if (cached) {
        data.lat = cached.lat;
        data.lon = cached.lon;
      } else {
        const geocoded = await geocodeAddress(data.address);
        if (geocoded) {
          data.lat = geocoded.lat;
          data.lon = geocoded.lon;
          await setCachedCoords(data.address, geocoded.lat, geocoded.lon);
        }
      }
    }
    return prisma.location.update({ where: { id }, data });
  },
  deleteLocation: async (id: string): Promise<Location> => {
    const existing = await prisma.location.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpError("Location with ID ${id} does not exist", 404);
    }
    await prisma.review.deleteMany({ where: { locationId: id } });
    await prisma.comment.deleteMany({ where: { locationId: id } });
    await prisma.event.deleteMany({ where: { locationId: id } });
    return await prisma.location.delete({ where: { id } });
  },
};
export default locationService;
