import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  saveUserRole,
} from "../firebase/firebaseconfig";

const AdminAuth: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(true);
  const navigate = useNavigate();

  // 🔹 Handle Email Signup/Login
  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      let userCredential;
      if (isSignup) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await saveUserRole(userCredential.user.uid, "admin", email);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/admin-dashboard");
    } catch (error) {
      alert((error as Error).message);
    }
  };

  // 🔹 Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await saveUserRole(result.user.uid, "admin", result.user.email!);
        navigate("/admin-dashboard");
      }
    } catch (error) {
      alert((error as Error).message);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isSignup ? "Admin Signup" : "Admin Login"}</h2>
      <form onSubmit={handleEmailAuth}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">{isSignup ? "Signup" : "Login"}</button>
      </form>

      {/* 🔹 Google Sign-In Button */}
      <button onClick={handleGoogleSignIn} className="google-signin">
        Sign in with Google
      </button>
    </div>
  );
};

export default AdminAuth;
