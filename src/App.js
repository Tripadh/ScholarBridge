import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import TeacherSidebar from "./components/TeacherSidebar";
import Dashboard from "./components/Dashboard";
import AddActivity from "./components/AddActivity";
import MyActivities from "./components/MyActivities";
import Certificates from "./components/Certificates";
import Achievements from "./components/Achievements";
import Events from "./components/EventsList";
import AddGoal from "./components/AddGoal"; // AddGoal imported

// Teacher components
import TeacherCertificates from "./components/TeacherCertificates";
import TeacherAchievements from "./components/TeacherAchievements";

import { doc, getDoc } from "firebase/firestore";
import "./App.css";

function ActivityRecords() {
  return (
    <div>
      <h1>Activity Records</h1>
      <AddActivity />
      <MyActivities />
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          setRole(userSnap.exists() ? userSnap.data().role : null);
        } catch (error) {
          console.error("Error fetching user role:", error);
          setRole(null);
        }
      } else {
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (user, role) => {
    setUser(user);
    setRole(role);
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <Router>
      <Navbar
        user={user}
        onMenuClick={() => setSidebarOpen((prev) => !prev)}
        onSignOut={() => signOut(auth)}
      />

      {/* Sidebar switches based on role */}
      {role === "teacher" ? (
        <TeacherSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      ) : (
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      <main className="main-content" onClick={() => sidebarOpen && setSidebarOpen(false)}>
        <Routes>
          {/* Default route based on role */}
          <Route
            path="/"
            element={
              role === "teacher" ? (
                <Navigate to="/teacher-certificates" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          {/* Teacher-only routes */}
          {role === "teacher" && (
            <>
              <Route path="/teacher-certificates" element={<TeacherCertificates />} />
              <Route path="/teacher-achievements" element={<TeacherAchievements />} />
              <Route
                path="/teacher-dashboard"
                element={<Navigate to="/teacher-certificates" replace />}
              />
            </>
          )}

          {/* Student-only routes */}
          {role !== "teacher" && (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/activity-records" element={<ActivityRecords />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/events" element={<Events />} />
              <Route path="/goals" element={<AddGoal />} /> {/* Added AddGoal route */}
            </>
          )}

          {/* Fallback route */}
          <Route
            path="*"
            element={
              role === "teacher" ? (
                <Navigate to="/teacher-certificates" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
