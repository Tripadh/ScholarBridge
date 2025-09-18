import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, auth, storage } from "../firebase";
import FileUpload from "./FileUpload";
import "./Certificates.css";

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const q = query(collection(db, "certificates"), where("userId", "==", userId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setCertificates(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
        setLoading(false);
      },
      (error) => {
        console.error("Error loading certificates:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (docId, filePath) => {
    if (!filePath) {
      alert("File path missing. Cannot delete certificate file.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this certificate?")) {
      return;
    }

    try {
      // Delete file from Storage
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);

      // Delete Firestore document
      await deleteDoc(doc(db, "certificates", docId));

      alert("Certificate deleted successfully.");
    } catch (error) {
      console.error("Error deleting certificate:", error.code, error.message);
      alert("Failed to delete certificate: " + (error.message || error.code));
    }
  };

  const formatDate = (dateField) => {
    if (!dateField) return "Invalid Date";
    if (typeof dateField.toDate === "function") return dateField.toDate().toLocaleDateString();
    if (dateField.seconds) return new Date(dateField.seconds * 1000).toLocaleDateString();
    return new Date(dateField).toLocaleDateString();
  };

  return (
    <div className="certificate-page">
      <h2 className="certificate-title">My Certificates</h2>

      <section className="certificate-upload-box">
        <h3>Upload Certificate or File</h3>
        <FileUpload />
      </section>

      {loading ? (
        <p className="loading-text">Loading certificates...</p>
      ) : certificates.length === 0 ? (
        <p className="empty-text">No certificates found.</p>
      ) : (
        <ul className="certificate-list">
          {certificates.map((cert) => (
            <li key={cert.id} className="certificate-item">
              <span>
                {cert.title || cert.name} - {formatDate(cert.issuedDate)}
              </span>
              <div className="certificate-actions">
                {cert.fileUrl && (
                  <a
                    href={cert.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="certificate-btn"
                  >
                    View
                  </a>
                )}
                <button
                  className="certificate-btn"
                  onClick={() => handleDelete(cert.id, cert.storagePath)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
