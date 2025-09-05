import type { Review } from '@backend/database';
import type { PaginatedResponse } from "../types/global";

export interface ReviewFilters {
  locationId?: string;
  userId?: string;
}

export type PaginatedReviews = PaginatedResponse<{
  id: string;
  comment: string | null;
  rating: number;
  locationId: string;
  userId: string;
  user: {
    id: string;
    name: string;
  };
  location: {
    id: string;
    name: string;
  };
}>;

export interface UpdateReviewInput {
  id: string;
  comment: string;
  rating: number;
}

export type ReviewEntity = Review;
