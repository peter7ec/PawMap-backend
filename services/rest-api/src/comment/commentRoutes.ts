import { Router } from "express";
import commentController from "./commentController";
import validatedParams from "../middlewares/validatedParams";
import searchQuerySchema, {
    createCommentSchema,
    idParamsSchema,
    UpdateComment,
} from "./commentSchema";
import validateRequestBody from "../middlewares/validateRequestBody";
import authorize from "../middlewares/authorize";
import validatedQuery from "../middlewares/validateQuery";

const commentRouter: Router = Router();

commentRouter.post(
    "/",
    authorize,
    validateRequestBody(createCommentSchema),
    commentController.create
);
commentRouter.get(
    "/:commentId",
    validatedParams(idParamsSchema),
    commentController.getById
);
commentRouter.get(
    "/",
    validatedQuery(searchQuerySchema),
    commentController.getAll
);
commentRouter.patch(
    "/:commentId",
    authorize,
    validatedParams(idParamsSchema),
    validateRequestBody(UpdateComment),
    commentController.updateById
);
commentRouter.delete(
    "/:commentId",
    authorize,
    validatedParams(idParamsSchema),
    commentController.deleteById
);
export default commentRouter;
