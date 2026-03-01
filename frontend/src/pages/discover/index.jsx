import React, { useEffect } from 'react'
import UserLayout from '@/layout/userLayout'
import DashboardLayout from '@/layout/dashboardLayout'
import { useDispatch, useSelector } from 'react-redux';
import { getAllUsers } from '@/config/redux/action/authAction';
import { BASE_URL, formatImageUrl } from '@/config';
import styles from "./index.module.css"
import { useRouter } from 'next/router';

export default function Discover() {
    const authState = useSelector((state)=>state.auth);
    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(()=>{
        if(!authState.all_profiles_fetched){
            dispatch(getAllUsers());
        }
    } , [dispatch, authState.all_profiles_fetched])

  return (
    <>
        <UserLayout>
            <DashboardLayout>
                <div className={styles.discoverContainer}>
                    <h1 className={styles.pageHeader}>Discover People</h1>

                    <div className={styles.allUserProfile}>
                        {authState.all_profiles_fetched && authState.all_users.map((user)=>{
                            // Filter out the current user if needed (optional)
                            if (user.userId?._id === authState.user?.userId?._id) return null;

                            return(
                                <div 
                                    onClick={()=>{
                                        router.push(`view_profile/${user.userId.username}`)
                                    }} 
                                    key={user._id} 
                                    className={styles.userCard}
                                >
                                    <img 
                                        className={styles.userCard_img} 
                                        src={formatImageUrl(user.userId.profilePicture)} 
                                        alt="profile" 
                                    />
                                    <div>
                                        <h1>{user.userId.name}</h1>
                                        <p>@{user.userId.username}</p>
                                    </div>
                                    <button className={styles.viewBtn}>View Profile</button>
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
