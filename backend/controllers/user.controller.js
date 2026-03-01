import User from "../models/user.models.js";
import Profile from "../models/profile.models.js";
import Post from "../models/posts.models.js";
import Connection from "../models/connections.models.js";
import Comment from "../models/comments.models.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import PDFDocument from "pdfkit";
import fs from "fs";
import catchAsync from "../utils/catchAsync.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

const convertUserDataToPDF = async (userData) => {
      const doc = new PDFDocument

      const outputPath = crypto.randomBytes(16).toString("hex") + ".pdf";
      const stream = fs.createWriteStream("uploads/" + outputPath);

      doc.pipe(stream);

      doc.image(`uploads/${userData.userId.profilePicture}`, {align: 'center', width: 100, marginbottom: "20px"});
      doc.fontSize(14).text(`Name: ${userData.userId.name}`,);
      doc.fontSize(14).text(`Username: ${userData.userId.username}`,);
      doc.fontSize(14).text(`Email: ${userData.userId.email}`,); 
      doc.fontSize(14).text(`Bio: ${userData.bio}`,);
      doc.fontSize(14).text(`Current Position: ${userData.currentPost}`,);

      doc.fontSize(14).text("Past Work : ")
      userData.pastWork.forEach((work, index) => {
          doc.fontSize(14).text(`Company: ${work.company}`);
          doc.fontSize(14).text(`Position: ${work.position}`);
          doc.fontSize(14).text(`Years: ${work.years}`);
  })
      doc.end();
      return outputPath;
  }

export const register = catchAsync(async (req, res, next) => {
  const { name, email, username, password } = req.body;
  
  if (!name || !email || !username || !password) {
    const err = new Error("All fields are required");
    err.statusCode = 400;
    return next(err);
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    const err = new Error("User already exists");
    err.statusCode = 400;
    return next(err);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    name,
    email,
    username,
    password: hashedPassword,
  });

  await Profile.create({
    userId: newUser._id,
  });

  createSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const err = new Error("Please provide email and password");
    err.statusCode = 400;
    return next(err);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    const err = new Error("Incorrect email or password");
    err.statusCode = 401;
    return next(err);
  }

  createSendToken(user, 200, res);
});

export const uploadProfilePicture = catchAsync(async (req, res, next) => {
  if (!req.file) {
    const err = new Error("Please upload an image file");
    err.statusCode = 400;
    return next(err);
  }

  const user = req.user;

  if (user.profilePicture && user.profilePicture.startsWith('http')) {
      await deleteFromCloudinary(user.profilePicture, "image");
  }

  user.profilePicture = req.file.path;
  await user.save();
  return res.json({ status: "success", message: "Profile picture updated successfully" });
});

export const updateUserProfile = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { username, email } = req.body;

  if (username || email) {
    const existingUser = await User.findOne({ 
      $and: [
        { _id: { $ne: user._id } },
        { $or: [{ username }, { email }] }
      ]
    });

    if (existingUser) {
      const err = new Error("Username or email already exists");
      err.statusCode = 400;
      return next(err);
    }
  }

  Object.assign(user, req.body);
  await user.save();
  return res.json({ status: "success", message: "User profile updated successfully" });
});

export const getUserAndProfile = catchAsync(async (req, res, next) => {
  const user = req.user;

  const userProfile = await Profile.findOne({ userId: user._id }).populate(
    "userId",
    "name username email profilePicture"
  );
  return res.json({ status: "success", data: { userProfile } });
});

export const updateProfileData = catchAsync(async (req, res, next) => {
  const user = req.user;

  const profile = await Profile.findOne({ userId: user._id });
  if (!profile) {
    const err = new Error("Profile not found");
    err.statusCode = 404;
    return next(err);
  }

  Object.assign(profile, req.body);
  await profile.save();

  return res.json({ status: "success", message: "Profile updated successfully" });
});

export const getAllUserProfiles = catchAsync(async (req, res, next) => {
  const profiles = await Profile.find().populate(
    "userId",
    "name username email profilePicture"
  );
  return res.json({ status: "success", results: profiles.length, data: { profiles } });
});

export const downloadProfile = catchAsync(async (req, res, next) => {
  const user_id = req.query.id;
  const userProfile = await Profile.findOne({ userId: user_id }).populate('userId', 'name username email profilePicture');

  if (!userProfile) {
    const err = new Error("Profile not found");
    err.statusCode = 404;
    return next(err);
  }

  let outputPath = await convertUserDataToPDF(userProfile);
  return res.json({ status: "success", outputPath });
});

export const sendConnectionRequest = catchAsync(async (req, res, next) => {
  const { connectionId } = req.body;
  const user = req.user;

  if (String(user._id) === String(connectionId)) {
    const err = new Error("Cannot connect to yourself");
    err.statusCode = 400;
    return next(err);
  }

  const connectionUser = await User.findById(connectionId);
  if (!connectionUser) {
    const err = new Error("Connection user not found");
    err.statusCode = 404;
    return next(err);
  }

  const existingRequest = await Connection.findOne({
    $or: [
      { userId: user._id, connectionId: connectionUser._id },
      { userId: connectionUser._id, connectionId: user._id },
    ],
  });

  if (existingRequest) {
    let message = "Connection request already exists";
    if (existingRequest.status === "accepted") message = "You are already connected";
    
    const err = new Error(message);
    err.statusCode = 400;
    return next(err);
  }

  const newConnection = await Connection.create({
    userId: user._id,
    connectionId: connectionUser._id,
    status: "pending",
  });

  return res.json({ status: "success", message: "Connection request sent successfully" });
});
  
export const getConnectionRequests = catchAsync(async (req, res, next) => {
  const user = req.user;

  // Only return requests where the CURRENT USER is the receiver (connectionId)
  const connections = await Connection.find({ connectionId: user._id, status: "pending" })
    .populate("userId", "name username email profilePicture")
    .populate("connectionId", "name username email profilePicture");

  return res.json({ status: "success", data: { connections } });
});

export const whatAreMyConnections = catchAsync(async (req, res, next) => {
  const user = req.user;

  // Fetch all connections where the user is either the sender OR the receiver
  const connections = await Connection.find({
    $or: [{ userId: user._id }, { connectionId: user._id }],
  })
    .populate("userId", "name username email profilePicture")
    .populate("connectionId", "name username email profilePicture");

  return res.json({ status: "success", data: { connections } });
});
export const acceptConnectionRequest = catchAsync(async (req, res, next) => {
  const { requestId, action_type } = req.body;
  const user = req.user;

  const connection = await Connection.findById(requestId);
  if (!connection) {
    const err = new Error("Connection request not found");
    err.statusCode = 404;
    return next(err);
  }

  if (String(connection.connectionId) !== String(user._id)) {
    const err = new Error("Not authorized to accept this request");
    err.statusCode = 403;
    return next(err);
  }

  if (action_type === "accept") {
    connection.status = "accepted";
  } else if (action_type === "reject") {
    connection.status = "rejected";
  }

  await connection.save();
  return res.json({ status: "success", message: "Connection request updated successfully" });
});



export const commentPost = catchAsync(async (req, res, next) => {
  const { post_id, commentBody } = req.body;
  const user = req.user;

  const post = await Post.findById(post_id);
  if (!post) {
    const err = new Error("Post not found");
    err.statusCode = 404;
    return next(err);
  }

  const comment = await Comment.create({
    userId: user._id,
    postId: post._id,
    body: commentBody,
  });

  return res.status(201).json({ status: "success", message: "Comment added successfully", data: { comment } });
});


export const getUserProfileAndUserBasedOnUsername = catchAsync(async (req, res, next) => {
  const { username } = req.query;
  const user = await User.findOne({ username });
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    return next(err);
  }

  const userProfile = await Profile.findOne({ userId: user._id })
    .populate("userId", "name username email profilePicture");

  if (!userProfile) {
    const err = new Error("Profile not found");
    err.statusCode = 404;
    return next(err);
  }

  return res.status(200).json({ status: "success", data: { userProfile } });
});
