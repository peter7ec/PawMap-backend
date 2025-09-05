import { Router } from "express";
import reviewControll from "./reviewController";
import authorize from "../middlewares/authorize";
import validateRequestBody from "../middlewares/validateRequestBody";
import validatedQuery from "../middlewares/validateQuery";
import { reviewSchema, reviewQuerySchema } from "./reviewSchema";

const reviewRouter: Router = Router();
reviewRouter.use(authorize);

reviewRouter.post("/", validateRequestBody(reviewSchema), reviewControll.createReview);
reviewRouter.patch("/:id", validateRequestBody(reviewSchema), reviewControll.updateReview);
reviewRouter.get("/", validatedQuery(reviewQuerySchema), reviewControll.getAllReviews);
reviewRouter.get("/:id", validatedQuery(reviewQuerySchema), reviewControll.getReviewById);
reviewRouter.delete("/:id", reviewControll.deleteReview);

export default reviewRouter;
