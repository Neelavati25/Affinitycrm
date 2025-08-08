import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  db 
} from "../firebase/firebaseconfig";
import { doc, setDoc } from "firebase/firestore";

const CustomerAuth: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(true);
  const navigate = useNavigate();

  // Function to store user details in Firestore
  const saveUserRole = async (userId: string, email: string) => {
    try {
      await setDoc(doc(db, "users", userId), {
        email: email,
        role: "customer",
        leadScore: 0, // Default lead score
        lastInteraction: "Signed up",
        recommendations: ["Welcome to our AI-Driven CRM!"]
      });
    } catch (error) {
      console.error("Error saving user role:", error);
    }
  };

  // Handle Email/Password Authentication
  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      let userCredential;
      if (isSignup) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await saveUserRole(userCredential.user.uid, email);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/customer-dashboard");
    } catch (error) {
      alert((error as Error).message);
    }
  };

  // Handle Google Authentication
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await saveUserRole(result.user.uid, result.user.email || "");
      navigate("/customer-dashboard");
    } catch (error) {
      alert((error as Error).message);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isSignup ? "Customer Signup" : "Customer Login"}</h2>
      <form onSubmit={handleEmailAuth}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">{isSignup ? "Signup" : "Login"}</button>
      </form>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
      <p onClick={() => setIsSignup(!isSignup)}>
        {isSignup ? "Already have an account? Login" : "Don't have an account? Signup"}
      </p>
    </div>
  );
};

export default CustomerAuth;
