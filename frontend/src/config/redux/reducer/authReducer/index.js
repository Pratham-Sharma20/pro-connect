import { createSlice } from "@reduxjs/toolkit"
import { getAboutUSer, loginUser, registerUser , getAllUsers, getConnectionRequest, getMyConnectionRequests } from "../../action/authAction"

const initialState = {
    user : [],
    isError : false,
    isSuccess : false,
    isLoading : false,
    isTokenThere : false,
    isLoggedIn : false,
    message : "",
    profileFetched : false,
    connections : [],
    connectRequests : [],
    all_users : [],
    all_profiles_fetched : false
}

const authSlice = createSlice({
    name : "auth",
    initialState,
    reducers :{
        reset: (state) => {
            Object.assign(state, initialState);
        },
        handleLoginUser : (state)=>{
            state.message = "hello"
        },
        emptyMessage : (state)=>{
            state.message = "";
        },
        setTokenIsThere : (state)=>{
            state.isTokenThere = true;
        },
        setTokenIsNotThere : (state)=>{
            state.isTokenThere = false;
        }
    },

    extraReducers : (builder)=>{
        builder
        .addCase(loginUser.pending,(state)=>{
            state.isLoading = true
            state.message = "knocking the door"
        })
        .addCase(loginUser.fulfilled , (state,action)=>{
            state.isLoading = false,
            state.isError = false,
            state.isSuccess = true,
            state.isLoggedIn = true,
            state.message = "login successfull"
        })
        .addCase(loginUser.rejected , (state,action)=>{
            state.isLoading = false,
            state.isError = true,
            state.message = action.payload
        })
        .addCase(registerUser.pending , (state)=>{
            state.isLoading = true
            state.message = "regisstering you"
        })
        .addCase(registerUser.fulfilled, (state)=>{
            state.isLoading = false,
            state.isError = false,
            state.isSuccess = true,
            state.isLoggedIn = false,
            state.message = "Registration is successfull"
        })
        .addCase(registerUser.rejected ,(state,action)=>{
            state.isLoading = false,
            state.isError = true,
            state.message = action.payload
        })
        .addCase(getAboutUSer.fulfilled , (state,action)=>{
            state.isLoading = false,
            state.isError = false,
            state.profileFetched= true,
            state.user = action.payload.userProfile
        })
        .addCase(getAllUsers.fulfilled , (state,action)=>{
            state.isLoading = false;
            state.isError = false;
            state.all_profiles_fetched = true;
            state.all_users = action.payload.profiles
        })
        .addCase(getConnectionRequest.fulfilled , (state , action )=>{
            state.connections = action.payload
        })
        .addCase(getConnectionRequest.rejected , (state , action )=>{
            state.message = action.payload
        })
        .addCase(getMyConnectionRequests.fulfilled , (state , action )=>{
            state.connections = action.payload
        })
        .addCase(getMyConnectionRequests.rejected , (state , action )=>{
            state.message = action.payload
        })
    },

})

export const {reset , emptyMessage , setTokenIsThere , setTokenIsNotThere} = authSlice.actions;

export default authSlice.reducer;

