import { BASE_URL, clientServer } from "@/config";
import DashboardLayout from "@/layout/dashboardLayout";
import UserLayout from "@/layout/userLayout";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  getConnectionRequest,
  sendConnectionRequest,
} from "@/config/redux/action/authAction";
import { getAllPosts } from "@/config/redux/action/postAction";

export default function ViewProfilePage({ userProfile }) {
  const router = useRouter();
  const postReducer = useSelector((state) => state.postReducer);
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
  const [userPosts, setUserPosts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("none"); // "none", "pending", "accepted"

  const getUsersPost = async () => {
    await dispatch(getAllPosts());
    await dispatch(
      getConnectionRequest({ token: localStorage.getItem("token") })
    );
  };

  useEffect(() => {
    let post = postReducer.posts.filter((post) => {
      return post.userId.username === router.query.username;
    });
    setUserPosts(post);
  }, [postReducer.posts]);

  useEffect(() => {
    console.log(
      "All Connections:",
      authState?.connections,
      "Profile User ID:",
      userProfile?.userId?._id
    );

    // Reset connection status
    setConnectionStatus("none");

    if (authState?.connections?.length && userProfile?.userId?._id) {
      const profileUserId = userProfile.userId._id;

      // Find any connection involving the profile user
      const connection = authState.connections.find((conn) => {
        // Handle both string and object cases for connectionId and userId
        const connectionId =
          typeof conn.connectionId === "string"
            ? conn.connectionId
            : conn.connectionId?._id;

        const userId =
          typeof conn.userId === "string" ? conn.userId : conn.userId?._id;

        // Check if profile user is involved in this connection
        const isProfileUserInConnection =
          connectionId === profileUserId || userId === profileUserId;

        console.log("Checking connection:", {
          connectionId,
          userId,
          profileUserId,
          isMatch: isProfileUserInConnection,
          status: conn.status,
        });

        return isProfileUserInConnection;
      });

      if (connection) {
        // Set status based on connection status
        setConnectionStatus(connection.status);
        console.log("Connection found with status:", connection.status);
      } else {
        setConnectionStatus("none");
        console.log("No connection found with profile user");
      }
    } else {
      console.log("No connections or profile user ID available");
    }
  }, [authState?.connections, userProfile?.userId?._id]);

  useEffect(() => {
    getUsersPost();
  }, []);

  const handleConnectionRequest = async () => {
    try {
      console.log("Sending connection request to:", userProfile.userId._id);

      // Send the connection request
      await dispatch(
        sendConnectionRequest({
          token: localStorage.getItem("token"),
          userId: userProfile.userId._id, // Make sure this matches your backend
        })
      );

      // Immediately fetch updated connections after sending request
      await dispatch(
        getConnectionRequest({
          token: localStorage.getItem("token"),
        })
      );

      console.log("Connection request sent successfully");
    } catch (error) {
      console.error("Error sending connection request:", error);
    }
  };

  const renderConnectionButton = () => {
    console.log("Rendering button for status:", connectionStatus);

    switch (connectionStatus) {
      case "accepted":
        return (
          <button className={styles.connectedBtn} disabled>
            Connected
          </button>
        );
      case "pending":
        return (
          <button className={styles.connectedBtn} disabled>
            Pending
          </button>
        );
      case "none":
      default:
        return (
          <button
            onClick={handleConnectionRequest}
            className={styles.connectBtn}
          >
            Connect
          </button>
        );
    }
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>{userProfile.userId.name}</div>
        <div className={styles.backDropContainer}>
          <img
            className={styles.backDrop}
            src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
            alt="backdrop"
          />
        </div>

        <div className={styles.profileContainer_details}>
          <div style={{ display: "flex", gap: "0.7rem" }}>
            <div style={{ flex: "0.8" }}>
              <div
                style={{
                  display: "flex",
                  width: "fit-content",
                  alignItems: "center",
                  gap: "1.2rem",
                }}
              >
                <h2>{userProfile.userId.name}</h2>
                <p style={{ color: "grey" }}> @{userProfile.userId.username}</p>
              </div>

              {/* Debug info - remove this in production
              <div style={{ fontSize: '12px', color: 'gray', marginBottom: '10px' }}>
                Debug: Status = {connectionStatus}, Connections = {authState?.connections?.length || 0}
              </div> */}

              {/* Render connection button based on status */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}
              >
                {renderConnectionButton()}
                <div
                  onClick={async () => {
                    const response = await clientServer.get(`/user/download_profile?id=${userProfile.userId._id}`);

                    window.open(
                      `${BASE_URL}/${response.data.outputPath}`,
                      "_blank"
                    );
                  }}
                >
                  <svg
                    style={{ width: "1.2em", cursor: "pointer" }}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                </div>
              </div>

              <div>
                <p>{userProfile.bio}</p>
              </div>
            </div>

            <div style={{ flex: "0.2" }}>
              <h3>Recent Activity</h3>
              {userPosts.map((post) => {
                return (
                  <div key={post._id} className={styles.postCard}>
                    <div className={styles.card}>
                      <div className={styles.card_profileContainer}>
                        {post.media !== "" ? (
                          <img src={`${BASE_URL}/${post.media}`} alt="img" />
                        ) : (
                          <div
                            style={{ width: "3.4rem", height: "3.4rem" }}
                          ></div>
                        )}
                      </div>
                      <p>{post.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="workHistory">
            <h4>Work History</h4>

            <div className={styles.workHistoryContainer}>
              {userProfile.pastWork.map((work, index) => {
                return (
                  <div key={index} className={styles.workHistoryCard}>
                    <p
                      style={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.8rem",
                      }}
                    >
                      {work.company} - {work.position}
                    </p>
                    <p>{work.years}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export async function getServerSideProps(context) {
  console.log("from view");
  console.log(context.query.username);

  const request = await clientServer.get(
    "/user/get_profile_based_on_username",
    {
      params: {
        username: context.query.username,
      },
    }
  );

  const response = await request.data;
  console.log(response);
  return { props: { userProfile: request.data.userProfile } };
}
