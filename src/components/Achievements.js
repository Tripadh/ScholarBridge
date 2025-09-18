import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db, storage } from '../firebase'; // update with your firebase config import
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [title, setTitle] = useState('');
  const [studentName, setStudentName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load achievements from Firestore
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const q = query(collection(db, 'achievements'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        const achvs = [];
        querySnapshot.forEach((doc) => {
          achvs.push({ id: doc.id, ...doc.data() });
        });
        setAchievements(achvs);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      }
    };

    fetchAchievements();
  }, []);

  // Upload achievement to Firebase
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !studentName || !date || !file) return alert('Please fill all fields');

    setLoading(true);
    try {
      // Upload file to storage
      const storageRef = ref(storage, `achievements/${file.name}-${Date.now()}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        null,
        (error) => {
          console.error('Upload error:', error);
          setLoading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Save achievement metadata to Firestore
          await addDoc(collection(db, 'achievements'), {
            title,
            studentName,
            description,
            date,
            fileURL: downloadURL,
            fileName: file.name,
            createdAt: new Date(),
          });

          setTitle('');
          setStudentName('');
          setDescription('');
          setDate('');
          setFile(null);

          // Refresh list
          const q = query(collection(db, 'achievements'), orderBy('date', 'desc'));
          const querySnapshot = await getDocs(q);
          const achvs = [];
          querySnapshot.forEach((doc) => {
            achvs.push({ id: doc.id, ...doc.data() });
          });
          setAchievements(achvs);
        }
      );
    } catch (error) {
      console.error('Error uploading achievement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter achievements by search term
  const filteredAchievements = achievements.filter(
    (achv) =>
      achv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achv.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achv.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="achievements-container" style={{ padding: '20px', maxWidth: '800px', margin: 'auto', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 6px 25px rgba(0,0,0,0.08)' }}>
      <h3 style={{ color: '#1c2b4a', fontWeight: '700', marginBottom: '20px' }}>Upload Achievement</h3>
      <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="achievement-input"
          style={{ padding: '12px', borderRadius: '10px', border: '1.5px solid #ccd6e0' }}
          required
        />
        <input
          type="text"
          placeholder="Student Name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          className="achievement-input"
          style={{ padding: '12px', borderRadius: '10px', border: '1.5px solid #ccd6e0' }}
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="achievement-input"
          rows={3}
          style={{ padding: '12px', borderRadius: '10px', border: '1.5px solid #ccd6e0' }}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="achievement-input"
          style={{ padding: '12px', borderRadius: '10px', border: '1.5px solid #ccd6e0' }}
          required
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="achievement-file-input"
          style={{ padding: '6px', borderRadius: '10px', border: '1.5px solid #ccd6e0' }}
          accept=".pdf,.jpg,.jpeg,.png"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="achievement-upload-btn"
          style={{ padding: '12px 26px', borderRadius: '8px', backgroundColor: '#3f72af', color: 'white', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Uploading...' : 'Upload Achievement'}
        </button>
      </form>

      <h3 style={{ marginBottom: '20px', color: '#1c2b4a', fontWeight: '700' }}>All Achievements</h3>
      <input
        type="search"
        placeholder="Search by title, name, or description"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #ccd6e0', marginBottom: '20px', width: '100%' }}
      />

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#dbe7fd', color: '#24365f', fontWeight: '600' }}>
          <tr>
            <th style={{ padding: '10px', borderBottom: '1px solid #c3c9d9' }}>Title</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #c3c9d9' }}>Student Name</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #c3c9d9' }}>Issued Date</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #c3c9d9' }}>Description</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #c3c9d9' }}>View File</th>
          </tr>
        </thead>
        <tbody>
          {filteredAchievements.map((achv) => (
            <tr key={achv.id} style={{ borderBottom: '1px solid #e5e9f2' }}>
              <td style={{ padding: '8px' }}>{achv.title}</td>
              <td style={{ padding: '8px' }}>{achv.studentName}</td>
              <td style={{ padding: '8px' }}>{new Date(achv.date).toLocaleDateString()}</td>
              <td style={{ padding: '8px' }}>{achv.description || '-'}</td>
              <td style={{ padding: '8px' }}>
                <a href={achv.fileURL} target="_blank" rel="noopener noreferrer" style={{ color: '#2b63aa', fontWeight: '600' }}>
                  View Achievement ↗
                </a>
              </td>
            </tr>
          ))}
          {filteredAchievements.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#657194' }}>
                No achievements found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Achievements;
