import React, { useState, useRef } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db, auth } from "../firebase";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloadURL, setDownloadURL] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setDownloadURL("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    setUploading(true);
    setDownloadURL("");
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated.");

      const filePath = `users/${userId}/files/${Date.now()}_${file.name}`;
      const fileRef = ref(storage, filePath);

      // Upload the file to Firebase Storage with the generated path
      await uploadBytes(fileRef, file);

      // Get the download URL for displaying or downloading file
      const url = await getDownloadURL(fileRef);
      setDownloadURL(url);

      // Save Firestore document with storagePath included
      await addDoc(collection(db, "certificates"), {
        userId,
        title: file.name,
        fileUrl: url,
        storagePath: filePath,      // Save this to allow deletes
        issuedDate: serverTimestamp(),
      });

      alert("Upload successful!");

      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed: " + error.message);
    }
    setUploading(false);
  };

  return (
    <div style={{ maxWidth: 360, margin: "20px auto" }}>
      <input type="file" onChange={handleFileChange} ref={fileInputRef} disabled={uploading} />
      <button onClick={handleUpload} disabled={uploading} style={{ marginTop: 12 }}>
        {uploading ? "Uploading..." : "Upload File"}
      </button>
      {downloadURL && (
        <div style={{ marginTop: 16 }}>
          <a href={downloadURL} target="_blank" rel="noopener noreferrer">
            View Uploaded File
          </a>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
