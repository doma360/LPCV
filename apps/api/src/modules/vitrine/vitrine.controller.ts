import type { Request, Response } from "express";
import { ok, okPaginated } from "@/utils/response.js";
import { parsePagination } from "@/utils/pagination.js";
import * as vitrineService from "./vitrine.service.js";

export async function listMetiersHandler(_req: Request, res: Response) {
  const metiers = await vitrineService.listMetiers();
  return ok(res, metiers);
}

export async function listZonesHandler(_req: Request, res: Response) {
  const zones = await vitrineService.listZones();
  return ok(res, zones);
}

export async function listBlogHandler(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const { articles, total } = await vitrineService.listBlog(skip, limit);
  return okPaginated(res, articles, { page, limit, total });
}

export async function getBlogArticleHandler(req: Request, res: Response) {
  const article = await vitrineService.getBlogArticle(req.params.slug);
  return ok(res, article);
}
