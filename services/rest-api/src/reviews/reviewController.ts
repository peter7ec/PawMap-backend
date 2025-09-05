import type { Request, Response } from 'express';
import reviewService from './reviewService';
import type { AuthorizedRequest } from '../middlewares/authorize';
import HttpError from '../utils/HttpError';
import type { ApiResponse } from '../types/global';

const reviewController = {
  createReview: async (req: AuthorizedRequest, res: Response) => {
  try {
    const review = await reviewService.createReview(req.body, req.user?.id);

    const response: ApiResponse<typeof review> = {
      ok: true,
      message: 'Review created successfully',
      data: review,
    };

    res.status(201).json(response);
  } catch (err) {
    const response: ApiResponse<null> = {
      ok: false,
      message: (err as HttpError)?.message || 'Failed to create review',
      data: null,
    };

    res.status((err as HttpError)?.statusCode || 500).json(response);
  }
},

  getAllReviews: async (req: Request, res: Response) => {
    try {
      const result = await reviewService.getAllReviews(req.query);

      const response: ApiResponse<typeof result> = {
        ok: true,
        message: 'Reviews retrieved successfully',
        data: result,
      };

      res.status(200).json(response);
    } catch (err) {
      const response: ApiResponse<null> = {
        ok: false,
        message: (err as HttpError)?.message || 'Failed to get all reviews',
        data: null,
      };
      res.status((err as HttpError)?.statusCode || 500).json(response);
    }
  },

  getReviewById: async (req: Request, res: Response) => {
    try {
      const review = await reviewService.getReviewById(req.params.id);
      const response: ApiResponse<typeof review> = {
        ok: true,
        message: 'Review retrieved successfully',
        data: review,
      };

      res.status(200).json(response);
    } catch (err) {
      const response: ApiResponse<null> = {
        ok: false,
        message: (err as HttpError)?.message || 'Failed to get review',
        data: null,
      };
      res.status((err as HttpError)?.statusCode || 500).json(response);
    }
  },

  updateReview: async (req: AuthorizedRequest, res: Response) => {
    try {
      const review = await reviewService.updateReview({
        id: String(req.params.id),
        ...req.body,
      });

      const response: ApiResponse<typeof review> = {
        ok: true,
        message: 'Review updated successfully',
        data: review,
      };

      res.status(200).json(response);
    } catch (err) {
      const response: ApiResponse<null> = {
        ok: false,
        message: (err as HttpError)?.message || 'Failed to update review',
        data: null,
      };
      res.status((err as HttpError)?.statusCode || 500).json(response);
    }
  },

  deleteReview: async (req: AuthorizedRequest, res: Response) => {
    try {
      await reviewService.deleteReview(req.params.id);
      const response: ApiResponse<typeof reviewService> = {
        ok: true,
        message: 'Review deleted successfully',
        data: reviewService,
      };

      res.status(200).json(response);
    } catch (err) {
      const response: ApiResponse<null> = {
        ok: false,
        message: (err as HttpError)?.message || 'Failed to delete review',
        data: null,
      };
      res.status((err as HttpError)?.statusCode || 500).json(response);
    }
  },
};

export default reviewController;
