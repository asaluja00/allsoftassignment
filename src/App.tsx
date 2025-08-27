import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/home";

const App: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route
  path="/dashboard"
  element={localStorage.getItem("token") ? <Home /> : <Navigate to="/" />}
/>
    </Routes>
  </Router>
);

export default App;