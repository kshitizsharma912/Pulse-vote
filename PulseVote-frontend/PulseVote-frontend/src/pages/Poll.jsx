import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getApiError } from "../api/api";
import LoadingButton from "../components/LoadingButton";
import { useAuth } from "../context/AuthContext";

export default function Poll() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [codeInput, setCodeInput] = useState("");
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  const [loadingPoll, setLoadingPoll] = useState(false);
  const [loadingVote, setLoadingVote] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function findPoll(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setPoll(null);
    setSelectedOption(null);

    const code = codeInput.trim();

    if (!code) {
      setError("Please enter a poll code.");
      return;
    }

    setLoadingPoll(true);

    try {
      const response = await api.get(
        `/api/polls/${encodeURIComponent(code)}`
      );

      console.log("Poll API response:", response.data);

      setPoll(response.data);
    } catch (err) {
      console.error("Find poll error:", err);
      setError(getApiError(err));
    } finally {
      setLoadingPoll(false);
    }
  }

  function getOptions(data) {
    if (!data) return [];

    if (Array.isArray(data.options)) {
      return data.options;
    }

    if (Array.isArray(data.poll?.options)) {
      return data.poll.options;
    }

    return [];
  }

  function getQuestion(data) {
    return (
      data?.question ||
      data?.poll?.question ||
      "Poll"
    );
  }

  function getOptionId(option) {
    return (
      option?.id ??
      option?.option_id ??
      option?.poll_option_id
    );
  }

  function getOptionText(option) {
    if (typeof option === "string") {
      return option;
    }

    if (!option || typeof option !== "object") {
      return "";
    }

    return (
      option.option_text ||
      option.text ||
      option.name ||
      option.value ||
      ""
    );
  }

  async function submitVote() {
    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          from: `/poll?code=${encodeURIComponent(
            codeInput.trim()
          )}`,
        },
      });

      return;
    }

    if (!selectedOption) {
      setError("Please select an option first.");
      return;
    }

    setError("");
    setSuccess("");
    setLoadingVote(true);

    try {
      await api.post("/api/votes/", {
        option_id: selectedOption,
      });

      setSuccess(
        "Your vote was submitted successfully!"
      );
    } catch (err) {
      console.error("Vote error:", err);
      setError(getApiError(err));
    } finally {
      setLoadingVote(false);
    }
  }

  const options = getOptions(poll);
  const question = getQuestion(poll);

  return (
    <main className="page narrow-page">
      <div className="section-heading">
        <p className="eyebrow">Poll</p>

        <h1>Join a Poll</h1>

        <p className="muted">
          Enter the code shared by the poll creator.
        </p>
      </div>

      <form
        onSubmit={findPoll}
        className="panel code-form"
      >
        <label>
          Poll code

          <input
            type="text"
            value={codeInput}
            onChange={(event) =>
              setCodeInput(event.target.value)
            }
            placeholder="e.g. ABC123"
          />
        </label>

        <LoadingButton loading={loadingPoll}>
          Find Poll
        </LoadingButton>
      </form>

      {error && (
        <div className="alert error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert success">
          {success}
        </div>
      )}

      {poll && (
        <section className="poll-card">
          <div className="poll-card-top">
            <span className="poll-label">
              Poll
            </span>

            <span className="poll-code">
              {codeInput.trim()}
            </span>
          </div>

          <h2>{question}</h2>

          <div className="poll-options">
            {options.length === 0 ? (
              <p className="muted">
                The backend returned no options
                for this poll.
              </p>
            ) : (
              options.map((option, index) => {
                const id = getOptionId(option);
                const text = getOptionText(option);

                return (
                  <label
                    className={`poll-option ${
                      selectedOption === id
                        ? "selected"
                        : ""
                    }`}
                    key={id ?? index}
                  >
                    <input
                      type="radio"
                      name="poll-option"
                      value={id ?? ""}
                      checked={
                        selectedOption === id
                      }
                      onChange={() =>
                        setSelectedOption(id)
                      }
                    />

                    <span>
                      {text || "Unnamed option"}
                    </span>
                  </label>
                );
              })
            )}
          </div>

          <div className="vote-area">
            {!isLoggedIn && (
              <p className="muted small">
                You need to log in before you can
                vote.
              </p>
            )}

            <LoadingButton
              type="button"
              loading={loadingVote}
              disabled={
                !selectedOption ||
                options.length === 0
              }
              onClick={submitVote}
            >
              {isLoggedIn
                ? "Submit Vote"
                : "Login to Vote"}
            </LoadingButton>
          </div>
        </section>
      )}
    </main>
  );
}

