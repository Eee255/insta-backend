import express from "express";
import { getFollowers, followUser, unfollowUser, getFollowing } from "../controllers/relationship.js";

const router = express.Router();

router.get("/followers/:userId", getFollowers);               
router.get("/following/:userId", getFollowing);               
router.post("/", followUser);                       
router.delete("/:followingId", unfollowUser);       

export default router;
