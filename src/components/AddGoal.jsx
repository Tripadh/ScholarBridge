import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase"; // adjust path according to your project
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";
import "./AddGoal.css";

const AddGoal = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Pending");
  const [goals, setGoals] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const goalsRef = collection(db, "goals");
    const q = query(goalsRef, where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goalsList = [];
      snapshot.forEach((doc) => {
        goalsList.push({ id: doc.id, ...doc.data() });
      });
      setGoals(goalsList);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("User not authenticated");
      return;
    }

    const newGoal = {
      userId: user.uid,
      title,
      description,
      targetDate,
      priority,
      status,
      createdAt: new Date(),
    };

    try {
      await addDoc(collection(db, "goals"), newGoal);
      setTitle("");
      setDescription("");
      setTargetDate("");
      setPriority("Medium");
      setStatus("Pending");
    } catch (error) {
      console.error("Error adding goal:", error);
      alert("Failed to add goal, please try again.");
    }
  };

  return (
    <div className="add-goal-container">
      <h2>Add New Goal</h2>
      <form onSubmit={handleSubmit} className="add-goal-form">
        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Goal title"
          />
        </label>

        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Goal description"
            rows={4}
          />
        </label>

        <label>
          Target Date
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            required
          />
        </label>

        <label>
          Priority
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </label>

        <label>
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </label>

        <button type="submit">
          Add Goal
        </button>
      </form>

      <div className="goals-list">
        <h3>Your Goals</h3>
        {goals.length === 0 && <p>No goals added yet.</p>}
        {goals.map((goal) => (
          <div key={goal.id} className="goal-card">
            <div className="goal-title">{goal.title}</div>
            <div className="goal-status">{goal.status}</div>
            <div className="goal-desc">{goal.description}</div>
            <div className="goal-info">
              <small>Due by: {goal.targetDate}</small>
              <small>Priority: {goal.priority}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddGoal;
