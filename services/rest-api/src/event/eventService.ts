import type { Prisma, Event, EventParticipant } from "@backend/database";
import type { PaginatedResponse } from "../types/global";
import HttpError from "../utils/HttpError";
import { prisma } from "@backend/database";
import {
  createEvenetSchema,
  updateEvent,
  validatedPartipationStatus,
  type CreateEvenetSchema,
  type SearchQuerySchema,
  type UpdateEventSchema,
} from "./eventSchema";

const eventService = {
  getEventById: async (eventId: string): Promise<Event> => {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profile_avatar: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        eventParticipants: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
    if (!event) {
      throw new HttpError("Event not found", 404);
    }
    return event;
  },
  getAllEvents: async (
    queryParameters: SearchQuerySchema
  ): Promise<PaginatedResponse<Event[]>> => {
    const currentPageSize =
      queryParameters.pageSize > 0 ? queryParameters.pageSize : 5;

    const whereClause: Prisma.EventWhereInput = {};

    if (queryParameters.searchTerm) {
      whereClause.OR = [
        {
          title: {
            contains: queryParameters.searchTerm,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: queryParameters.searchTerm,
            mode: "insensitive",
          },
        },
        {
          location: {
            OR: [
              {
                name: {
                  contains: queryParameters.searchTerm,
                  mode: "insensitive",
                },
              },
              {
                address: {
                  contains: queryParameters.searchTerm,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
      ];
    }

    const totalEvents = await prisma.event.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(totalEvents / currentPageSize);
    const currentPage = Math.max(
      1,
      Math.min(queryParameters.page || 1, totalPages || 1)
    );
    const skip = Math.max(0, (currentPage - 1) * currentPageSize);

    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: currentPageSize,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        location: true,
        comments: { include: { replies: true } },
        eventParticipants: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return {
      ok: true,
      message: "Events fetched successuflly",
      totalItems: totalEvents,
      currentPage,
      pageSize: currentPageSize,
      totalPages,
      data: events,
    };
  },
  deleteEventById: async (eventId: string, userId: string): Promise<Event> => {
    const eventExist = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!eventExist) {
      throw new HttpError("Event not found", 404);
    }
    if (eventExist.createdById !== userId) {
      throw new HttpError("Forbidden", 403);
    }
    await prisma.comment.deleteMany({
      where: {
        eventId,
      },
    });
    return prisma.event.delete({
      where: { id: eventId },
    });
  },
  createEvent: async (
    newEventData: CreateEvenetSchema,
    userId: string
  ): Promise<Event> => {
    const parsedData = createEvenetSchema.safeParse(newEventData);

    if (!parsedData.success) {
      throw new HttpError("Must provide", 401);
    }
    const userExist = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userExist) {
      throw new HttpError("User doesnt exist", 404);
    }

    const newEvent = await prisma.event.create({
      data: {
        createdById: userId,
        address: newEventData.address,
        description: newEventData.description,
        startsAt: newEventData.startsAt,
        title: newEventData.title,
        endsAt: newEventData.endsAt,

        locationId: newEventData.locationId,
      },
    });

    return newEvent;
  },
  updateEvent: async (
    newEventData: UpdateEventSchema,
    userId: string,
    eventId: string
  ): Promise<Event> => {
    const parsedData = updateEvent.safeParse(newEventData);
    if (!parsedData.success) {
      throw new HttpError("Must provide at least one data", 400);
    }
    const eventExist = await prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!eventExist) {
      throw new HttpError("Event not found", 404);
    }
    if (eventExist.createdById !== userId) {
      throw new HttpError("Forbidden", 403);
    }
    return prisma.event.update({
      where: { id: eventId },
      data: parsedData.data,
    });
  },
  setParticipationStatus: async (
    eventId: string,
    userId: string,
    data: { interested?: boolean; willBeThere?: boolean }
  ): Promise<EventParticipant> => {
    const parsedData = validatedPartipationStatus.safeParse(data);
    if (!parsedData.success) {
      throw new HttpError("Wrong datas", 400);
    }
    const eventExist = await prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!eventExist) throw new HttpError("Event not found", 404);

    const userExist = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userExist) throw new HttpError("User not found", 404);

    return await prisma.eventParticipant.upsert({
      where: { eventId_userId: { eventId, userId } },
      create: { eventId, userId, ...data },
      update: data,
    });
  },
};
export default eventService;
