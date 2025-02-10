import express from "express";
import {
  getComments,
  addComment,
  deleteComment,
} from "../controllers/comment.js";

const router = express.Router();

router.get("/:id", getComments);
router.post("/", addComment);
router.delete("/:id", deleteComment);

export default router;
