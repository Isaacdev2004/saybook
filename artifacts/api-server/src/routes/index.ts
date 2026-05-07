import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dhmRouter from "./dhm";
import communityRouter from "./community";
import adminCommunityRouter from "./adminCommunity";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dhmRouter);
router.use(communityRouter);
router.use(adminCommunityRouter);

export default router;
