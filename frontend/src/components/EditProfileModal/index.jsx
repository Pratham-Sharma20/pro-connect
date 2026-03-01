import React, { useState } from "react";
import styles from "./styles.module.css";
import { clientServer } from "@/config";

export default function EditProfileModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(initialData?.userId?.name || "");
  const [username, setUsername] = useState(initialData?.userId?.username || "");
  const [bio, setBio] = useState(initialData?.bio || "");
  const [currentPost, setCurrentPost] = useState(initialData?.currentPost || "");
  const [pastWork, setPastWork] = useState(initialData?.pastWork || []);
  const [profilePicture, setProfilePicture] = useState(null);

  if (!isOpen) return null;

  const handleAddWork = () => {
    setPastWork([
      ...pastWork,
      { company: "", position: "", years: "" },
    ]);
  };

  const handleRemoveWork = (index) => {
    const updatedWork = [...pastWork];
    updatedWork.splice(index, 1);
    setPastWork(updatedWork);
  };

  const handleWorkChange = (index, field, value) => {
    const updatedWork = [...pastWork];
    updatedWork[index][field] = value;
    setPastWork(updatedWork);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      // 1. Update Profile File if changed
      if (profilePicture) {
        const formData = new FormData();
        formData.append("profilePicture", profilePicture);
        await clientServer.post("/update_profile_picture", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // 2. Update User Core Data (Name, Username)
      if (
        name !== initialData?.userId?.name ||
        username !== initialData?.userId?.username
      ) {
        await clientServer.post(
          "/user_update",
          { name, username },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // 3. Update Profile Data (Bio, Current Post, Past Work)
      await clientServer.post(
        "/update_profile_data",
        { bio, currentPost, pastWork },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSuccess(); // Close and trigger refetch
    } catch (err) {
      console.error("Failed to update profile", err);
      alert(err?.response?.data?.message || "Failed to update profile. Please check if username is already taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Edit Profile</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.inputGroup}>
            <label>Profile Picture</label>
            <input type="file" accept="image/*" className={styles.fileInput} onChange={handleFileChange} />
            {profilePicture && (
              <div style={{ marginTop: "0.5rem", position: "relative", display: "inline-block" }}>
                <img 
                  src={URL.createObjectURL(profilePicture)} 
                  alt="preview" 
                  style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "2px solid #035db7" }} 
                />
                <button 
                  onClick={() => setProfilePicture(null)}
                  style={{ position: "absolute", top: "0", right: "0", background: "red", color: "white", borderRadius: "50%", border: "none", cursor: "pointer", width: "20px", height: "20px", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}
                  type="button"
                >
                  &times;
                </button>
              </div>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. johndoe"
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Current Position</label>
            <input
              type="text"
              value={currentPost}
              onChange={(e) => setCurrentPost(e.target.value)}
              placeholder="e.g. Software Engineer at Google"
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Bio</label>
            <textarea
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short bio about yourself..."
            ></textarea>
          </div>

          <h4 className={styles.sectionTitle}>Work History</h4>
          {pastWork.map((work, index) => (
            <div key={index} className={styles.workHistoryItem}>
              <button
                className={styles.removeWorkBtn}
                onClick={() => handleRemoveWork(index)}
              >
                Remove
              </button>
              <div className={styles.inputGroup} style={{ marginBottom: "0.5rem" }}>
                <label>Company</label>
                <input
                  type="text"
                  value={work.company}
                  onChange={(e) =>
                    handleWorkChange(index, "company", e.target.value)
                  }
                  placeholder="Company Name"
                />
              </div>
              <div className={styles.inputGroup} style={{ marginBottom: "0.5rem" }}>
                <label>Position</label>
                <input
                  type="text"
                  value={work.position}
                  onChange={(e) =>
                    handleWorkChange(index, "position", e.target.value)
                  }
                  placeholder="Job Title"
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Years</label>
                <input
                  type="text"
                  value={work.years}
                  onChange={(e) => handleWorkChange(index, "years", e.target.value)}
                  placeholder="e.g. 2020 - 2022"
                />
              </div>
            </div>
          ))}

          <button className={styles.addWorkBtn} onClick={handleAddWork}>
            + Add Work Experience
          </button>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
