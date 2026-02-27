import React, { useEffect } from "react";
import { BASE_URL, clientServer } from "@/config";
import DashboardLayout from "@/layout/dashboardLayout";
import UserLayout from "@/layout/userLayout";
import styles from "./styles.module.css";
import { useDispatch, useSelector } from "react-redux";
import { acceptConnection, getMyConnectionRequests, sendConnectionRequest } from "@/config/redux/action/authAction";

export default function ProfileComponent({ userProfile, userPosts }) {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMyConnectionRequests({ token: localStorage.getItem("token") }));
  }, [dispatch]);

  const getButtonState = () => {
    if (!authState?.connectionRequests?.connections || !userProfile?.userId?._id) {
      return { status: "none", action: "connect" };
    }

    const profileUserId = userProfile.userId._id;
    const loggedInUserId = authState?.user?.userId?._id;

    if (!loggedInUserId) return { status: "none", action: "connect" };
    if (profileUserId === loggedInUserId) return { status: "self", action: "none" };

    const connection = authState.connectionRequests.connections.find((conn) => {
      const connId = typeof conn.connectionId === "string" ? conn.connectionId : conn.connectionId?._id;
      const uId = typeof conn.userId === "string" ? conn.userId : conn.userId?._id;
      return (connId === profileUserId && uId === loggedInUserId) || (connId === loggedInUserId && uId === profileUserId);
    });

    if (!connection) {
      return { status: "none", action: "connect" };
    }

    if (connection.status === "accepted") {
      return { status: "accepted", action: "none" };
    }

    if (connection.status === "pending") {
      const senderId = typeof connection.userId === "string" ? connection.userId : connection.userId?._id;
      if (senderId === loggedInUserId) {
        return { status: "pending_sent", action: "none" };
      } else {
        return { status: "pending_received", action: "accept", requestId: connection._id };
      }
    }

    return { status: "none", action: "connect" };
  };

  const buttonConfig = getButtonState();

  const handleConnectionAction = async () => {
    try {
      const token = localStorage.getItem("token");
      if (buttonConfig.action === "connect") {
        await dispatch(
          sendConnectionRequest({
            token: token,
            userId: userProfile.userId._id, 
          })
        );
      } else if (buttonConfig.action === "accept") {
        await dispatch(
          acceptConnection({
            token: token,
            requestId: buttonConfig.requestId,
            action_type: "accept",
          })
        );
      }

      await dispatch(getMyConnectionRequests({ token }));
    } catch (error) {
      console.error("Error with connection action:", error);
    }
  };

  const renderConnectionButton = () => {
    if (buttonConfig.status === "self") return null;

    switch (buttonConfig.status) {
      case "accepted":
        return <button className={styles.connectedBtn} disabled>Connected</button>;
      case "pending_sent":
        return <button className={styles.connectedBtn} disabled>Pending Request</button>;
      case "pending_received":
         return <button onClick={handleConnectionAction} className={styles.connectBtn}>Accept Request</button>;
      case "none":
      default:
        return (
          <button onClick={handleConnectionAction} className={styles.connectBtn}>
            Connect
          </button>
        );
    }
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>Profile</div>
        <div className={styles.backDropContainer}>
          <img
            src={`${BASE_URL}/${userProfile?.userId?.profilePicture || "default.png"}`}
            alt="profile"
          />
        </div>

        <div className={styles.profileContainer_details}>
          <div className={styles.userDetails}>
            <h2>{userProfile?.userId?.name || "User"}</h2>
            <p className={styles.username}>@{userProfile?.userId?.username || "username"}</p>
            
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
              {renderConnectionButton()}
              
              <div
                className={styles.downloadBtn}
                title="Download Profile PDF"
                onClick={async () => {
                  const response = await clientServer.get(
                    `/user/download_profile?id=${userProfile.userId._id}`
                  );
                  window.open(`${BASE_URL}/${response.data.outputPath}`, "_blank");
                }}
              >
                <svg
                  style={{ width: "1.5rem" }}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
              </div>
            </div>

            <p className={styles.bio}>{userProfile.bio || "No bio yet."}</p>
          </div>

          <div style={{ display: "flex", gap: "3rem", marginTop: "2rem" }}>
            <div style={{ flex: "0.7" }}>
              <h4 className={styles.sectionTitle}>Work History</h4>
              <div className={styles.workHistoryContainer}>
                {userProfile.pastWork && userProfile.pastWork.length > 0 ? (
                  userProfile.pastWork.map((work, index) => (
                    <div key={index} className={styles.workHistoryCard}>
                      <p style={{fontWeight: "bold", color: "#1a1a1a", marginBottom: "0.4rem"}}>
                        {work.company}
                      </p>
                      <p style={{color: "#035db7", fontWeight: "600", marginBottom: "0.3rem"}}>
                        {work.position}
                      </p>
                      <p style={{fontSize: "0.85rem", color: "#888"}}>
                        {work.years}
                      </p>
                    </div>
                  ))
                ) : (
                  <p style={{color: "#999", fontStyle: "italic"}}>No work history listed.</p>
                )}
              </div>
            </div>

            <div style={{ flex: "0.3" }}>
              <h4 className={styles.sectionTitle}>Recent Activity</h4>
              <div className={styles.recentActivity}>
                {userPosts && userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <div key={post._id} className={styles.postCard}>
                      <div className={styles.card_profileContainer}>
                        {post.media && (
                          <img src={`${BASE_URL}/${post.media}`} alt="img" />
                        )}
                      </div>
                      <p style={{fontSize: "0.9rem", color: "#444"}}>{post.body}</p>
                    </div>
                  ))
                ) : (
                  <p style={{color: "#999", fontStyle: "italic"}}>No recent activity.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
