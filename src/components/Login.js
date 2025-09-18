import React, { useState } from "react";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Login.css";

export default function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState("");

  // Save new user profile or return stored role for existing users
  async function saveUserProfile(user, role, name) {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // New user - save with selected role and name
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        role,
        name,
        createdAt: new Date(),
      });
      // Update Firebase Auth displayName
      await updateProfile(user, { displayName: name });
      return role;
    } else {
      // Existing user: just return stored role
      return userSnap.data().role;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const authInstance = getAuth();
      let userCredential;

      if (isNewUser) {
        // Create new account
        userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
      } else {
        // Sign in existing account
        userCredential = await signInWithEmailAndPassword(authInstance, email, password);
      }

      const user = userCredential.user;

      // Save or verify role and name in Firestore
      const storedRole = await saveUserProfile(user, role, name);

      if (storedRole !== role) {
        alert(`You selected role "${role}", but your account is registered as "${storedRole}". Please select the correct role.`);
        setError("Role mismatch.");
        await auth.signOut();
        return;
      }

      if (typeof onLogin === "function") {
        onLogin(user, storedRole);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="app-title">🎓ScholarBridge</div>

      <div className="login-card">
        <h2>{isNewUser ? "Register" : "Login"}</h2>

        <form onSubmit={handleSubmit}>
          {isNewUser && (
            <label>
              Name
              <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            </label>
          )}

          <label>
            Email
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>

          <label>
            Password
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>

          <label>
            Select Role
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </label>

          {error && <p className="error-message">{error}</p>}

          <button type="submit">{isNewUser ? "Register" : "Login"}</button>
        </form>

        <p>
          {isNewUser ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => { setIsNewUser(!isNewUser); setError(""); }}>
            {isNewUser ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}
