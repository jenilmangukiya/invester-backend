import { Router } from "express";
import {
  addInvesterPdfContent,
  getAllInvester,
} from "../controllers/invester.controller.js";
import { extractFileText } from "../controllers/invester.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").get(getAllInvester);

router.route("/extractFileText").post(upload.single("file"), extractFileText);

router.route("/addInvesterPdfContent").post(addInvesterPdfContent);

export default router;
