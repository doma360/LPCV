import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { getBlogArticleHandler, listBlogHandler, listMetiersHandler, listZonesHandler } from "./vitrine.controller.js";

export const vitrineRouter = Router();

vitrineRouter.get("/metiers", asyncHandler(listMetiersHandler));
vitrineRouter.get("/zones", asyncHandler(listZonesHandler));
vitrineRouter.get("/blog", asyncHandler(listBlogHandler));
vitrineRouter.get("/blog/:slug", asyncHandler(getBlogArticleHandler));
