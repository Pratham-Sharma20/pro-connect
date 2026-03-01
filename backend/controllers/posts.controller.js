import Post from '../models/posts.models.js';
import User from '../models/user.models.js';
import Comment from '../models/comments.models.js';
import catchAsync from '../utils/catchAsync.js';
import { deleteFromCloudinary } from '../utils/cloudinary.js';

export const activeCheck = catchAsync(async (req, res, next) => {
    return res.status(200).json({
        status: "success",
        message: "running"
    });
});

export const createPost = catchAsync(async (req, res, next) => {
    const user = req.user;
    
    if (!req.body.body && !req.file) {
        const err = new Error("Post must contain text or media");
        err.statusCode = 400;
        return next(err);
    }
    
    const post = await Post.create({
        userId: user._id,
        body: req.body.body || "",
        media: req.file != undefined ? req.file.path : "",
        fileType: req.file != undefined ? req.file.mimetype.split("/")[1] : "",
    });

    return res.status(201).json({ status: "success", message: "Post created successfully", data: { post } });
});

export const getAllPosts = catchAsync(async (req, res, next) => {
    const posts = await Post.find()
        .populate('userId', 'username profilePicture name')
        .sort({ createdAt: -1 });
        
    return res.status(200).json({ status: "success", results: posts.length, data: { posts } });
});

export const deletPost = catchAsync(async (req, res, next) => {
    const { post_id } = req.body;
    const user = req.user;

    const post = await Post.findById(post_id);
    if (!post) {
        const err = new Error("Post not found");
        err.statusCode = 404;
        return next(err);
    }

    if (post.userId.toString() !== user._id.toString()) {
        const err = new Error("You are not authorized to delete this post");
        err.statusCode = 403;
        return next(err);
    }

    if (post.media) {
        await deleteFromCloudinary(post.media, post.fileType);
    }

    await Post.findByIdAndDelete(post_id);
    return res.status(200).json({ status: "success", message: "Post deleted successfully" });
});

export const get_comments_by_post = catchAsync(async (req, res, next) => {
    const { post_id } = req.query;

    const post = await Post.findById(post_id);
    if (!post) {
        const err = new Error("Post not found");
        err.statusCode = 404;
        return next(err);
    }

    const comments = await Comment.find({ postId: post_id })
        .populate("userId", "username name profilePicture")
        .sort({ createdAt: -1 });

    return res.status(200).json({ status: "success", results: comments.length, data: { comments } });
});

export const delete_comment_of_user = catchAsync(async (req, res, next) => {
    const { comment_id } = req.body;
    const user = req.user;

    const comment = await Comment.findById(comment_id);
    if (!comment) {
        const err = new Error("Comment not found");
        err.statusCode = 404;
        return next(err);
    }

    if (comment.userId.toString() !== user._id.toString()) {
        const err = new Error("You are not authorized to delete this comment");
        err.statusCode = 403;
        return next(err);
    }

    await Comment.findByIdAndDelete(comment_id);
    return res.status(200).json({ status: "success", message: "Comment deleted successfully" });
});


export const increment_likes = catchAsync(async (req, res, next) => {
    const { post_id } = req.body;
    const user = req.user;

    const post = await Post.findById(post_id);
    if (!post) {
        const err = new Error("Post not found");
        err.statusCode = 404;
        return next(err);
    }

    const isLiked = post.likedBy.includes(user._id);

    if (isLiked) {
        // Unlike: Remove user from likedBy and decrement likes
        post.likedBy = post.likedBy.filter(id => id.toString() !== user._id.toString());
        post.likes = Math.max(0, post.likes - 1);
    } else {
        // Like: Add user to likedBy and increment likes
        post.likedBy.push(user._id);
        post.likes += 1;
    }

    await post.save();

    return res.status(200).json({ 
        status: "success", 
        message: isLiked ? "Post unliked successfully" : "Post liked successfully", 
        data: { post } 
    });
});
