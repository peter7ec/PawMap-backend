export interface ApiResponse<T> {
  ok: boolean;
  message: string;
  data: T;
}
export interface PaginatedResponse<T> extends ApiResponse<T> {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
export enum Order {
  ASC = "asc",
  DESC = "desc",
}
export type NominatimPlace = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  osm_type?: "node" | "way" | "relation";
  osm_id?: number;
  boundingbox?: [string, string, string, string];
  class?: string;
  category?: string;
  type?: string;
  importance?: number;
  address?: Record<string, string>;
  extratags?: Record<string, string>;
  namedetails?: Record<string, string>;
};

export type NominatimSearchResponse = NominatimPlace[];
