// src/components/TeacherAchievements.js
import React from "react";
import AchievementsList from "./AchievementsList";
import "./TeacherDashboard.css";

export default function TeacherAchievements() {
  return (
    <div className="teacher-dashboard-container">
      <h2>Student Achievements</h2>
      <AchievementsList />
    </div>
  );
}
