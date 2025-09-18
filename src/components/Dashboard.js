import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import AddActivity from "./AddActivity";
import MyActivities from "./MyActivities";
import FileUpload from "./FileUpload";
import "./Dashboard.css";

const progressMap = {
  Pending: { percent: 0, colorClass: "pending" },        // red
  "In Progress": { percent: 50, colorClass: "inprogress" },  // yellow
  Completed: { percent: 100, colorClass: "completed" },     // green
};

const Dashboard = () => {
  const [activities, setActivities] = useState([]);
  const [certificates, setCertificates] = useState(0);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState("dashboard"); // dashboard or activityRecords
  const [userName, setUserName] = useState("User");
  const [goals, setGoals] = useState([]);
  const [events, setEvents] = useState([]);

  const user = auth.currentUser || {};

  useEffect(() => {
    async function fetchUserName() {
      if (!user.uid) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().name) {
          setUserName(userDoc.data().name);
        } else if (user.displayName) {
          setUserName(user.displayName);
        } else if (user.email) {
          setUserName(user.email.split("@")[0]);
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
        setUserName("User");
      }
    }
    fetchUserName();
  }, [user]);

  useEffect(() => {
    const userId = user.uid;
    if (!userId) return;

    // Activities listener
    const activitiesQuery = query(collection(db, "activities"), where("userId", "==", userId));
    const unsubscribeActivities = onSnapshot(activitiesQuery, (snapshot) => {
      setActivities(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // Certificates listener
    const certificatesQuery = query(collection(db, "certificates"), where("userId", "==", userId));
    const unsubscribeCertificates = onSnapshot(certificatesQuery, (snapshot) => {
      setCertificates(snapshot.size);
    });

    // Goals listener
    const goalsQuery = query(collection(db, "goals"), where("userId", "==", userId));
    const unsubscribeGoals = onSnapshot(goalsQuery, (snapshot) => {
      setGoals(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // Events listener - fetch upcoming events (date >= today)
    const eventsQuery = query(
      collection(db, "events"),
      where("date", ">=", new Date().toISOString())
    );
    const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
      setEvents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // Cleanup all listeners
    return () => {
      unsubscribeActivities();
      unsubscribeCertificates();
      unsubscribeGoals();
      unsubscribeEvents();
    };
  }, [user]);

  if (loading) return <p>Loading dashboard...</p>;

  const upcoming = activities.filter((a) => new Date(a.date) >= new Date()).length;
  const recents = activities
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 2);
  const countAcademic = activities.filter((a) => a.type === "academic").length;
  const countCoCurricular = activities.filter((a) => a.type === "co-curricular").length;

  return (
    <div className="dashboard-root">
      <main className="dashboard-content">
        {section === "dashboard" && (
          <>
            {/* DASHBOARD HEADER */}
            <div className="dashboard-header-row">
              <div className="dashboard-branding">
                <span className="dashboard-logo" role="img" aria-label="logo">
                  🎓
                </span>
                <div>
                  <div className="dashboard-welcome">
                    Welcome, <span className="dashboard-username">{userName}</span>
                  </div>
                  <div style={{ fontSize: "1em", color: "#6382a7", marginTop: "7px" }}>
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="dashboard-profile">
                <div className="dashboard-avatar" title={userName}>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    userName.trim()[0] || "U"
                  )}
                </div>
              </div>
            </div>

            {/* DASHBOARD CARDS */}
            <div className="dashboard-cards">
              <div className="dashboard-card">
                <div className="card-title">Activities Joined</div>
                <div className="card-value">{activities.length}</div>
                <div className="card-icon" style={{ color: "#27ae60" }}>
                  ✔️
                </div>
              </div>
              <div className="dashboard-card">
                <div className="card-title">Certificates Earned</div>
                <div className="card-value">{certificates}</div>
                <div className="card-icon" style={{ color: "#f39c12" }}>
                  🏆
                </div>
              </div>
              <div className="dashboard-card">
                <div className="card-title">Upcoming Events</div>
                <div className="card-value">{upcoming}</div>
                <div className="card-icon" style={{ color: "#2980b9" }}>
                  📅
                </div>
              </div>
            </div>

            {/* DASHBOARD ROWS: PIE + RECENTS + EVENTS */}
            <div className="dashboard-rows">
              <div className="dashboard-panel">
                <div className="panel-title">Activity Distribution</div>
                <svg viewBox="0 0 32 32" width="120" height="120" className="pie-chart">
                  <circle r="16" cx="16" cy="16" fill="#e6e9ef" />
                  {activities.length > 0 && (
                    <>
                      <circle
                        r="16"
                        cx="16"
                        cy="16"
                        fill="transparent"
                        stroke="#3182ce"
                        strokeWidth="32"
                        strokeDasharray={`${
                          (countAcademic / activities.length) * 100 || 0
                        } ${100 - ((countAcademic / activities.length) * 100 || 0)}`}
                        strokeDashoffset="25"
                      />
                      <circle
                        r="16"
                        cx="16"
                        cy="16"
                        fill="transparent"
                        stroke="#28a745"
                        strokeWidth="32"
                        strokeDasharray={`${
                          (countCoCurricular / activities.length) * 100 || 0
                        } ${100 - ((countCoCurricular / activities.length) * 100 || 0)}`}
                        strokeDashoffset={
                          25 + ((countAcademic / activities.length) * 100 || 0)
                        }
                      />
                    </>
                  )}
                </svg>
                <div className="pie-legend">
                  <span className="legend academic"></span> Academic: {countAcademic}
                  <span className="legend cocurr"></span> Co-Curricular: {countCoCurricular}
                </div>
              </div>
              <div className="dashboard-panel">
                <div className="panel-title">Recent Activities</div>
                <ul className="recent-list">
                  {recents.length === 0 ? (
                    <li>No activities yet.</li>
                  ) : (
                    recents.map((a) => (
                      <li key={a.id}>
                        {a.title} <span className="recent-type">({a.type})</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
              <div className="dashboard-panel">
                <div className="panel-title">Upcoming Events</div>
                <ul className="recent-list">
                  {events.length === 0 ? (
                    <li>No upcoming events.</li>
                  ) : (
                    events.map((event) => (
                      <li key={event.id}>
                        {event.title} <span className="recent-type">({new Date(event.date).toLocaleDateString()})</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            {/* GOALS DIALOGUE BOX PROGRESS BARS */}
            <div className="goals-dialog-box">
              <h2>Your Goals Progress</h2>
              <div>
                {goals.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#668" }}>No goals added yet.</p>
                ) : (
                  goals.map((goal) => {
                    const { percent, colorClass } = progressMap[goal.status] || {
                      percent: 0,
                      colorClass: "pending",
                    };
                    return (
                      <div className="goals-progress-bar-wrapper" key={goal.id}>
                        <div className="goals-progress-title">{goal.title}</div>
                        <div
                          className={`goals-progress-bar-outer ${colorClass}`}
                          aria-label={`${goal.title} progress: ${percent}%`}
                          role="progressbar"
                          aria-valuemin="0"
                          aria-valuemax="100"
                          aria-valuenow={percent}
                        >
                          <div
                            className={`goals-progress-bar-fill ${colorClass}`}
                            style={{
                              width: `${percent}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}

        {section === "activityRecords" && (
          <div>
            <h2>Add New Activity</h2>
            <AddActivity />
            <h2>My Activities</h2>
            <MyActivities />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
