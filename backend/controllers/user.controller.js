import User from "../models/user.models.js";
import Profile from "../models/profile.models.js";
import Post from "../models/posts.models.js";
import Connection from "../models/connections.models.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import Comment from "../models/comments.models.js";

const convertUserDatoToPdf = async (userData) => {
  const doc = new PDFDocument();
  const outputpath = crypto.randomBytes(32).toString("hex") + ".pdf";
  const stream = fs.createWriteStream("uploads/" + outputpath);
  doc.pipe(stream);
  doc.image(`uploads/${userData.userId.profilePicture}`, {
    align: "center",
    width: 100,
  });
  doc.fontSize(14).text(`Name : ${userData.userId.name}`);
  doc.fontSize(14).text(`Username : ${userData.userId.username}`);
  doc.fontSize(14).text(`Bio : ${userData.bio}`);
  doc.fontSize(14).text(`Current position  : ${userData.currentPost}`);
  doc.fontSize(14).text(`Past work : `);
  userData.pastWork.forEach((work, index) => {
    doc.fontSize(14).text(`Company name : ${work.company}`);
    doc.fontSize(14).text(`Position : ${work.position}`);
    doc.fontSize(14).text(`Years : ${work.years}`);
  });
  doc.end();
  return outputpath;
};

export const register = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    if (!name || !email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();
    const profile = new Profile({
      userId: newUser._id,
    });
    await profile.save();
    res.json({
      message: "User registered successfully",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = crypto.randomBytes(32).toString("hex");

    await User.updateOne({ _id: user._id }, { token });

    return res.json({ token });
  } catch (err) {}
};

export const uploadProfilePicture = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.profilePicture = req.file.path;
    await user.save();
    return res.json({ message: "Profile picture updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { token, ...newUserData } = req.body;
    const user = await User.find({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { username, email } = newUserData;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser || String(existingUser._id) !== String(user._id)) {
        return res
          .status(400)
          .json({ message: "Username or email already exists" });
      }
    }
    Object.assign(user, newUserData);
    await user.save();
    return res.json({ message: "User profile updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getUserAndProfile = async (req, res) => {
  try {
    const { token } = req.query;
    console.log(`Token ${token}`);
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name username email profilePicture"
    );
    return res.json({ userProfile });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateProfileData = async (req, res) => {
  try {
    const { token, ...profileData } = req.body;
    const userProfile = await User.findOne({ token: token });
    if (!userProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile_to_update = await Profile.findOne({
      userId: userProfile._id,
    });
    Object.assign(profile_to_update, profileData);
    await profile_to_update.save();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllUserProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate(
      "userId",
      "name username email profilePicture"
    );
    return res.json({ profiles });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const downloadProfile = async (req, res) => {
  let user_id = req.query.id;
  console.log("[downloadProfile] Received user ID:", user_id);
  if (!user_id) {
    return res.status(400).json({ message: "User ID is required" });
  }
  const userProfile = await Profile.findOne({ userId: user_id }).populate(
    "userId",
    "name username email profilePicture"
  );
  let outputpath = await convertUserDatoToPdf(userProfile);
  return res.json({ message: outputpath });
};

export const sendConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connectionUser = await User.findById(connectionId);
    if (!connectionUser) {
      return res.status(404).json({ message: "Connection user not found" });
    }

    const existingRequest = await Connection.findOne({
      userId: user._id,
      connectionId: connectionUser._id,
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Connection request already sent" });
    }

    const newConnection = new Connection({
      userId: user._id,
      connectionId: connectionUser._id,
      status: "pending", // added field for clarity
    });

    await newConnection.save();
    return res.json({ message: "Connection request sent successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getConnectionRequests = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch requests received by the user
    const connections = await Connection.find({ connectionId: user._id })
      .populate("userId", "name username email profilePicture");

    return res.json(connections);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const whatAreMyConnections = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connections = await Connection.find({
      $or: [{ userId: user._id }, { connectionId: user._id }],
      status: "accepted", // only accepted ones
    })
      .populate("userId", "name username email profilePicture")
      .populate("connectionId", "name username email profilePicture");

    return res.json(connections);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  const { token, requestId, action_type } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connection = await Connection.findById(requestId);
    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    // Ensure only the recipient can accept/reject
    if (String(connection.connectionId) !== String(user._id)) {
      return res.status(403).json({ message: "Not authorized to accept this request" });
    }

    if (action_type === "accept") {
      connection.status = "accepted";
    } else if (action_type === "reject") {
      connection.status = "rejected";
    }

    await connection.save();
    return res.json({ message: "Connection request updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



export const commentPost = async(req , res)=>{
  const {token , post_id , commentBody} = req.body;
  try{
    const user = await User.findOne({token : token}).select("_id");
    if(!user){
      return res.status(404).json({message: "User not found"});   
    } 
    const post = await Post.findById(post_id);
    if(!post){
      return res.status(404).json({message: "Post not found"});
    }
    const comment = new Comment({
      userId: user._id,
      postId: post._id,
      body: commentBody,
    });
    await comment.save();
    return res.status(200).json({message: "Comment added successfully", comment}); 
  }catch(err){
    return res.status(500).json({message: err.message});
  }
}


export const getUserProfileAndUserBasedOnUsername = async (req, res) => {
  const { username } = req.query;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userProfile = await Profile.findOne({ userId: user._id })
      .populate("userId", "name username email profilePicture");

    if (!userProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json({ userProfile });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
