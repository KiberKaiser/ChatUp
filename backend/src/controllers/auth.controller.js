import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { cloudinary } from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, nickname, email, password } = req.body;
  try {
    if (!fullName || !nickname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters"});
    }

    const normalizedNickname = nickname.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email }, { nickname: normalizedNickname }],
    });

    if (user) {
      const duplicateField = user.email === email ? "Email" : "Nickname";
      return res.status(400).json({ message: `${duplicateField} already exists` });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      nickname: normalizedNickname,
      email,
      password: hashedPassword,
    });н

    if (newUser) {
      const token = generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        token,
        _id: newUser._id,
        fullName: newUser.fullName,
        nickname: newUser.nickname,
        email: newUser.email,
        profilePic: newUser.profilePic,
        friends: newUser.friends,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id, res);

    res.status(200).json({
      token,
      _id: user._id,
      fullName: user.fullName,
      nickname: user.nickname,
      email: user.email,
      profilePic: user.profilePic,
      friends: user.friends,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const searchUsersByNickname = async (req, res) => {
  try {
    const nicknameQuery = (req.query.nickname || "").trim().toLowerCase();
    if (!nicknameQuery) {
      return res.status(200).json([]);
    }

    const users = await User.find({
      _id: { $ne: req.user._id },
      nickname: { $regex: nicknameQuery, $options: "i" },
    })
      .select("_id fullName nickname email profilePic")
      .limit(30);

    const friendIds = new Set((req.user.friends || []).map((id) => id.toString()));
    const results = users.map((user) => ({
      ...user.toObject(),
      isFriend: friendIds.has(user._id.toString()),
    }));

    res.status(200).json(results);
  } catch (error) {
    console.log("Error in searchUsersByNickname controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("friends", "_id fullName nickname email profilePic")
      .select("friends");

    res.status(200).json(user?.friends || []);
  } catch (error) {
    console.log("Error in getFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const myId = req.user._id;

    if (friendId === myId.toString()) {
      return res.status(400).json({ message: "You cannot add yourself" });
    }

    const friend = await User.findById(friendId).select("_id");
    if (!friend) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.updateOne({ _id: myId }, { $addToSet: { friends: friendId } });
    await User.updateOne({ _id: friendId }, { $addToSet: { friends: myId } });

    const updatedMe = await User.findById(myId)
      .populate("friends", "_id fullName nickname email profilePic")
      .select("friends");

    res.status(200).json(updatedMe?.friends || []);
  } catch (error) {
    console.log("Error in addFriend controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const myId = req.user._id;

    if (friendId === myId.toString()) {
      return res.status(400).json({ message: "You cannot remove yourself" });
    }

    await User.updateOne({ _id: myId }, { $pull: { friends: friendId } });
    await User.updateOne({ _id: friendId }, { $pull: { friends: myId } });

    const updatedMe = await User.findById(myId)
      .populate("friends", "_id fullName nickname email profilePic")
      .select("friends");

    res.status(200).json(updatedMe?.friends || []);
  } catch (error) {
    console.log("Error in removeFriend controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
