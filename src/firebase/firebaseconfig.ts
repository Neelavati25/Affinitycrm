import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  collection, 
  serverTimestamp, 
  updateDoc, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore";

// 🔥 Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDEGiY5Lse1PfKmL9PUxwIHHiwUlquTT_E",
  authDomain: "affinitycrm-95a76.firebaseapp.com",
  projectId: "affinitycrm-95a76",
  storageBucket: "affinitycrm-95a76.firebasestorage.app",
  messagingSenderId: "622048574238",
  appId: "1:622048574238:web:daf5958f1033a5394f670f",
  measurementId: "G-FV7JN8K2FY"
};

// 🔥 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

// 📌 **Save User Role (Admin / Customer)**
const saveUserRole = async (uid: string, role: "admin" | "customer", email: string) => {
  await setDoc(doc(db, "users", uid), { role, email }, { merge: true });
};

// 📌 **Get User Role**
const getUserRole = async (uid: string): Promise<string | null> => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data().role as string) : null;
};

// 📌 **Log Customer Activity (Cart, Purchases, Searches)**
const logCustomerActivity = async (uid: string, email: string, action: string, product?: any) => {
  if (!uid) return;

  await addDoc(collection(db, "customer_activity"), {
    userId: uid,
    email,
    action,
    product: product ? { id: product.id, name: product.name, price: product.price } : null,
    timestamp: serverTimestamp(),
  });

  // 🔥 **Store in Admin Dashboard (Without Overwriting)**
  const adminDocRef = doc(db, "admin_dashboard", "leads");
  await updateDoc(adminDocRef, { 
    lastCustomerActions: { [serverTimestamp()]: action }, 
    lastUpdated: serverTimestamp() 
  }, { merge: true });
};

// 📌 **Track Missed Actions (Abandoned Cart, Hesitation, Repeated Views)**
const trackMissedActions = async (uid: string, email: string, action: string, details?: string) => {
  await addDoc(collection(db, "missed_actions"), {
    userId: uid,
    email,
    action,
    details,
    timestamp: serverTimestamp(),
  });

  // 🔥 **Update Admin Dashboard**
  const adminDocRef = doc(db, "admin_dashboard", "leads");
  await updateDoc(adminDocRef, { 
    missedActions: { [serverTimestamp()]: action }, 
    lastUpdated: serverTimestamp() 
  }, { merge: true });
};

// 📌 **Store Search History**
const storeSearchHistory = async (uid: string, email: string, searchQuery: string) => {
  await addDoc(collection(db, "search_history"), {
    userId: uid,
    email,
    query: searchQuery,
    timestamp: serverTimestamp(),
  });

  // 🔥 **Log in Customer Activity & Admin Dashboard**
  await logCustomerActivity(uid, email, "Search Performed", { name: searchQuery });
};

// 📌 **Submit Customer Feedback (Review / Complaint)**
const submitCustomerFeedback = async (uid: string, email: string, type: "review" | "complaint", message: string, product?: any) => {
  if (!uid) return;

  await addDoc(collection(db, "customer_feedback"), {
    userId: uid,
    email,
    type, 
    message,
    product: product ? { id: product.id, name: product.name } : null,
    timestamp: serverTimestamp(),
  });

  // 🔥 **Notify Admin**
  await addDoc(collection(db, "admin_notifications"), {
    message: `New ${type} from ${email}`,
    timestamp: serverTimestamp(),
    status: "unread",
  });

  // 🔥 **Update Admin Dashboard**
  const adminDocRef = doc(db, "admin_dashboard", "leads");
  await updateDoc(adminDocRef, { 
    customerFeedback: { [serverTimestamp()]: message }, 
    lastUpdated: serverTimestamp() 
  }, { merge: true });
};

// 📌 **Request Assistance**
const requestAssistance = async (uid: string, email: string, issue: string) => {
  if (!uid) return;

  await addDoc(collection(db, "assistance_requests"), {
    userId: uid,
    email,
    issue,
    timestamp: serverTimestamp(),
    status: "Pending",
  });

  // 🔥 **Notify Admin**
  await addDoc(collection(db, "admin_notifications"), {
    message: `Assistance requested by ${email}`,
    timestamp: serverTimestamp(),
    status: "unread",
  });

  // 🔥 **Update Admin Dashboard**
  const adminDocRef = doc(db, "admin_dashboard", "leads");
  await updateDoc(adminDocRef, { 
    assistanceRequests: { [serverTimestamp()]: issue }, 
    lastUpdated: serverTimestamp() 
  }, { merge: true });
};

// 📌 **AI-Driven Product Recommendations (Based on Past Data)**
const getRecommendations = async (uid: string) => {
  const searchQuery = query(collection(db, "search_history"), where("userId", "==", uid));
  const cartQuery = query(collection(db, "customer_activity"), where("userId", "==", uid), where("action", "==", "Added to Cart"));
  const purchaseQuery = query(collection(db, "customer_activity"), where("userId", "==", uid), where("action", "==", "Purchased"));

  const [searchSnapshot, cartSnapshot, purchaseSnapshot] = await Promise.all([
    getDocs(searchQuery),
    getDocs(cartQuery),
    getDocs(purchaseSnapshot),
  ]);

  const searchTerms = searchSnapshot.docs.map(doc => doc.data().query);
  const cartProducts = cartSnapshot.docs.map(doc => doc.data().product);
  const purchasedProducts = purchaseSnapshot.docs.map(doc => doc.data().product);

  // 🔥 **More Accurate AI Recommendations**
  const recommendations = [...purchasedProducts, ...cartProducts, ...searchTerms].slice(0, 5);
  
  return recommendations;
};

// 🔥 **Export Everything**
export { 
  auth, 
  db, 
  googleProvider, 
  saveUserRole, 
  getUserRole, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  logCustomerActivity, 
  submitCustomerFeedback,  
  requestAssistance, 
  trackMissedActions, 
  storeSearchHistory,
  getRecommendations  
};