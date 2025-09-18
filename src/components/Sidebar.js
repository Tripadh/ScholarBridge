import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ open }) => {
  const location = useLocation();

  return (
    <aside className={`sidebar ${open ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <span role="img" aria-label="app">Student Panel</span>
      </div>
      <nav>
        <ul>
          <li className={location.pathname === "/dashboard" ? "active" : ""}>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li className={location.pathname === "/activity-records" ? "active" : ""}>
            <Link to="/activity-records">Activity Records</Link>
          </li>
          <li className={location.pathname === "/achievements" ? "active" : ""}>
            <Link to="/achievements">Achievements</Link>
          </li>
          <li className={location.pathname === "/certificates" ? "active" : ""}>
            <Link to="/certificates">Certificates</Link>
          </li>
          <li className={location.pathname === "/events" ? "active" : ""}>
            <Link to="/events">Events</Link>
          </li>
          <li className={location.pathname === "/Goals" ? "active" : ""}>
            <Link to="/Goals">Goals</Link>
          </li>
        </ul>
      </nav>
      <div className="sidebar-bottom">
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
        <a href="#help">Help</a>
      </div>
    </aside>
  );
};

export default Sidebar;
