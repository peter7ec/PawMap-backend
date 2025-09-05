import type { Review } from '@backend/database';
import { prisma } from '@backend/database';
import HttpError from '../utils/HttpError';
import type {
  ReviewEntity,
  ReviewFilters,
  PaginatedReviews,
  UpdateReviewInput,
} from './reviewTypes';

const reviewService = {
  createReview: async (
    data: { comment: string; rating: number; locationId: string },
    userId?: string
  ): Promise<ReviewEntity> => {
    if (!userId) {
      throw new HttpError('Unauthorized', 401);
    }
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        locationId: data.locationId,
      },
    });
    if (existingReview) {
      throw new HttpError('You have already left a review for this location', 400);
    }
    return prisma.review.create({
      data: {
        ...data,
        userId,
      },
    });
  },
  
  getAllReviews: async (query: {
    page?: string | number;
    limit?: string | number;
    locationId?: string;
    userId?: string;
  }): Promise<PaginatedReviews> => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const filters: ReviewFilters = {};
    if (query.locationId) filters.locationId = query.locationId;
    if (query.userId) filters.userId = query.userId;

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: filters,
        include: {
          user: { select: { id: true, name: true } },
          location: { select: { id: true, name: true } },
        },
      }),
      prisma.review.count({ where: filters }),
    ]);

    return {
      ok: true,
      message: 'Favorites retrieved successfully',
      data: reviews as unknown as PaginatedReviews['data'],
      currentPage: page,
      pageSize: limit,
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  },

  getReviewById: async (id: string): Promise<ReviewEntity> => {
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: true,
        location: true,
      },
    });

    if (!review) {
      throw new HttpError(`Review with ID ${id} does not exist`, 404);
    }

    return review;
  },

  updateReview: async ({
    id,
    comment,
    rating,
  }: UpdateReviewInput): Promise<ReviewEntity> => {
    const existingReview = await prisma.review.findUnique({ where: { id } });
    if (!existingReview) {
      throw new HttpError(`Review with ID ${id} does not exist`, 404);
    }

    return prisma.review.update({
      where: { id },
      data: { comment, rating },
    });
  },

  deleteReview: async (id: string): Promise<Review> => {
    const existingReview = await prisma.review.findUnique({ where: { id } });
    if (!existingReview) {
      throw new HttpError(`Review with ID ${id} does not exist`, 404);
    }

    return prisma.review.delete({ where: { id } });
  },
};

export default reviewService;
