
import UserLayout from "@/layout/userLayout";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./style.module.css";
import { loginUser, registerUser } from "@/config/redux/action/authAction";
import { emptyMessage } from "@/config/redux/reducer/authReducer";

function LoginComponent() {
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const [isLoginMethod , setIsLoginMethod] = useState(false);
  const dispatch = useDispatch();

  const[email , setEmailAddress] = useState("");
  const[password , setPassword ] = useState("");
  const[username , setUsername] = useState("");
  const[name , setName] = useState("");


  useEffect(() => {
    if (authState.isLoggedIn) {
      router.push("/dashboard");
    }
  }, [authState.isLoggedIn]);

  useEffect(()=>{
    dispatch(emptyMessage());
  },[isLoginMethod])

  useEffect(()=>{
    if(localStorage.getItem("token")){
        router.push("/dashboard");
    }
  },[])

  const handleRegister = ()=>{
    console.log("registering");
    dispatch(registerUser({username , password ,email , name }))
  }

  const handleLogin = ()=>{
    console.log("logging in ..");
  }

  return (
    <>
      <UserLayout>
        <div className={styles.container}>
          <div className={styles.cardContainer}>
            <div className={styles.cardContainer_left}>
              <p className={styles.cardleft_heading}>{isLoginMethod ? "sign in " : "sign up"}</p>
              {authState.message && (
                <p style={{ color: authState.isError ? "red" : "green" }}>
                    {authState.message.message || authState.message}
                </p>
               )}

              <div className={styles.inputContainer}>
                {!isLoginMethod && <div className={styles.inputRow}>
                    <input onChange={(e)=>setUsername(e.target.value)} className={styles.inputField} type="text" placeholder="Username" />
                    <input onChange={(e)=>setName(e.target.value)} className={styles.inputField} type="text" placeholder="Name" />
                </div>}
                <input onChange = {(e)=>setEmailAddress(e.target.value)} className={styles.inputField} type="text" placeholder="Email" />
                <input onChange={(e)=>setPassword(e.target.value)} className={styles.inputField} type="password" placeholder="Password" />


                <div onClick={()=>{
                    if(isLoginMethod){
                        handleLogin();
                        dispatch(loginUser({email , password}))
                    }else{
                        handleRegister();
                    }
                }} className={styles.buttonWithOutline}>
                    <p>{isLoginMethod ? "sign in " : "sign up"}</p>
                </div>
                
              </div>
            </div>
            <div className={styles.cardContainer_right}>
                <div>
                    {isLoginMethod ? <p>Dont have an account?</p> : <p>Already have an account?</p>}
        
                    <div onClick={()=>{
                    setIsLoginMethod(!isLoginMethod);
                }} style={{color : "black" , textAlign : "center"}} className={styles.buttonWithOutline}>
                    <p>{isLoginMethod ? "sign up " : "sign in"}</p>
                </div>
                </div>
            </div>
          </div>
        </div>
      </UserLayout>
    </>
  );
}

export default LoginComponent;
