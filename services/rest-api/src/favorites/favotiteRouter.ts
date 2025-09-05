import { Router } from "express";
import favoriteController from "./favoriteController";
import authorize from "../middlewares/authorize";
import validateRequestBody from "../middlewares/validateRequestBody";
import validateQuery from "../middlewares/validateQuery";
import validateParams from "../middlewares/validatedParams";
import {
  favoriteIdSchema,
  favoriteQuerySchema,
  favoriteCreateSchema,
} from "./favoriteSchema";

const favoriteRouter: Router = Router();
favoriteRouter.use(authorize);

favoriteRouter.post(
  "/",
  authorize,
  validateRequestBody(favoriteCreateSchema),
  favoriteController.createFavorite
);
favoriteRouter.get(
  "/",
  authorize,
  validateQuery(favoriteQuerySchema),
  favoriteController.getAllFavorites
);
favoriteRouter.delete(
  "/:locationId",
  authorize,
  validateParams(favoriteIdSchema),
  favoriteController.deleteFavorite
);

export default favoriteRouter;
