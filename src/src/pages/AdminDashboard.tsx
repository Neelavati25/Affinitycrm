import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseconfig";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";

interface Customer {
  id: string;
  email: string;
  role: string;
}

const AdminDashboard: React.FC = () => {
  const [admin, setAdmin] = useState(auth.currentUser);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) navigate("/admin-auth"); // Redirect if not logged in
      setAdmin(currentUser);
    });

    // Fetch all customers from Firestore
    const fetchCustomers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const customerList = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Customer))
        .filter((user) => user.role === "customer"); // Show only customers

      setCustomers(customerList);
    };

    fetchCustomers();
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {admin ? (
        <>
          <p><strong>Admin:</strong> {admin.email}</p>
          <button onClick={() => auth.signOut().then(() => navigate("/"))}>Logout</button>

          <h2>Customer List</h2>
          {customers.length > 0 ? (
            <ul>
              {customers.map((customer) => (
                <li key={customer.id}>
                  <strong>{customer.email}</strong> (Lead Score: {Math.floor(Math.random() * 100)})
                </li>
              ))}
            </ul>
          ) : (
            <p>No customers found.</p>
          )}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default AdminDashboard;