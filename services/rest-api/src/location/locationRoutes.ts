import { Router } from "express";
import locationController from "./locationController";
import validatedQuery from "../middlewares/validateQuery";
import validatedParams from "../middlewares/validatedParams";
import searchQuerySchema, {
  idParamsSchema,
  createLocationSchema,
  updateLocationSchema,
} from "./locationSchema";
import authorize from "../middlewares/authorize";
import validateRequestBody from "../middlewares/validateRequestBody";

const locationRouter: Router = Router();

locationRouter.get(
  "/",
  validatedQuery(searchQuerySchema),
  locationController.getAllLocation
);

locationRouter.get(
  "/:locationId",
  validatedParams(idParamsSchema),
  locationController.getLocationById
);

locationRouter.post(
  "/",
  authorize,
  validateRequestBody(createLocationSchema),
  locationController.createLocation
);

locationRouter.patch(
  "/:locationId",
  authorize,
  validateRequestBody(updateLocationSchema),
  locationController.updateLocation
);

locationRouter.delete(
  "/:locationId",
  authorize,
  validatedParams(idParamsSchema),
  locationController.deleteLocation
);

export default locationRouter;
