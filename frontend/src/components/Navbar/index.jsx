import React from "react";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { reset } from "@/config/redux/reducer/authReducer";

function Navbar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state)=>state.auth);

  const handleLogout= ()=>{
    localStorage.removeItem("token");
    dispatch(reset());
    router.push("/login");
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <h1 style={{cursor:"pointer"}} onClick={()=>{
            router.push("/")
        }}>Pro connect</h1>

        {authState.profileFetched && <div>

          <div style={{display:"flex" , gap:"1.2rem"}}>
            <p>Hey {authState.user.userId.name}</p>
            <p style={{fontWeight:"bold" , cursor:"pointer"}}>Profile</p>
            <p onClick={handleLogout} style={{fontWeight:"bold" , cursor:"pointer"}}>Logout</p> 
          </div>

          </div>}


        {!authState.profileFetched && <div className={styles.navbarOptionsContainer}>
          <div
            onClick={() => {
              router.push("/login");
            }}
            className={styles.buttonJoin}
          >
            <p>join now</p>
          </div>
        </div>}
      </nav>
    </div>
  );
}

export default Navbar;
