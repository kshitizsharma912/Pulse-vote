import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="brand">
          Pulse<span>Vote</span>
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>

          {isLoggedIn ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/create-poll">Create Poll</Link>
              <button className="link-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="nav-register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}