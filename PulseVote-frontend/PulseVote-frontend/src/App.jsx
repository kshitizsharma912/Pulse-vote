import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreatePoll from "./pages/CreatePoll";
import Poll from "./pages/Poll";

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/poll" element={<Poll />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route element={<ProtectedRoute />}>
  <Route path="/create-poll" element={<CreatePoll />} />
</Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <footer className="footer">
        <span>PulseVote</span>
        <span>Frontend • React + Vite</span>
      </footer>
    </div>
  );
}