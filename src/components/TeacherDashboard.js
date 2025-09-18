import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import AchievementsList from "./AchievementsList";
import "./TeacherDashboard.css";

export default function TeacherDashboard({ userName, userEmail, userInitial }) {
  const [certificates, setCertificates] = useState([]);
  const [emails, setEmails] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch certificates and related user emails
  useEffect(() => {
    const q = query(collection(db, "certificates"), orderBy("issuedDate", "desc"));
    const unsubscribe = onSnapshot(
      q,
      async (querySnapshot) => {
        const certs = [];
        const userIds = new Set();

        querySnapshot.forEach((docSnap) => {
          const cert = { id: docSnap.id, ...docSnap.data() };
          certs.push(cert);
          if (cert.userId) userIds.add(cert.userId);
        });

        const emailsMap = {};
        await Promise.all(
          Array.from(userIds).map(async (uid) => {
            const userDoc = await getDoc(doc(db, "users", uid));
            emailsMap[uid] = userDoc.exists() ? userDoc.data().email : "Unknown";
          })
        );

        setCertificates(certs);
        setEmails(emailsMap);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching certificates:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const formatDate = (issuedDate) => {
    if (!issuedDate) return "N/A";
    if (issuedDate.toDate) return issuedDate.toDate().toLocaleDateString();
    if (issuedDate.seconds) return new Date(issuedDate.seconds * 1000).toLocaleDateString();
    return "N/A";
  };

  const filteredCertificates = certificates.filter((cert) => {
    const title = cert.title || "";
    const email = emails[cert.userId] || "";
    const issuedDate = formatDate(cert.issuedDate) || "";
    const searchLower = search.toLowerCase();
    return (
      title.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower) ||
      issuedDate.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="teacher-dashboard-container">
      {/* Header / Welcome section */}
      <div className="dashboard-header">
        <div className="dashboard-user-icon" aria-label="Teacher icon" role="img">
          🎓
        </div>
        <div className="dashboard-user-info">
          <p>Welcome, <span className="dashboard-name">{userName}</span></p>
          <span className="dashboard-email">{userEmail}</span>
        </div>
        <div className="dashboard-avatar">{userInitial}</div>
      </div>

      {/* Certificates Section */}
      <section id="student-certificates">
        <div className="dashboard-section-header">
          <h2>All Student Certificates</h2>
        </div>

        <div className="search-bar-wrapper">
          <span className="search-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="8" stroke="#2563eb" strokeWidth="2" />
              <line x1="15" y1="15" x2="19" y2="19" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by name, email, or date"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
          />
        </div>

        {loading ? (
          <p>Loading certificates...</p>
        ) : filteredCertificates.length === 0 ? (
          <p>No certificates found.</p>
        ) : (
          <table className="certificate-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Issued Date</th>
                <th>Identifier (Email)</th>
                <th>View File</th>
              </tr>
            </thead>
            <tbody>
              {filteredCertificates.map((cert) => (
                <tr key={cert.id}>
                  <td>{cert.title || "N/A"}</td>
                  <td>{formatDate(cert.issuedDate)}</td>
                  <td>{emails[cert.userId] || "Unknown"}</td>
                  <td>
                    {cert.fileUrl ? (
                      <a
                        href={cert.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-certificate-link"
                      >
                        📄 View Certificate
                      </a>
                    ) : (
                      "No file"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Divider */}
      <hr style={{ margin: "40px 0" }} />

      {/* Achievements Section */}
      <section id="student-achievements">
        <div className="dashboard-section-header">
          <h2>All Student Achievements</h2>
        </div>

        <AchievementsList />
      </section>
    </div>
  );
}
