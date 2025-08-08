import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home"; 
import About from "./pages/About";
import CustomerAuth from "./pages/CustomerAuth";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminAuth from "./pages/AdminAuth";
import ChatbotAssistant from "./pages/ChatbotAssistant";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/customer-auth" element={<CustomerAuth />} />
        <Route path="/about" element={<About />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/Admin-Auth" element={<AdminAuth />} />
        <Route path="/ChatbotAssistant" element={<ChatbotAssistant />} />
      </Routes>
    </Router>
  );
};

export default App;