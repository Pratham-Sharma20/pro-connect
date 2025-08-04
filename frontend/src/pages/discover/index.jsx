import React, { useEffect } from 'react'
import UserLayout from '@/layout/userLayout'
import DashboardLayout from '@/layout/dashboardLayout'
import { useDispatch, useSelector } from 'react-redux';
import { getAllUsers } from '@/config/redux/action/authAction';

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
        </div>
      </DashboardLayout>


      </UserLayout>
    </>
  )
}
