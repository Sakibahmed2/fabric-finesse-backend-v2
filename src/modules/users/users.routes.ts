import { Router } from "express";
import { UsersController } from "./users.controller";

const router = Router();

router.get("/users", UsersController.getAllUsers);
router.post("/register", UsersController.register);
router.post("/login", UsersController.login);

export const userRouter = router;
