import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Avatar,
  Grid,
  Card,
  CardContent,
  ListItem,
  ListItemText,
  Snackbar,
  Alert,
} from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { db } from "../firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import axios from "axios";
import Sentiment from "sentiment";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6384"];

const AdminDashboard = () => {
  const [customerActions, setCustomerActions] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [assistanceRequests, setAssistanceRequests] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

  const sentimentAnalyzer = new Sentiment();

  // Function to analyze sentiment and send emails for negative feedback
  const analyzeAndSendEmail = async (fb) => {
    const sentimentResult = sentimentAnalyzer.analyze(fb.message);
    if (sentimentResult.score < -2) {
      await sendEmail(
        fb.email,
        "We sincerely apologize for your experience",
        `Dear ${fb.email},\n\nWe have received your feedback:\n"${fb.message}"\n\nWe are deeply sorry for the inconvenience caused. As a token of our apology and appreciation for your patience, we are offering you a VIP discount code for your next purchase.\n\nThank you for bringing this to our attention.\n\nBest regards,\nAffinityCRM Team`
      );
    }
  };

  // Function to send an email via backend API
  const sendEmail = async (email, subject, message) => {
    try {
      await axios.post("http://localhost:5000/send-email", { email, subject, message });
      console.log(`Email sent to ${email}`);
      setNotification({ open: true, message: `Email sent successfully to ${email}`, severity: "success" });
    } catch (error) {
      console.error("Error sending email:", error);
      setNotification({ open: true, message: `Failed to send email to ${email}`, severity: "error" });
    }
  };

  useEffect(() => {
    // Fetch customer activity
    const customerQuery = query(collection(db, "customer_activity"), orderBy("timestamp", "desc"));
    onSnapshot(customerQuery, (snapshot) => {
      const activityCounts = { Browsing: 0, "Added to Cart": 0, Purchased: 0, Wishlist: 0 };
      const actions = snapshot.docs.map((doc) => {
        const data = doc.data();
        activityCounts[data.action] = (activityCounts[data.action] || 0) + 1;
        return { id: doc.id, ...data };
      });
      setCustomerActions(actions);
      setActivityData([
        { name: "Browsing", value: activityCounts.Browsing },
        { name: "Added to Cart", value: activityCounts["Added to Cart"] },
        { name: "Purchased", value: activityCounts.Purchased },
        { name: "Wishlist", value: activityCounts.Wishlist },
      ]);
    });

    // Fetch feedbacks
    const feedbackQuery = query(collection(db, "customer_feedback"), orderBy("timestamp", "desc"));
    onSnapshot(feedbackQuery, (snapshot) => {
      const feedbackList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFeedbacks(feedbackList);
      feedbackList.forEach((fb) => analyzeAndSendEmail(fb));
    });

    // Fetch assistance requests
    const assistanceQuery = query(collection(db, "assistance_requests"), orderBy("timestamp", "desc"));
    onSnapshot(assistanceQuery, (snapshot) => {
      const requests = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAssistanceRequests(requests);
      requests.forEach((request) =>
        sendEmail(
          request.email,
          `Regarding your issue/complaint`,
          `Dear Customer,\n\nWe have received your issue:\n"${request.issue}"\n\nOur team will get back to you shortly. Thank you for your patience.\n\nBest regards,\nAffinityCRM Team`
        )
      );
    });
  }, []);

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Navbar */}
      <AppBar position="static" sx={{ backgroundColor: "#4A90E2" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            AI-Driven CRM + Smart E-Commerce
          </Typography>
          <Button variant="contained" sx={{ backgroundColor: "#ffffff", color: "#4A90E2" }}>
            Switch to Customer
          </Button>
          <Avatar sx={{ marginLeft: "10px", backgroundColor: "#ffffff", color: "#4A90E2" }}>A</Avatar>
        </Toolbar>
      </AppBar>

      {/* Metrics Section */}
      <Grid container spacing={3} sx={{ padding: "20px" }}>
        <Grid item xs={4}>
          <Card><CardContent><Typography variant="h6">Active Visitors</Typography><Typography variant="h4">24</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={4}>
          <Card><CardContent><Typography variant="h6">Conversion Rate</Typography><Typography variant="h4">3.8%</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={4}>
          <Card><CardContent><Typography variant="h6">Cart Abandonment</Typography><Typography variant="h4">21%</Typography></CardContent></Card>
        </Grid>
      </Grid>

      {/* High-Intent Customers & Live Customer Activity */}
      <Grid container spacing={3} sx={{ paddingX:"20px" }}>
        {/* High-Intent Customers */}
        <Grid item xs={6}>
          <Card><CardContent>
            <Typography variant="h6">High-Intent Customers</Typography>
            {customerActions.slice(0,3).map(action=>(
              <ListItem key={action.id}>
                <ListItemText primary={action.email} secondary={`Intent Score: ${Math.floor(Math.random()*(95-75+1))+75}%`}/>
              </ListItem>))}
          </CardContent></Card>
        </Grid>

        {/* Live Customer Activity */}
        <Grid item xs={6}>
          <Card><CardContent><Typography variant="h6">Live Customer Activity</Typography>
            {customerActions.slice(0,5).map(action=>(
              <ListItem key={action.id}><ListItemText primary={action.email} secondary={action.action}/></ListItem>))}
          </Card>
        </Grid>

        {/* Feedback Section */}
        <Grid item xs={12}>
          <Card><CardContent><Typography variant="h6">Customer Feedback</Typography>{feedbacks.map(fb=>(
            <ListItem key={fb.id}><ListItemText primary={`Feedback by ${fb.email}`} secondary={fb.message}/></ListItem>))}</CardContent></Card>
        </Grid>

        {/* Assistance Requests Section */}
        <Grid item xs={12}>
          <Card><CardContent><Typography variant="h6">Assistance Requests</Typography>{assistanceRequests.map(req=>(
              <ListItem key={req.id}><ListItemText primary={`Issue by ${req.email}`} secondary={`"${req.issue}"`}/></ListItem>))}
          </Card>
        </Grid>

        {/* Pie Chart Section */}
        <Grid item xs={12}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart width={400} height={400}><Pie data={activityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120}>{activityData.map((entry,index)=>(
                <Cell key={`cell-${index}`} fill={COLORS[index%COLORS.length]}/>))}
              </Pie><Tooltip/><Legend/></PieChart></ResponsiveContainer></Card>
        </Grid>

      </Grid>

      {/* Snackbar Notification */}
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={()=>setNotification({...notification,open:false})}>
       <Alert severity={notification.severity}>{notification.message}</Alert></Snackbar>

    </Box>);
};

export default AdminDashboard;

