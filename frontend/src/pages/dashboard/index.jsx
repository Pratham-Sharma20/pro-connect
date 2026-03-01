import { getAboutUSer, getAllUsers } from "@/config/redux/action/authAction";
import {
  createPost,
  deletePost,
  getAllComments,
  getAllPosts,
  incrementPostLikes,
  postComment,
} from "@/config/redux/action/postAction";
import DashboardLayout from "@/layout/dashboardLayout";
import UserLayout from "@/layout/userLayout";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";
import { BASE_URL, formatImageUrl } from "@/config";
import { resetPostId } from "@/config/redux/reducer/postReducer";

export default function DashboardComponent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.postReducer);

  const [postContent, setPostContent] = useState("");
  const [fileContent, setFileContent] = useState();
  const [commentText, setCommentText] = useState("");

  const handleUpload = async () => {
    await dispatch(createPost({ file: fileContent, body: postContent }));
    setPostContent("");
    setFileContent(null);
    dispatch(getAllPosts());
  };

  useEffect(() => {
    if (authState.isTokenThere) {
      dispatch(getAllPosts());
    }

    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.isTokenThere, dispatch, authState.all_profiles_fetched]);

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
                  src={formatImageUrl(authState.user.userId.profilePicture)}
                  alt="Profile"
                  style={{width: "50px", height: "50px", borderRadius: "50%"}}
                />
                <textarea
                  className={styles.postTextarea}
                  placeholder="Share your thoughts..."
                  onChange={(e) => setPostContent(e.target.value)}
                  value={postContent}
                />
              </div>
              <div className={styles.postActions}>
                <label
                  htmlFor="fileUpload"
                  className={styles.fileUploadLabel}
                >
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
                
                {postContent.length > 0 && (
                  <div style={{marginLeft: "auto"}}>
                    <button onClick={handleUpload} className={styles.postButton}>
                      Post
                    </button>
                  </div>
                )}
              </div>
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
                            src={formatImageUrl(post.userId.profilePicture)}
                            alt="profile"
                            style={{width: "45px", height: "45px", borderRadius: "50%", objectFit: "cover"}}
                          />
                        )}
                        <div className={styles.userDetails}>
                          <p className={styles.username}>
                            {post.userId?.name || post.userId?.username || "Unknown User"}
                          </p>
                          <p className={styles.userHandle}>
                            @{post.userId?.username?.toLowerCase() || "unknown"}
                          </p>
                        </div>
                      </div>
                      
                      {post.userId._id === authState.user.userId._id && (
                        <div
                          onClick={async () => {
                            await dispatch(deletePost({ post_id: post._id }));
                            await dispatch(getAllPosts());
                          }}
                          style={{color: "#ff4d4d", cursor: "pointer"}}
                        >
                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className={styles.postContent}>
                      <p className={styles.postText}>{post.body}</p>
                      {post.media && (
                        ['mp4', 'webm', 'mov'].includes(post.fileType) ? (
                          <video
                            className={styles.postMedia}
                            controls
                            src={formatImageUrl(post.media)}
                            alt="Post media"
                          />
                        ) : (
                          <img
                            className={styles.postMedia}
                            src={formatImageUrl(post.media)}
                            alt="Post media"
                          />
                        )
                      )}
                    </div>

                    <div className={styles.postFooter}>
                      <div
                        onClick={async () => {
                          await dispatch(incrementPostLikes({ post_id: post._id }));
                          dispatch(getAllPosts());
                        }}
                        className={`${styles.actionItem} ${
                          post.likedBy?.includes(authState.user.userId._id) ? styles.liked : ""
                        }`}
                      >
                        <svg fill={post.likedBy?.includes(authState.user.userId._id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>
                        <span>{post.likes} Likes</span>
                      </div>
                      
                      <div
                        onClick={() => dispatch(getAllComments({ post_id: post._id }))}
                        className={styles.actionItem}
                      >
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                        </svg>
                        <span>{post.comments} Comments</span>
                      </div>
                      
                      <div
                        onClick={() => {
                          const text = encodeURIComponent(post.body);
                          const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
                          window.open(twitterUrl, "_blank");
                        }}
                        className={styles.actionItem}
                      >
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                        </svg>
                        <span>Share</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {postState.postId !== "" && (
            <div
              onClick={() => dispatch(resetPostId())}
              className={styles.commentsContainer}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className={styles.allCommentsContainer}
              >
                <div style={{ flex: 1, overflowY: "auto", marginBottom: "1rem" }}>
                  {postState.comments.length === 0 ? (
                    <h3 style={{textAlign: "center", color: "#999", marginTop: "2rem"}}>No Comments Yet</h3>
                  ) : (
                    postState.comments.map((comment, index) => (
                      <div className={styles.singleComment} key={comment._id || index}>
                        <img
                          src={formatImageUrl(comment.userId?.profilePicture)}
                          alt=""
                        />
                        <div>
                          <p style={{ fontWeight: "700", marginBottom: "0.2rem" }}>
                            {comment.userId?.name || "Unknown User"}
                          </p>
                          <p style={{ fontSize: "0.85rem", color: "#666" }}>{comment.body}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className={styles.postCommentContainer}>
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                  />
                  <div
                    onClick={async () => {
                      if (!commentText.trim()) return;
                      await dispatch(postComment({ post_id: postState.postId, body: commentText }));
                      await dispatch(getAllComments({ post_id: postState.postId }));
                      setCommentText("");
                    }}
                    className={styles.commentBtn}
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DashboardLayout>
      </UserLayout>
    );
  } else {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className={styles.loadingContainer}>
            <h2>Loading your feed...</h2>
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  }
}
