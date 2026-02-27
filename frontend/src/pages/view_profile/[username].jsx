import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { clientServer } from "@/config";
import { getAllPosts } from "@/config/redux/action/postAction";
import ProfileComponent from "@/components/ProfileComponent";

export default function ViewProfilePage({ userProfile }) {
  const router = useRouter();
  const postReducer = useSelector((state) => state.postReducer);
  const dispatch = useDispatch();
  const [userPosts, setUserPosts] = useState([]);

  const getUsersPost = async () => {
    await dispatch(getAllPosts());
  };

  useEffect(() => {
    let post = postReducer.posts.filter((post) => {
      return post.userId?.username === router.query.username;
    });
    setUserPosts(post);
  }, [postReducer.posts, router.query.username]);

  useEffect(() => {
    getUsersPost();
  }, []);

  return (
    <ProfileComponent userProfile={userProfile} userPosts={userPosts} />
  );
}

export async function getServerSideProps(context) {
  const request = await clientServer.get(
    "/user/get_profile_based_on_username",
    {
      params: {
        username: context.query.username,
      },
    }
  );

  return { props: { userProfile: request.data.data.userProfile } };
}
