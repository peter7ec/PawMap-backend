import type { Comment as PrismaComment, Prisma } from "@backend/database";
import { prisma } from "@backend/database";
import HttpError from "../utils/HttpError";
import type { SearchQuerySchema, UpdateCommentSchema } from "./commentSchema";
import { UpdateComment } from "./commentSchema";
import type { PaginatedResponse } from "../types/global";

const commentService = {
  getCommentById: async (commentId: string): Promise<PrismaComment | null> => {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        replies: {
          select: {
            user: { select: { name: true, profile_avatar: true, id: true } },
            id: true,
            createdAt: true,
            content: true,
            _count: { select: { replies: true } },
          },
        },
        user: { select: { name: true, id: true, profile_avatar: true } },
      },
    });
    if (!comment) {
      throw new HttpError("Comment is not found", 404);
    }
    return comment;
  },
  getAllComments: async (
    queryParameters: SearchQuerySchema,
    eventId?: string,
    locationId?: string
  ): Promise<PaginatedResponse<PrismaComment[]>> => {
    const where: Prisma.CommentWhereInput = {};

    if (eventId) where.eventId = eventId;
    if (locationId) where.locationId = locationId;

    const maxPageSize = 20;
    const currentPageSize =
      queryParameters.pageSize && queryParameters.pageSize > 0
        ? Math.min(queryParameters.pageSize, maxPageSize)
        : 10;
    const totalComments = await prisma.comment.count({
      where,
    });
    const totalPages = Math.ceil(totalComments / currentPageSize);
    const currentPage = Math.max(
      1,
      Math.min(queryParameters.page || 1, totalPages || 1)
    );
    const skip = Math.max(0, (currentPage - 1) * currentPageSize);

    const comments = await prisma.comment.findMany({
      where,
      skip,
      take: currentPageSize,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, id: true } },
        replies: {
          orderBy: { createdAt: "desc" },
          include: { user: { select: { id: true, email: true } } },
        },
      },
    });
    return {
      ok: true,
      message: "All comments fetched",
      totalItems: totalComments,
      currentPage,
      pageSize: currentPageSize,
      totalPages,
      data: comments,
    };
  },
  deleteCommentById: async (
    commentId: string,
    userId: string
  ): Promise<PrismaComment> => {
    const commentExist = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!commentExist) {
      throw new HttpError("Comment doesn't exist", 404);
    }
    if (commentExist.userId !== userId) {
      throw new HttpError("Forbidden", 403);
    }
    return prisma.comment.delete({
      where: { id: commentId },
    });
  },
  createComment: async (
    newCommentData: PrismaComment,
    userId: string
  ): Promise<PrismaComment> => {
    const userExist = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userExist) {
      throw new HttpError("User doesn't exist");
    }

    const comment = await prisma.comment.create({
      data: { ...newCommentData, userId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        parentId: true,
        eventId: true,
        locationId: true,
        userId: true,
        user: { select: { name: true, profile_avatar: true } },
      },
    });
    return comment;
  },
  updateCommentById: async (
    commentId: string,
    newCommentData: UpdateCommentSchema,
    userId: string
  ): Promise<PrismaComment> => {
    const parsedData = UpdateComment.safeParse(newCommentData);
    if (!parsedData.success) {
      throw new HttpError("Must provide at least one data", 400);
    }
    const commentExist = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!commentExist) {
      throw new HttpError("Comment doesn't exist", 404);
    }
    if (commentExist.userId !== userId) {
      throw new HttpError("Forbidden", 403);
    }
    return prisma.comment.update({
      where: { id: commentId },
      data: parsedData.data,
    });
  },
};

export default commentService;
