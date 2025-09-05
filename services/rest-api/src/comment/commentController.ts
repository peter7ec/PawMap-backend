import type { NextFunction, Request, Response } from "express";
import type { Comment as PrismaComment } from "@backend/database";
import type { ApiResponse, PaginatedResponse } from "../types/global";
import commentService from "./commentService";
import type { AuthorizedRequest } from "../middlewares/authorize";
import type { SearchQuerySchema } from "./commentSchema";
import HttpError from "../utils/HttpError";

const commentController = {
    getById: async (
        req: Request,
        res: Response<ApiResponse<PrismaComment | null>>,
        next: NextFunction
    ): Promise<void> => {
        try {
            const commentId = req.params.commentId;
            const result = await commentService.getCommentById(commentId);
            res.status(200).json({
                ok: true,
                message: "Comment read succesfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    },
    deleteById: async (
        req: AuthorizedRequest,
        res: Response<ApiResponse<PrismaComment>>,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.user?.id as string;

            const commentId = req.params.commentId;

            const result = await commentService.deleteCommentById(
                commentId,
                userId
            );
            res.status(200).json({
                ok: true,
                message: "Comment is deleted",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    },
    create: async (
        req: AuthorizedRequest,
        res: Response<ApiResponse<PrismaComment>>,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.user?.id as string;

            const result = await commentService.createComment(req.body, userId);

            res.status(201).json({
                ok: true,
                message: "Comment created successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    },
    updateById: async (
        req: AuthorizedRequest,
        res: Response<ApiResponse<PrismaComment>>,
        next: NextFunction
    ): Promise<void> => {
        try {
            const commentId = req.params.commentId;
            const newData = req.body;
            const userId = req.user?.id as string;

            const updatedComment = await commentService.updateCommentById(
                commentId,
                newData,
                userId
            );
            res.status(200).json({
                ok: true,
                message: "Comment is updated",
                data: updatedComment,
            });
        } catch (error) {
            next(error);
        }
    },
    getAll: async (
        req: Request & { validatedQuery?: SearchQuerySchema },
        res: Response<PaginatedResponse<PrismaComment[]>>,
        next: NextFunction
    ): Promise<void> => {
        try {
            if (!req.validatedQuery) {
                throw new HttpError("Missing validated query parameters");
            }
            const queryParameters = req.validatedQuery;

            const response = await commentService.getAllComments(
                queryParameters,
                queryParameters.eventId,
                queryParameters.locationId
            );
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    },
};
export default commentController;
