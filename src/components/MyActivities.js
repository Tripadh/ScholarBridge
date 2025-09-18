import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import ActivityForm from "./ActivityForm";
import "./MyActivities.css";

const MyActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editActivityId, setEditActivityId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
   
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const q = query(
      collection(db, "activities"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setActivities(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const startEdit = (activity) => {
    setEditActivityId(activity.id);
  };

  const cancelEdit = () => {
    setEditActivityId(null);
  };

  const saveEdit = async (editData) => {
    if (!editData.title || !editData.date) {
      showToast("⚠️ Title and Date are required.", "error");
      return;
    }

    setIsUpdating(true);
    try {
      const docRef = doc(db, "activities", editActivityId);
      await updateDoc(docRef, {
        title: editData.title,
        type: editData.type,
        description: editData.description,
        date: editData.date,
      });

      showToast("✅ Activity updated successfully!", "success");
      cancelEdit();
    } catch (error) {
      console.error("Update failed:", error);
      showToast("❌ Failed to update activity.", "error");
    }
    setIsUpdating(false);
  };

  const deleteActivity = async (id) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;
    try {
      await deleteDoc(doc(db, "activities", id));
      showToast("✅ Activity deleted successfully!", "success");
    } catch (error) {
      console.error("Delete failed:", error);
      showToast("❌ Failed to delete activity.", "error");
    }
  };

  const showToast = (message, type) => {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getActivityIcon = (type) => (type === "academic" ? "📚" : "🎯");

  const getActivityColorClass = (type) => (type === "academic" ? "activity-academic" : "activity-cocurricular");

  if (loading) {
    return (
      <div className="card loading-card">
        <div className="spinner"></div>
        <p>Loading your activities...</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="card empty-card">
        <svg
          className="empty-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3>No activities yet</h3>
        <p>Start by adding your first activity above!</p>
      </div>
    );
  }

  return (
    <div className="card my-activities-card">
      <div className="card-header">
        <h2>My Activities</h2>
        <p>
          {activities.length} activit{activities.length !== 1 ? "ies" : "y"} recorded
        </p>
      </div>
      <div className="card-body">
        {activities.map((activity, idx) => (
          <div key={activity.id} className="activity-item" style={{ animationDelay: `${idx * 100}ms` }}>
            {editActivityId === activity.id ? (
              <div className="activity-edit-form">
                <h4>Edit Activity</h4>
                <ActivityForm onSubmit={saveEdit} initialData={activity} isSubmitting={isUpdating} onCancel={cancelEdit} />
              </div>
            ) : (
              <div className="activity-display">
                <div className={`activity-icon ${getActivityColorClass(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="activity-info">
                  <h3>{activity.title}</h3>
                  <div className="activity-meta">
                    <span className="activity-type">{activity.type === "academic" ? "Academic" : "Co-Curricular"}</span>
                    <span className="activity-date">{formatDate(activity.date)}</span>
                  </div>
                  {activity.description && <p className="activity-description">{activity.description}</p>}
                </div>
                <div className="activity-actions">
                  <button onClick={() => startEdit(activity)} aria-label="Edit Activity" title="Edit Activity" className="btn action-btn edit-btn">
                    ✏️
                  </button>
                  <button onClick={() => deleteActivity(activity.id)} aria-label="Delete Activity" title="Delete Activity" className="btn action-btn delete-btn">
                    🗑️
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyActivities;
