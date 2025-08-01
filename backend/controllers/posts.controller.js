import Post from '../models/posts.models.js';
import User from '../models/user.models.js';

export const activeCheck = async(req,res)=>{
    return res.status(200).json({
        message: "running"
    });
}


export const createPost = async (req,res)=>{
    const{token} = req.body;
    try{
        const user = await User.findOne({token});
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        const post = new Post({
            userId: user._id,
            body : req.body.body,
            media : req.file != undefined ? req.file.filename : "",
            fileType : req.file != undefined ? req.file.mimetype.split("/")[1] : "",
        });

        await post.save();
        return res.status(200).json({message: "Post created successfully", post});  
    }catch(err){
        return res.status(500).json({message: err.message});
    }
}

export const getAllPosts = async(req,res)=>{
    try{
        const posts = await Post.find().populate('userId', 'username profilePicture');
        return res.status(200).json(posts);
    }catch(err){
        return res.status(500).json({message: err.message});
    }
}


export const deletPost = async(req,res)=>{
    const {token , post_id} = req.body;
    try{
        const user = await User.findOne({token : token}).select("_id");
        if(!user){
            return res.status(404).json({message: "User not found"});   
        }
        const post = await Post.findById(post_id);
        if(!post){
            return res.status(404).json({message: "Post not found"});
        }
        if(post.userId.toString() !== user._id.toString()){
            return res.status(403).json({message: "You are not authorized to delete this post"});
        }else{
            await post.deletPost({_id: post_id});
            return res.status(200).json({message: "Post deleted successfully"});
        }
    }catch(err){
        return res.status(500).json({message: err.message});
    }

}


export const get_comments_by_post = async(req,res)=>{
    const {post_id} = req.body;
    try{
        const post = await Post.findById({_id : post_id});
        if(!post){
            return res.status(404).json({message: "Post not found"});
        }
        return res.status(200).json(post.comments);
    }catch(err){
        return res.status(500).json({message: err.message});
    }
}


export const delete_comment_of_user = async(req,res)=>{
    const { token , comment_id} = req.body;
    try{
        const user = await User.findOne({token : token}).select("_id");
        if(!user){
            return res.status(404).json({message: "User not found"});   
        }
        const comment = await Comment.findOne({"_id": comment_id});
        if(!comment){
            return res.status(404).json({message: "Comment not found"});
        }
        if(comment.userId.toString() !== user._id.toString()){
            return res.status(403).json({message: "You are not authorized to delete this comment"});
        }
        await comment.deleteOne({"_id": comment_id});
        return res.status(200).json({message: "Comment deleted successfully"});
    }catch(err){
        return res.status(500).json({message: err.message});
    }
}



export const increment_likes = async(req,res)=>{
    const {post_id} = req.body;
    try{
        const post = await Post.findById(post_id);
        if(!post){
            return res.status(404).json({message: "Post not found"});
        }
        post.likes += 1;
        await post.save();
        return res.status(200).json({message: "Post liked successfully", likes: post});
    }catch(err){
        return res.status(500).json({message: err.message});
    }
}