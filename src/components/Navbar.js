import React, { useEffect, useState } from "react";
import "./Navbar.css";

const Navbar = ({ user, onMenuClick, onSignOut }) => {
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    async function fetchUserName() {
      if (!user?.uid) return;

      try {
        // Dynamically import Firestore to avoid errors if db not passed
        const { doc, getDoc } = await import("firebase/firestore");
        const { db } = await import("../firebase");

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().name) {
          setUserName(userDoc.data().name);
        } else if (user.displayName) {
          setUserName(user.displayName);
        } else if (user.email) {
          setUserName(user.email.split("@")[0]);
        } else {
          setUserName("User");
        }
      } catch (err) {
        setUserName("User");
      }
    }
    fetchUserName();
  }, [user]);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">
          <span role="img" aria-label="app">🎓 ScholarBridge</span>
        </div>
        <button
          className="navbar-menu"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          
        </button>
      </div>
      <div className="navbar-right">
        <div className="navbar-profile-wrap">
          <button className="navbar-profile" aria-label="User profile">
            <span className="navbar-avatar-dot"></span>
            <span className="navbar-profile-label">{userName}</span>
          </button>
          <button className="navbar-signout-btn" onClick={onSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
