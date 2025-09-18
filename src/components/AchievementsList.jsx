import React, { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase";  // Adjust path if needed
import "./AchievementsList.css";  // Your CSS file for styling

export default function AchievementsList() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "achievements"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const achvs = [];
        querySnapshot.forEach((doc) => {
          achvs.push({ id: doc.id, ...doc.data() });
        });
        setAchievements(achvs);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching achievements:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";
    if (date.toDate) return date.toDate().toLocaleDateString();
    if (date.seconds) return new Date(date.seconds * 1000).toLocaleDateString();
    if (typeof date === "string" || date instanceof String) return new Date(date).toLocaleDateString();
    return "N/A";
  };

  const filteredAchievements = achievements.filter((achv) => {
    const searchLower = search.toLowerCase();
    return (
      (achv.title?.toLowerCase().includes(searchLower) ?? false) ||
      (achv.studentName?.toLowerCase().includes(searchLower) ?? false) ||
      (achv.description?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  if (loading) return <p>Loading achievements...</p>;
  if (achievements.length === 0) return <p>No achievements found.</p>;

  return (
    <div className="achievements-list-container">
      <div className="search-bar-wrapper" style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by title, student name, or description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
          style={{
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1.5px solid #ccd6e0",
            width: "100%"
          }}
        />
      </div>

      <table className="achievements-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#dbe7fd", color: "#24365f", fontWeight: "600" }}>
          <tr>
            <th style={{ padding: "10px", borderBottom: "1px solid #c3c9d9" }}>Title</th>
            <th style={{ padding: "10px", borderBottom: "1px solid #c3c9d9" }}>Student Name</th>
            <th style={{ padding: "10px", borderBottom: "1px solid #c3c9d9" }}>Date</th>
            <th style={{ padding: "10px", borderBottom: "1px solid #c3c9d9" }}>Description</th>
            <th style={{ padding: "10px", borderBottom: "1px solid #c3c9d9" }}>View File</th>
          </tr>
        </thead>
        <tbody>
          {filteredAchievements.map((achv) => (
            <tr key={achv.id} style={{ borderBottom: "1px solid #e5e9f2" }}>
              <td style={{ padding: "8px" }}>{achv.title || "N/A"}</td>
              <td style={{ padding: "8px" }}>{achv.studentName || "N/A"}</td>
              <td style={{ padding: "8px" }}>{formatDate(achv.date)}</td>
              <td style={{ padding: "8px" }}>{achv.description || "-"}</td>
              <td style={{ padding: "8px" }}>
                {achv.fileURL ? (
                  <a
                    href={achv.fileURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#2b63aa", fontWeight: "600" }}
                  >
                    View Achievement ↗
                  </a>
                ) : (
                  "No file"
                )}
              </td>
            </tr>
          ))}
          {filteredAchievements.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#657194" }}>
                No achievements found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
