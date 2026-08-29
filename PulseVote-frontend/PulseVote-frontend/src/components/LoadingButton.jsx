import React from "react";
export default function LoadingButton({
  loading,
  children,  type = "submit",
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`button ${className}`}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}