import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import api, { getApiError } from "../api/api";
import LoadingButton from "../components/LoadingButton";

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdPoll, setCreatedPoll] = useState(null);

  function updateOption(index, value) {
    const next = [...options];
    next[index] = value;
    setOptions(next);
  }

  function addOption() {
    setOptions([...options, ""]);
  }

  function removeOption(index) {
    if (options.length <= 2) return;

    setOptions(options.filter((_, optionIndex) => optionIndex !== index));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setCreatedPoll(null);

    const cleanedOptions = options.map((item) => item.trim()).filter(Boolean);

    if (!question.trim()) {
      setError("Please enter a poll question.");
      return;
    }

    if (cleanedOptions.length < 2) {
      setError("A poll needs at least 2 non-empty options.");
      return;
    }
    const formattedOptions = cleanedOptions.map((option) => ({
  option_text: option,
}));
    setLoading(true);

  try {
  const response = await api.post("/api/polls/", {
    question: question.trim(),
    options: formattedOptions,
  });

  setCreatedPoll(response.data);
  setQuestion("");
  setOptions(["", ""]);
}
     catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  // Backend response field names can be adjusted here if your schema differs.
  const pollCode =
    createdPoll?.poll_code ||
    createdPoll?.code ||
    createdPoll?.poll?.poll_code ||
    createdPoll?.poll?.code;

  return (
    <main className="page narrow-page">
      <div className="section-heading">
        <p className="eyebrow">Admin</p>
        <h1>Create a Poll</h1>
        <p className="muted">
          Add a question and at least two options.
        </p>
      </div>

      {error && <div className="alert error">{error}</div>}

      {createdPoll && (
        <div className="alert success">
          <strong>Poll created successfully!</strong>
          {pollCode ? (
            <div className="poll-code-box">
              <span>Poll code</span>
              <strong>{pollCode}</strong>
            </div>
          ) : (
            <p>
              The backend returned a successful response, but no recognized
              <code>poll_code</code> or <code>code</code> field was found.
            </p>
          )}
          <Link to="/poll" className="text-link">
            Go to Join Poll
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="panel form">
        <label>
          Poll question
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="What should we choose?"
          />
        </label>

        <div>
          <div className="label-row">
            <label>Options</label>
            <span className="muted small">Minimum 2</span>
          </div>

          <div className="options-list">
            {options.map((option, index) => (
              <div className="option-input-row" key={index}>
                <input
                  value={option}
                  onChange={(event) => updateOption(index, event.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => removeOption(index)}
                  disabled={options.length <= 2}
                  title="Remove option"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button type="button" className="button button-outline" onClick={addOption}>
            + Add Option
          </button>
        </div>

        <LoadingButton loading={loading}>Create Poll</LoadingButton>
      </form>
    </main>
  );
}