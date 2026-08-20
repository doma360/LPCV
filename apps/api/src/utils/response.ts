import type { Response } from "express";

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export function ok<T>(res: Response, data: T, message = "OK", status = 200) {
  return res.status(status).json({ success: true, data, message });
}

export function created<T>(res: Response, data: T, message = "Créé") {
  return ok(res, data, message, 201);
}

export function okPaginated<T>(res: Response, data: T[], pagination: Pagination, message = "OK") {
  return res.status(200).json({ success: true, data, message, pagination });
}
