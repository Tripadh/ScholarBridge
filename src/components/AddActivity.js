import React, { useState, useRef, useEffect } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import "./AddActivity.css";

const AddActivity = () => {
  const [type, setType] = useState("academic");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const validate = () => {
    if (!title.trim()) return "Title is required";
    if (!date) return "Date is required";
    return "";
  };

  const resetForm = () => {
    setType("academic");
    setTitle("");
    setDescription("");
    setDate("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errorMsg = validate();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }
    setError("");
    setLoading(true);
    try {
      await addDoc(collection(db, "activities"), {
        userId: auth.currentUser.uid,
        type,
        title,
        description,
        date,
        createdAt: serverTimestamp(),
      });
      resetForm();
      setSuccess("Activity added successfully!");
    } catch (e) {
      setError("Failed to add activity.");
    }
    setLoading(false);
  };

  return (
    <form className="add-activity-form" onSubmit={handleSave} noValidate>
      <h3>Add New Activity</h3>

      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message" onClick={() => setSuccess("")}>
          {success} (click to dismiss)
        </div>
      )}

      <label>
        Activity Type
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="academic">Academic</option>
          <option value="co-curricular">Co-Curricular</option>
        </select>
      </label>

      <label>
        Title
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter activity title"
          required
        />
      </label>

      <label>
        Description (max 200 chars)
        <textarea
          value={description}
          maxLength={200}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          rows={3}
        />
        <small>{200 - description.length} characters remaining</small>
      </label>

      <label>
        Date
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Activity"}
      </button>
    </form>
  );
};

export default AddActivity;
