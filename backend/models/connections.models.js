import mongoose, {Schema} from "mongoose";

const connectionSchema = mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    },
    connectionId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    },
    status_accpted : {
        type : Boolean,
        default : null,
    }
});
const Connection = mongoose.model("Connection", connectionSchema);
export default Connection;