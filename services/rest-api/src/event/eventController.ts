import type { NextFunction, Request, Response } from "express";
import type { Event, EventParticipant } from "@backend/database";
import type { ApiResponse, PaginatedResponse } from "../types/global";
import eventService from "./eventService";
import type { SearchQuerySchema } from "./eventSchema";
import HttpError from "../utils/HttpError";
import type { AuthorizedRequest } from "../middlewares/authorize";

const eventController = {
  getById: async (
    req: Request,
    res: Response<ApiResponse<Event>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const eventId = req.params.eventId;
      const result = await eventService.getEventById(eventId);

      res.status(200).json({
        ok: true,
        message: "Event read succesfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  getAll: async (
    req: Request & { validatedQuery?: SearchQuerySchema },
    res: Response<PaginatedResponse<Event[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.validatedQuery) {
        throw new HttpError("Missing validated query parameters");
      }
      const queryParameters = req.validatedQuery;
      const response = await eventService.getAllEvents(queryParameters);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
  delete: async (
    req: AuthorizedRequest,
    res: Response<ApiResponse<Event>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id as string;

      const eventId = req.params.eventId;
      const deletedEvent = await eventService.deleteEventById(eventId, userId);

      res.status(200).json({
        ok: true,
        message: "Event deleted",
        data: deletedEvent,
      });
    } catch (error) {
      next(error);
    }
  },
  post: async (
    req: AuthorizedRequest,
    res: Response<ApiResponse<Event>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id as string;

      const newEvent = await eventService.createEvent(req.body, userId);
      res.status(201).json({
        ok: true,
        message: "Event created successfully",
        data: newEvent,
      });
    } catch (error) {
      next(error);
    }
  },
  update: async (
    req: AuthorizedRequest,
    res: Response<ApiResponse<Event>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const eventId = req.params.eventId;
      const newEventData = req.body;
      const userId = req.user?.id as string;

      const updatedEvent = await eventService.updateEvent(
        newEventData,
        userId,
        eventId
      );
      res.status(200).json({
        ok: true,
        message: "event updated",
        data: updatedEvent,
      });
    } catch (error) {
      next(error);
    }
  },
  eventStatus: async (
    req: AuthorizedRequest,
    res: Response<ApiResponse<EventParticipant>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const eventId = req.params.eventId;
      const userId = req.user?.id as string;

      const result = await eventService.setParticipationStatus(
        eventId,
        userId,
        req.body
      );
      res.status(200).json({
        ok: true,
        message: "ok",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
export default eventController;
