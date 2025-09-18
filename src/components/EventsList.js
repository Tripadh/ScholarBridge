import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import "./EventsList.css";

function Events() {
  const [clubName, setClubName] = useState("");
  const [clubs, setClubs] = useState([]);
  const [event, setEvent] = useState({
    title: "",
    date: "",
    description: "",
  });
  const [events, setEvents] = useState([]);

  // Live fetch events from Firestore
  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsData);
    });

    return () => unsubscribe(); // cleanup listener
  }, []);

  // Handle club submit
  const handleClubSubmit = (e) => {
    e.preventDefault();
    if (!clubName.trim()) return;
    setClubs((prev) => [...prev, clubName.trim()]);
    setClubName("");
  };

  // Handle event input change
  const handleEventChange = (e) => {
    setEvent({
      ...event,
      [e.target.name]: e.target.value,
    });
  };

  // Handle event submit with Firestore save
  const handleEventSubmit = async (e) => {
    e.preventDefault();

    if (!event.title || !event.date || !event.description) return;

    try {
      await addDoc(collection(db, "events"), {
        clubName: clubs.length > 0 ? clubs[clubs.length - 1] : "",
        title: event.title,
        date: event.date,
        description: event.description,
        createdAt: serverTimestamp(),
      });

      // Clear form
      setEvent({ title: "", date: "", description: "" });

      console.log("✅ Event saved successfully");
    } catch (error) {
      console.error("❌ Error adding event: ", error);
      alert("Failed to save event. Check console for details.");
    }
  };

  return (
    <div className="events-container">
      <h2>If you’re a club member, please enter your club name below</h2>
      <form onSubmit={handleClubSubmit} className="clubs-form">
        <input
          type="text"
          placeholder="Enter Club Name"
          value={clubName}
          onChange={(e) => setClubName(e.target.value)}
          required
          className="input-text"
        />
        <button type="submit" className="btn-submit">
          Submit
        </button>
      </form>

      {clubs.length > 0 && (
        <div className="clubs-section">
          <h3>Clubs Entered:</h3>
          <ul>
            {clubs.map((club, idx) => (
              <li key={idx}>{club}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="event-form-section">
        <h2>Enter Event Details</h2>
        <form onSubmit={handleEventSubmit} className="event-form">
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={event.title}
            onChange={handleEventChange}
            required
            className="input-text"
          />
          <input
            type="date"
            name="date"
            value={event.date}
            onChange={handleEventChange}
            required
            className="input-date"
          />
          <input
            type="text"
            name="description"
            placeholder="Event Description"
            value={event.description}
            onChange={handleEventChange}
            required
            className="input-text"
          />
          <button type="submit" className="btn-submit">
            Add Event
          </button>
        </form>
      </div>

      {events.length > 0 && (
        <div className="events-list-section">
          <h3>Events (From Firestore):</h3>
          <ul className="events-list">
            {events.map((evt) => (
              <li key={evt.id} className="event-item">
                <strong>{evt.title}</strong> ({evt.date})
                <br />
                {evt.description}
                {evt.clubName && <em> — {evt.clubName}</em>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Events;
