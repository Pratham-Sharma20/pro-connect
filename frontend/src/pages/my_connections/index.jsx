import React, { useEffect } from "react";
import UserLayout from "@/layout/userLayout";
import DashboardLayout from "@/layout/dashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { acceptConnection, getMyConnectionRequests } from "@/config/redux/action/authAction";
import styles from "./index.module.css";
import { BASE_URL } from "@/config";
import { useRouter } from "next/router";

export default function My_Connections() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getMyConnectionRequests({ token }));
    }
  }, [dispatch]);

  const connections = authState?.connectionRequests?.connections || [];
  const loggedInUserId = authState?.user?.userId?._id;

  const getOtherUser = (connection) => {
    return connection.userId?._id === loggedInUserId
      ? connection.connectionId
      : connection.userId;
  };

  const pendingRequestsReceived = connections.filter(
    (conn) => conn.status === "pending" && (conn.connectionId?._id || conn.connectionId) === loggedInUserId
  );
  
  const pendingRequestsSent = connections.filter(
    (conn) => conn.status === "pending" && (conn.userId?._id || conn.userId) === loggedInUserId
  );
  
  const acceptedConnections = connections.filter(
    (conn) => conn.status === "accepted"
  );

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.connectionsContainer}>
          <h1 className={styles.pageHeader}>My Network</h1>

          {/* Requests Received */}
          <h2 className={styles.sectionHeader}>Invitations</h2>
          <div className={styles.cardsGrid}>
            {pendingRequestsReceived.length > 0 ? (
              pendingRequestsReceived.map((conn, index) => {
                const otherUser = getOtherUser(conn);
                return (
                  <div
                    className={styles.userCard}
                    key={index}
                    onClick={() => router.push(`/view_profile/${otherUser.username}`)}
                  >
                    <div className={styles.profileInfo}>
                      <div className={styles.profilePicture}>
                        <img
                          src={`${BASE_URL}/${otherUser.profilePicture}`}
                          alt={otherUser.name}
                        />
                      </div>
                      <div className={styles.userInfo}>
                        <h3>{otherUser.name}</h3>
                        <p>@{otherUser.username}</p>
                      </div>
                    </div>
                    <div className={styles.actions}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(
                            acceptConnection({
                              token: localStorage.getItem("token"),
                              requestId: conn._id,
                              action_type: "accept",
                            })
                          ).then(() => {
                             dispatch(getMyConnectionRequests({ token: localStorage.getItem("token") }));
                          });
                        }}
                        className={styles.acceptBtn}
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className={styles.noProfilesText}>No pending invitations.</p>
            )}
          </div>

          {/* Requests Sent */}
          <h2 className={styles.sectionHeader}>Pending Requests</h2>
          <div className={styles.cardsGrid}>
            {pendingRequestsSent.length > 0 ? (
              pendingRequestsSent.map((conn, index) => {
                const otherUser = getOtherUser(conn);
                return (
                  <div
                    className={styles.userCard}
                    key={index}
                    onClick={() => router.push(`/view_profile/${otherUser.username}`)}
                  >
                    <div className={styles.profileInfo}>
                      <div className={styles.profilePicture}>
                        <img
                          src={`${BASE_URL}/${otherUser.profilePicture}`}
                          alt={otherUser.name}
                        />
                      </div>
                      <div className={styles.userInfo}>
                        <h3>{otherUser.name}</h3>
                        <p>@{otherUser.username}</p>
                      </div>
                    </div>
                    <div className={styles.actions}>
                      <span className={styles.pendingLabel}>Pending</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className={styles.noProfilesText}>No sent requests.</p>
            )}
          </div>

          {/* Accepted Connections */}
          <h2 className={styles.sectionHeader}>My Connections</h2>
          <div className={styles.cardsGrid}>
            {acceptedConnections.length > 0 ? (
              acceptedConnections.map((conn, index) => {
                const otherUser = getOtherUser(conn);
                return (
                  <div
                    className={styles.userCard}
                    key={index}
                    onClick={() => router.push(`/view_profile/${otherUser.username}`)}
                  >
                    <div className={styles.profileInfo}>
                      <div className={styles.profilePicture}>
                        <img
                          src={`${BASE_URL}/${otherUser.profilePicture}`}
                          alt={otherUser.name}
                        />
                      </div>
                      <div className={styles.userInfo}>
                        <h3>{otherUser.name}</h3>
                        <p>@{otherUser.username}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className={styles.noProfilesText}>No connections yet. Start networking!</p>
            )}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
