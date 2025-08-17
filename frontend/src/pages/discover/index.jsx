import React, { useEffect } from 'react'
import UserLayout from '@/layout/userLayout'
import DashboardLayout from '@/layout/dashboardLayout'
import { useDispatch, useSelector } from 'react-redux';
import { getAllUsers } from '@/config/redux/action/authAction';
import { BASE_URL } from '@/config';
import styles from "./index.module.css"

export default function Discover() {

    const authState = useSelector((state)=>state.auth);
    const dispatch = useDispatch();

    useEffect(()=>{

        if(!authState.all_profiles_fetched){
            dispatch(getAllUsers());
        }

    } , [])

  return (
    <>
        <UserLayout>
        
      <DashboardLayout>
        <div>
          <h1>Discover</h1>

          <div className={styles.allUserProfile}>

            {authState.all_profiles_fetched && authState.all_users.map((user)=>{
              return(
                <div key={user._id} className={styles.userCard}>
                  <img className={styles.userCard_img} src={`${BASE_URL}/${user.userId.profilePicture}`} alt="profile" />
                  <div>
                    <h1>{user.userId.name}</h1>
                  <p>{user.userId.username}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DashboardLayout>


      </UserLayout>
    </>
  )
}
