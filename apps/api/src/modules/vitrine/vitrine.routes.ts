import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { getBlogArticleHandler, listBlogHandler, listMetiersHandler } from "./vitrine.controller.js";

export const vitrineRouter = Router();

vitrineRouter.get("/metiers", asyncHandler(listMetiersHandler));
vitrineRouter.get("/blog", asyncHandler(listBlogHandler));
vitrineRouter.get("/blog/:slug", asyncHandler(getBlogArticleHandler));
