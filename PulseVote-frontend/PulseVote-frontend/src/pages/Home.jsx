import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { isLoggedIn } = useAuth();

  return (
    <main className="page">
      <section className="hero">
        <div className="hero-badge">Simple • Fast • Secure</div>
        <h1>Make every vote count.</h1>
        <p>
          PulseVote is a simple polling frontend where you can create polls,
          share a poll code, and vote with ease.
        </p>

        <div className="hero-actions">
          {isLoggedIn ? (
            <Link to="/dashboard" className="button">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="button">
                Login
              </Link>
              <Link to="/register" className="button button-secondary">
                Register
              </Link>
            </>
          )}

          <Link to="/poll" className="button button-outline">
            Join Poll
          </Link>
        </div>
      </section>

      <section className="feature-grid">
        <div className="feature-card">
          <div className="feature-icon">01</div>
          <h3>Create</h3>
          <p>Admins can create a question with multiple answer options.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">02</div>
          <h3>Share</h3>
          <p>Share the generated poll code with the people you want to vote.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">03</div>
          <h3>Vote</h3>
          <p>Logged-in users can select one option and submit their vote.</p>
        </div>
      </section>
    </main>
  );
}