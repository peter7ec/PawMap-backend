import type { Response, Request, NextFunction } from "express";
import type { Location } from "@backend/database";
import type { ApiResponse, PaginatedResponse } from "../types/global";
import locationService from "./locationService";
import type { SearchQuerySchema } from "./locationSchema";
import { createLocationSchema } from "./locationSchema";
import HttpError from "../utils/HttpError";

export interface AuthorizedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

const locationController = {
  getAllLocation: async (
    req: Request & { validatedQuery?: SearchQuerySchema },
    res: Response<PaginatedResponse<Location[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.validatedQuery) {
        throw new HttpError("Missing validated query parameters");
      }
      const queryParameters = req.validatedQuery;

      const response = await locationService.getAllLocation(queryParameters);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
  getLocationById: async (
    req: Request,
    res: Response<ApiResponse<Location>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const locationId = req.params.locationId;
      const result = await locationService.getLocationById(locationId);

      res.status(200).json({
        ok: true,
        message: "Location read successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  createLocation: async (
    req: AuthorizedRequest,
    res: Response<ApiResponse<Location>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) throw new HttpError("Unauthorized", 401);

      const parsedBody = createLocationSchema.parse(req.body);

      const addressString = parsedBody.address.city
        ? `${parsedBody.address.city}, ${parsedBody.address.street}`
        : parsedBody.address.street;

      const newLocation = await locationService.createLocation({
        name: parsedBody.name,
        address: addressString,
        type: parsedBody.type ?? "PARK",
        description: parsedBody.description,
        images: parsedBody.images,
        createdById: req.user.id,
      });

      res.status(201).json({
        ok: true,
        message: "Location created successfully",
        data: newLocation,
      });
    } catch (error) {
      next(error);
    }
  },

  updateLocation: async (
    req: AuthorizedRequest,
    res: Response<ApiResponse<Location>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) throw new HttpError("Unauthorized", 401);
      const locationId = req.params.locationId;
      const location = await locationService.getLocationById(locationId);
      if (location.createdById !== req.user.id) {
        throw new HttpError("Forbidden: Cannot update this location", 403);
      }

      const updateData = { ...req.body };

      if (updateData.address) {
        const addressString = updateData.address.city
          ? `${updateData.address.city}, ${updateData.address.street}`
          : updateData.address.street;

        updateData.address = addressString;
      }
      const updatedLocation = await locationService.updateLocation(
        locationId,
        updateData
      );
      res.status(200).json({
        ok: true,
        message: "Location updated successfully",
        data: updatedLocation,
      });
    } catch (error) {
      next(error);
    }
  },
  deleteLocation: async (
    req: AuthorizedRequest,
    res: Response<ApiResponse<null>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) throw new HttpError("Unauthorized", 401);
      const locationId = req.params.locationId;
      const location = await locationService.getLocationById(locationId);
      if (location.createdById !== req.user.id) {
        throw new HttpError("Forbidden: Cannot delete this location", 403);
      }
      await locationService.deleteLocation(locationId);
      res.status(200).json({
        ok: true,
        message: "Location deleted successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default locationController;
