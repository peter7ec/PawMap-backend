import { Router } from "express";
import locationRouter from "../location/locationRoutes";
import commentRouter from "../comment/commentRoutes";
import eventRouter from "../event/eventRoutes";
import reviewRouter from "../reviews/reviewRouter";
import favoriteRouter from "../favorites/favotiteRouter";

const apiRouter: Router = Router();

apiRouter.use("/location", locationRouter);
apiRouter.use("/comment", commentRouter);
apiRouter.use("/event", eventRouter);
apiRouter.use("/review", reviewRouter);
apiRouter.use("/favorites", favoriteRouter);

export default apiRouter;
