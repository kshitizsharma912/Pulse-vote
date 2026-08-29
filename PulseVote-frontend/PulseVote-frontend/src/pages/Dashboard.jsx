
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { getApiError } from "../api/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

const WS_BASE_URL = API_BASE_URL.replace(
  /^https:\/\//,
  "wss://"
).replace(
  /^http:\/\//,
  "ws://"
);

export default function Dashboard() {
  const { user } = useAuth();

  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const socketsRef = useRef({});


  async function loadMyPolls() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/polls/my");

      console.log("My polls response:", response.data);

      const loadedPolls = Array.isArray(response.data)
        ? response.data
        : [];

      setPolls(loadedPolls);
    } catch (err) {
      console.error("My polls error:", err);
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMyPolls();
  }, []);

  // --------------------------------------------------
  // WEBSOCKET CONNECTIONS
  // --------------------------------------------------

  useEffect(() => {
    if (polls.length === 0) {
      return;
    }

    polls.forEach((poll) => {
      if (!poll.code) {
        return;
      }

      // Already connected
      const existingSocket =
        socketsRef.current[poll.code];

      if (
        existingSocket &&
        (
          existingSocket.readyState === WebSocket.OPEN ||
          existingSocket.readyState === WebSocket.CONNECTING
        )
      ) {
        return;
      }

      const wsUrl =
        `${WS_BASE_URL}/api/polls/` +
        `${encodeURIComponent(poll.code)}/ws`;

      console.log("API BASE:", JSON.stringify(API_BASE_URL));
      console.log("WS BASE:", JSON.stringify(WS_BASE_URL));
      console.log("WS URL:", JSON.stringify(wsUrl));

      const socket = new WebSocket(wsUrl);

      socketsRef.current[poll.code] = socket;

      socket.onopen = () => {
        console.log(
          "WebSocket connected:",
          poll.code
        );
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          console.log(
            "WebSocket update:",
            data
          );

          if (data.type !== "vote_update") {
            return;
          }

          setPolls((currentPolls) =>
            currentPolls.map((currentPoll) => {
              if (
                currentPoll.code !==
                data.poll_code
              ) {
                return currentPoll;
              }

              return {
                ...currentPoll,

                total_votes:
                  data.total_votes ?? 0,

                options:
                  Array.isArray(data.results)
                    ? data.results.map((result) => ({
                        id: result.option_id,
                        option_text:
                          result.option_text,
                        vote_count:
                          result.vote_count ?? 0,
                      }))
                    : currentPoll.options,
              };
            })
          );
        } catch (err) {
          console.error(
            "Invalid WebSocket message:",
            err
          );
        }
      };

      socket.onerror = (event) => {
        console.error(
          "WebSocket error:",
          poll.code,
          event
        );
      };

      socket.onclose = (event) => {
        console.log(
          "WebSocket closed:",
          poll.code,
          event.code,
          event.reason
        );

        delete socketsRef.current[poll.code];
      };
    });
  }, [polls]);

  // --------------------------------------------------
  // CLOSE WEBSOCKETS WHEN DASHBOARD UNMOUNTS
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      console.log(
        "Closing all WebSockets..."
      );

      Object.values(
        socketsRef.current
      ).forEach((socket) => {
        if (
          socket.readyState ===
          WebSocket.OPEN ||
          socket.readyState ===
          WebSocket.CONNECTING
        ) {
          socket.close();
        }
      });

      socketsRef.current = {};
    };
  }, []);


  return (
    <main className="page">

      {/* HEADER */}
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">
            Dashboard
          </p>

          <h1>
            Welcome,{" "}
            {user?.name || "User"} 👋
          </h1>

          <p className="muted">
            Manage your polls and watch
            live voting results.
          </p>
        </div>

        <span className="role-badge">
          {user?.role || "user"}
        </span>
      </section>

      {/* TOP CARDS */}
      <section className="dashboard-grid">

        {/* JOIN */}
        <div className="dashboard-card">
          <h2>
            Join a Poll
          </h2>

          <p>
            Have a poll code? Enter it
            and start voting.
          </p>

          <Link
            to="/poll"
            className="button"
          >
            Join Poll
          </Link>
        </div>

        {/* CREATE */}
        <div className="dashboard-card">
          <h2>
            Create a Poll
          </h2>

          <p>
            Create a new poll and get a
            unique code to share.
          </p>

          <Link
            to="/create-poll"
            className="button"
          >
            Create Poll
          </Link>
        </div>

        {/* ACCOUNT */}
        <div className="dashboard-card account-card">
          <h2>
            Account
          </h2>

          <div className="account-row">
            <span>
              Name
            </span>

            <strong>
              {user?.name || "-"}
            </strong>
          </div>

          <div className="account-row">
            <span>
              Email
            </span>

            <strong>
              {user?.email || "-"}
            </strong>
          </div>

          <div className="account-row">
            <span>
              Role
            </span>

            <strong>
              {user?.role || "user"}
            </strong>
          </div>
        </div>

      </section>

      {/* MY POLLS */}
      <section className="dashboard-section">

        <div className="section-heading">
          <p className="eyebrow">
            Your Polls
          </p>

          <h2>
            My Created Polls
          </h2>

          <p className="muted">
            Your polls and live voting
            results.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="panel">
            <p className="muted">
              Loading your polls...
            </p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        {/* NO POLLS */}
        {!loading &&
          !error &&
          polls.length === 0 && (
            <div className="panel">
              <h3>
                No polls yet
              </h3>

              <p className="muted">
                You haven't created any
                polls yet.
              </p>

              <Link
                to="/create-poll"
                className="button"
              >
                Create Your First Poll
              </Link>
            </div>
          )}

        {/* POLLS */}
        {!loading &&
          !error &&
          polls.length > 0 && (
            <div className="created-polls">

              {polls.map((poll) => {

                const totalVotes =
                  poll.total_votes ?? 0;

                return (
                  <div
                    className="dashboard-card poll-summary-card"
                    key={poll.id}
                  >

                    {/* CODE */}
                    <div className="poll-card-top">

                      <span className="poll-label">
                        Poll
                      </span>

                      <span className="poll-code">
                        {poll.code}
                      </span>

                    </div>

                    {/* QUESTION */}
                    <h3>
                      {poll.question}
                    </h3>

                    {/* TOTAL */}
                    <div className="total-votes">

                      <strong>
                        {totalVotes}
                      </strong>

                      <span>
                        Total Votes
                      </span>

                    </div>

                    {/* OPTIONS */}
                    <div className="poll-summary-options">

                      {Array.isArray(
                        poll.options
                      ) &&
                        poll.options.map(
                          (option) => (
                            <div
                              key={option.id}
                              className="account-row"
                            >

                              <span>
                                {
                                  option.option_text
                                }
                              </span>

                              <strong>
                                {
                                  option.vote_count ??
                                  0
                                }{" "}
                                votes
                              </strong>

                            </div>
                          )
                        )}

                    </div>

                    {/* ACTIONS */}
                    <div className="poll-actions">

                      <Link
                        to={`/poll?code=${encodeURIComponent(
                          poll.code
                        )}`}
                        className="button"
                      >
                        View Poll
                      </Link>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

      </section>

    </main>
  );
}

