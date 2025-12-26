type QueryParams = {
  search?: string;
  searchFields?: string[];
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export const buildQuery = (query: QueryParams) => {
  const filter: Record<string, any> = {};

  // Basic filters (category, status, userId, etc.)
  if (query.filters) {
    Object.assign(filter, query.filters);
  }

  // Price range (only when needed)
  if (query.minPrice !== undefined && query.maxPrice !== undefined) {
    filter.price = {
      $gte: Number(query.minPrice),
      $lte: Number(query.maxPrice),
    };
  }

  // Search
  if (query.search && query.searchFields?.length) {
    filter.$or = query.searchFields.map((field) => ({
      [field]: { $regex: query.search, $options: "i" },
    }));
  }

  // Sorting
  const sort: Record<string, 1 | -1> = {};
  if (query.sortBy) {
    sort[query.sortBy] = query.sortOrder === "desc" ? -1 : 1;
  }

  // Pagination
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  return { filter, page, limit, skip, sort };
};
