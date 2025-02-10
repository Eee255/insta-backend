import express from "express";
import { getLikes, likePost, unlikePost } from "../controllers/likes.js";

const router = express.Router();

router.get("/:postId", getLikes);         // GET likes for a post
router.post("/", likePost);               // POST like a post
router.delete("/:postId", unlikePost);    // DELETE unlike a post

export default router;
