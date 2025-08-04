
import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const loginUser = createAsyncThunk(
  "user/login",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/login",{
        email : user.email,
        password : user.password
      });

      if(response.data.token){
        localStorage.setItem("token",response.data.token);
      }else{
        return thunkAPI.rejectWithValue({
            message : "token not found",
        })
      }

      return response.data.token;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const registerUser = createAsyncThunk(
    "user/register",
    async(user , thunkAPI)=>{
      try{
        const request = await clientServer.post("/register",{
          username : user.username,
          password : user.password,
          email : user.email,
          name : user.name
        })
        return request.data;
      }catch(err){
        return thunkAPI.rejectWithValue(err.response.data);
      }
    }
)


export const getAboutUSer = createAsyncThunk(
  "user/getAboutUser",
  async(user,thunkAPI)=>{
    try{
      const response = await clientServer.get("/get_user_and_profile",{
        params:{
          token : user.token
        }
      });
      return response.data;
    }catch(err){
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
)


export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async(_ , thunkAPI)=>{
      try{  


        const response = await clientServer.get("/user/get_all_user_profiles");

        return response.data;

      }catch(err){

        return thunkAPI.rejectWithValue(err.response.data);

      }
  }
)