import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { The_Girl_Next_Door } from "next/font/google";



export const getAllPosts = createAsyncThunk(
    "post/get_posts",
    async(_ , thunkAPI)=>{
        try{

            const response = await clientServer.get("/get_posts");
            return thunkAPI.fulfillWithValue(response.data)

        }catch(err){
            return thunkAPI.rejectWithValue(err.response.data)
        }
    }
)

export const createPost = createAsyncThunk(
    "post/createPost",
        async(userData , thunkAPI)=>{
            const {file ,body} = userData;
            try{
                const formData = new FormData();
                formData.append("token",localStorage.getItem("token"));
                formData.append("body",body);
                formData.append("media",file);

                const response = await clientServer.post("/post",formData,{
                    headers : {
                        'Content-Type' : 'multipart/form-data'
                    }
                });

                if(response.status===200){
                    return thunkAPI.fulfillWithValue("post uploaded");
                }else{
                    return thunkAPI.rejectWithValue("Failed to upload post");
                }


            }catch(err){
                return thunkAPI.rejectWithValue(err.response.data);
            }
        }
)

export const deletePost = createAsyncThunk(
    "post/deletePost",
    async(post_id , thunkAPI)=>{
        try{
            const response = await clientServer.delete("/delete_post",{
                data:{
                    token : localStorage.getItem("token"),
                    post_id : post_id.post_id
                }
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(err){
            return thunkAPI.rejectWithValue(err.response.data);
        }
    }
)

export const incrementPostLikes = createAsyncThunk(
    "post/increment_likes",
    async(post , thunkAPI)=>{
        try{
            const response = await clientServer.post("/increment_likes" , {
                post_id  : post.post_id
            })
            return thunkAPI.fulfillWithValue(response.data);
        }catch(err){
            return thunkAPI.rejectWithValue(err.response.data);
        }
    }
) 


export const getAllComments = createAsyncThunk(
    "post/getAllComments",
    async(postData , thunkAPI)=>{
        try{
            const response = await clientServer.get("/get_comments",{
                params : {
                    post_id : postData.post_id,
                }
                
            })
            return thunkAPI.fulfillWithValue({
                comments : response .data,
                post_id : postData.post_id
            })
        }catch(err){
            return thunkAPI.rejectWithValue(err.response.data);
        }
    }
)


export const postComment = createAsyncThunk(
    "post/postComment",
    async(commentData , thunkAPI)=>{
        try{
            console.log({
                post_id : commentData.post_id,
                body : commentData.body 
            });
            const response = await clientServer.post("/comments",{
                token : localStorage.getItem("token"),
                post_id : commentData.post_id,
                commentBody : commentData.body
            })
            return thunkAPI.fulfillWithValue(response.data);
        }catch(err){
            return thunkAPI.rejectWithValue(err.response.data);
        }
    }
)