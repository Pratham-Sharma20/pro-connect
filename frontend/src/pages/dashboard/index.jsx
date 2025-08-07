import { getAboutUSer, getAllUsers } from "@/config/redux/action/authAction";
import { createPost, deletePost, getAllPosts } from "@/config/redux/action/postAction";
import DashboardLayout from "@/layout/dashboardLayout";
import UserLayout from "@/layout/userLayout";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";
import { BASE_URL } from "@/config";

export default function DashboardComponent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.postReducer);

  const [postContent, setPostContent] = useState("");
  const [fileContent, setFileContent] = useState();

  const handleUpload = async () => {
    await dispatch(createPost({ file: fileContent, body: postContent }));
    setPostContent("");
    setFileContent(null);
    dispatch(getAllPosts())
  };

  useEffect(() => {
    if (authState.isTokenThere) {
      dispatch(getAllPosts());
      dispatch(getAboutUSer({ token: localStorage.getItem("token") }));
    }

    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.isTokenThere]);

  if (authState.user?.userId?.profilePicture) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className={styles.scrollContainer}>
            {/* Create Post Section */}
            <div className={styles.createPostCard}>
              <div className={styles.createPostHeader}>
                <img
                  className={styles.userProfile}
                  src={`${BASE_URL}/${authState.user.userId.profilePicture}`}
                  alt="Profile"
                />
                <textarea
                  className={styles.postTextarea}
                  placeholder="What's in your mind?"
                  onChange={(e) => setPostContent(e.target.value)}
                  value={postContent}
                />
                <div className={styles.postActions}>
                  <label htmlFor="fileUpload" className={styles.fileUploadLabel}>
                    <div className={styles.addButton}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                    </div>
                  </label>
                  <input
                    onChange={(e) => setFileContent(e.target.files[0])}
                    type="file"
                    hidden
                    id="fileUpload"
                  />
                </div>
              </div>
              {postContent.length > 0 && (
                <div className={styles.postButtonContainer}>
                  <button onClick={handleUpload} className={styles.postButton}>
                    Post
                  </button>
                </div>
              )}
            </div>

            {/* Posts Feed */}
            <div className={styles.feedContainer}>
              {Array.isArray(postState.posts) &&
                postState.posts.map((post) => (
                  <div key={post._id} className={styles.postCard}>
                    <div className={styles.postHeader}>
                      <div className={styles.userInfo}>
                        {post.userId && (
                          <img
                            className={styles.userProfile}
                            src={`${BASE_URL}/${post.userId.profilePicture}`}
                            alt={`${post.userId.username}'s profile`}
                          />
                        )}
                        <div className={styles.userDetails}>
                          <p className={styles.username}>{post.userId.username}</p>
                          <p className={styles.userHandle}>@{post.userId.username.toLowerCase()}</p>
                        </div>
                      </div>
                      {post.userId._id === authState.user.userId._id && (
                        <div 
                          onClick={async () => {
                            await dispatch(deletePost({ post_id: post._id }));
                            await dispatch(getAllPosts());
                          }} 
                          className={styles.deleteButton}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className={styles.postContent}>
                      <p className={styles.postText}>{post.body}</p>
                      {post.media && (
                        <img
                          className={styles.postMedia}
                          src={`${BASE_URL}/${post.media}`}
                          alt="Post media"
                        />
                      )}
                    </div>

                    <div className={styles.postFooter}>
                      <div className={styles.likeSection}>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          strokeWidth={1.5} 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" 
                          />
                        </svg>
                        <span className={styles.likeCount}>{post.likes}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  } else {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className={styles.loadingContainer}>
            <h2>Loading...</h2>
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  }
}