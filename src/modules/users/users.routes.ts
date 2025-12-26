import { Router } from "express";
import { UsersController } from "./users.controller";

const router = Router();

router.post("/register", UsersController.register);
router.post("/login", UsersController.login);

export const userRouter = router;
