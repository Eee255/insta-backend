import express from "express";
import { getFollowers, followUser, unfollowUser } from "../controllers/relationshipsController.js";

const router = express.Router();

router.get("/:userId", getFollowers);               // GET followers of a user
router.post("/", followUser);                       // POST follow a user
router.delete("/:followingId", unfollowUser);       // DELETE unfollow a user

export default router;
