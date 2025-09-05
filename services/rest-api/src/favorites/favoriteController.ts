import type { Request, Response } from "express";
import favoriteService from "./favoriteService";
import type { AuthorizedRequest } from "../middlewares/authorize";
import HttpError from "../utils/HttpError";
import type { ApiResponse } from "../types/global";

const favoriteControll = {
  createFavorite: async (req: AuthorizedRequest, res: Response) => {
    try {
      const favorite = await favoriteService.createFavorite(
        req.body.locationId,
        req.user?.id
      );
      const response: ApiResponse<typeof favorite> = {
        ok: true,
        message: "Favorite created successfully",
        data: favorite,
      };
      res.status(201).json(response);
    } catch (err) {
      const response: ApiResponse<null> = {
        ok: false,
        message: (err as HttpError)?.message || "Failed to create favorite",
        data: null,
      };
      res.status((err as HttpError)?.statusCode || 500).json(response);
    }
  },

  getAllFavorites: async (req: AuthorizedRequest, res: Response) => {
    try {
      if (!req.user?.id) throw new HttpError("Unauthorized", 401);
      const result = await favoriteService.getAllFavorites(
        req.user?.id,
        req.query
      );
      res.json(result);
    } catch (err) {
      const response: ApiResponse<null> = {
        ok: false,
        message: (err as HttpError)?.message || "Failed to get all favorites",
        data: null,
      };
      res.status((err as HttpError)?.statusCode || 500).json(response);
    }
  },

  deleteFavorite: async (req: AuthorizedRequest, res: Response) => {
    try {
      if (!req.user?.id) throw new HttpError("Unauthorized", 401);
      const locationIdToDelete = req.params.locationId;
      if (!locationIdToDelete)
        throw new HttpError("Location ID parameter is missing", 400);

      await favoriteService.deleteFavorite(locationIdToDelete, req.user?.id);
      const response: ApiResponse<null> = {
        ok: true,
        message: "Favorite deleted successfully",
        data: null,
      };
      res.json(response);
    } catch (err) {
      const response: ApiResponse<null> = {
        ok: false,
        message: (err as HttpError)?.message || "Failed to delete favorite",
        data: null,
      };
      res.status((err as HttpError)?.statusCode || 500).json(response);
    }
  },
};

export default favoriteControll;
