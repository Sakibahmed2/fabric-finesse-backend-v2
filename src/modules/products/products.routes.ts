import { Router } from "express";
import { productsController } from "./products.controller";

const router = Router();

router.post("/", productsController.createProducts);
router.get("/", productsController.getAllProducts);
router.get("/slug/:slug", productsController.getSingleProductWithSlug);
router.get("/:id", productsController.getProductById);
router.put("/:id", productsController.updateProductById);
router.delete("/:id", productsController.deleteProduct);

export const productsRouter = router;
