import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";



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