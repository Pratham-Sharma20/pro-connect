import mongoose , {Schema} from "mongoose";

const commentSchema = mongoose.Schema({
    userId  :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    },
    postId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Post",
    },
    body  : {
        type : String,
        require : true,
    },
});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;