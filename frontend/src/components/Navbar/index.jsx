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
        <h1 className={styles.logo} onClick={()=>{
            router.push("/")
        }}>Pro connect</h1>

        {authState.profileFetched ? (
          <div className={styles.navAuthDetails}>
            <p className={styles.welcomeText}>Hey {authState.user.userId.name}</p>
            <div className={styles.navLinks}>
              <p onClick={() => router.push("/profile")} className={styles.navLink}>Profile</p>
              <p onClick={handleLogout} className={styles.navLink}>Logout</p> 
            </div>
          </div>
        ) : (
          <div className={styles.navbarOptionsContainer}>
            <div
              onClick={() => {
                router.push("/login");
              }}
              className={styles.buttonJoin}
            >
              <p>join now</p>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}

export default Navbar;
