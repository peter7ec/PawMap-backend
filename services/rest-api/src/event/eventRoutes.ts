import { Router } from "express";
import validatedParams from "../middlewares/validatedParams";
import searchQuerySchema, {
    createEvenetSchema,
    idParamsSchema,
    updateEvent,
    validatedPartipationStatus,
} from "./eventSchema";
import eventController from "./eventController";
import validatedQuery from "../middlewares/validateQuery";
import authorize from "../middlewares/authorize";
import validateRequestBody from "../middlewares/validateRequestBody";

const eventRouter: Router = Router();

eventRouter.post(
    "/",
    authorize,
    validateRequestBody(createEvenetSchema),
    eventController.post
);
eventRouter.get(
    "/:eventId",
    validatedParams(idParamsSchema),
    eventController.getById
);

eventRouter.get("/", validatedQuery(searchQuerySchema), eventController.getAll);

eventRouter.patch(
    "/:eventId",
    authorize,
    validateRequestBody(updateEvent),
    eventController.update
);

eventRouter.delete(
    "/:eventId",
    authorize,
    validatedParams(idParamsSchema),
    eventController.delete
);

eventRouter.post(
    "/:eventId/status",
    authorize,
    validatedParams(idParamsSchema),
    validateRequestBody(validatedPartipationStatus),
    eventController.eventStatus
);

export default eventRouter;
