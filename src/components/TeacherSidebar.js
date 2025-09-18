// src/components/TeacherSidebar.js
import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css"; // or your custom teacher CSS

export default function TeacherSidebar({ open, onClose }) {
  return (
    <aside className={`sidebar teacher-sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">Teacher Panel</h2>
      </div>

      <nav className="sidebar-links">
        <ul>
          <li>
            <Link to="/teacher-certificates" onClick={onClose} className="sidebar-link">
              Student Certificates
            </Link>
          </li>
          <li>
            <Link to="/teacher-achievements" onClick={onClose} className="sidebar-link">
              Student Achievements
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
