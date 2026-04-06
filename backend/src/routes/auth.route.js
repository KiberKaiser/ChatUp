import express from "express";
import {
	addFriend,
	checkAuth,
	getFriends,
	login,
	logout,
	removeFriend,
	searchUsersByNickname,
	signup,
	updateProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);
router.get("/friends", protectRoute, getFriends);
router.get("/search-users", protectRoute, searchUsersByNickname);
router.post("/friends/:friendId", protectRoute, addFriend);
router.delete("/friends/:friendId", protectRoute, removeFriend);

export default router;
