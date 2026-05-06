import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dhmRouter from "./dhm";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dhmRouter);

export default router;
