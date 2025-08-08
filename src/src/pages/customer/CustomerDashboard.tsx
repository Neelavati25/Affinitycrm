import React, { useEffect, useState } from "react";
import { auth } from "../../firebase/firebaseconfig";
import { useNavigate } from "react-router-dom";

const CustomerDashboard: React.FC = () => {
  const [user, setUser] = useState(auth.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) navigate("/customer-auth"); // Redirect if not logged in
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div>
      <h1>Customer Dashboard</h1>
      {user ? (
        <>
          <p><strong>Name:</strong> {user.displayName || "N/A"}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <button onClick={() => auth.signOut().then(() => navigate("/"))}>Logout</button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default CustomerDashboard;
