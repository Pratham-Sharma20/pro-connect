import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clientServer } from "@/config";
import { getAllPosts } from "@/config/redux/action/postAction";
import ProfileComponent from "@/components/ProfileComponent";

export default function MyProfilePage() {
  const postReducer = useSelector((state) => state.postReducer);
  const dispatch = useDispatch();
  
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndPosts = async () => {
    try {
      setLoading(true);
      
      const request = await clientServer.get("/profile/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      setUserProfile(request.data.data.userProfile);

      await dispatch(getAllPosts());
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile?.userId?.username && postReducer.posts) {
      let post = postReducer.posts.filter((post) => {
        return post.userId?.username === userProfile.userId.username;
      });
      setUserPosts(post);
    }
  }, [postReducer.posts, userProfile]);

  useEffect(() => {
    fetchProfileAndPosts();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p>Could not load profile. Please try again later.</p>
      </div>
    );
  }

  return <ProfileComponent userProfile={userProfile} userPosts={userPosts} />;
}
