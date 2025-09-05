import { prisma } from "@backend/database";
import HttpError from "../utils/HttpError";
import type { Favorite, Prisma } from "@backend/database";
import type { PaginatedResponse } from "../types/global";

export interface FavoriteFilters {
  locationId?: string;
  userId?: string;
}

export type FavoriteEntity = Favorite;

export type PaginatedFavorites = PaginatedResponse<{
  id: string;
  locationId: string;
  userId: string;
  user: { id: string; name: string };
  location: {
    id: string;
    name: string;
    address: string;
    _count: {
      comments: number;
      events: number;
      reviews: number;
    };
    reviewAverage: number | null;
  };
}>;

const favoriteService = {
  createFavorite: async (
    locationId: string,
    userId?: string
  ): Promise<FavoriteEntity> => {
    if (!userId) {
      throw new HttpError("Unauthorized", 401);
    }
    const isLocationExists = await prisma.location.findUnique({
      where: { id: locationId },
    });
    if (!isLocationExists)
      throw new HttpError("Location does not exists.", 404);
    return prisma.favorite.create({
      data: { locationId, userId },
    });
  },

  getAllFavorites: async (
    userId: string,
    query: {
      page?: string | number;
      limit?: string | number;
      locationId?: string;
    }
  ): Promise<PaginatedFavorites> => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const filters: Prisma.FavoriteWhereInput = { userId: userId };
    if (query.locationId) filters.locationId = query.locationId;

    const [favorites, totalCount] = await Promise.all([
      prisma.favorite.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: filters,
        include: {
          user: { select: { id: true, name: true } },
          location: {
            select: {
              id: true,
              name: true,
              address: true,
              _count: {
                select: { comments: true, events: true, reviews: true },
              },
              images: true,
              description: true,
              type: true,
            },
          },
        },
      }),
      prisma.favorite.count({ where: filters }),
    ]);

    const locationIds = favorites.map((fav) => fav.locationId);

    const reviewAggregates = await prisma.review.groupBy({
      by: ["locationId"],
      where: { locationId: { in: locationIds } },
      _avg: {
        rating: true,
      },
    });

    const reviewAverageMap = new Map(
      reviewAggregates.map((agg) => [agg.locationId, agg._avg.rating])
    );

    const favoritesWithReviewAverage = favorites.map((fav) => ({
      ...fav,
      location: {
        ...fav.location,
        reviewAverage: reviewAverageMap.get(fav.locationId) ?? null,
      },
    }));
    return {
      ok: true,
      message: "Favorites retrieved successfully",
      data: favoritesWithReviewAverage as unknown as PaginatedFavorites["data"],
      currentPage: page,
      pageSize: limit,
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  },
  deleteFavorite: async (locationId: string, userId: string): Promise<void> => {
    const existing = await prisma.favorite.findFirst({
      where: { locationId, userId },
    });
    if (!existing) {
      throw new HttpError(
        `Favorite with Location ID ${locationId} does not exist`,
        404
      );
    }
    if (existing.userId !== userId)
      throw new HttpError(
        "You do not have permission to delete this favorite.",
        403
      );
    const favIdForDel = existing.id;
    await prisma.favorite.deleteMany({ where: { id: favIdForDel, userId } });
  },
};

export default favoriteService;
