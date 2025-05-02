import React from "react";

export default function Button({ label, onClick }) {
  return (
    <button
      style={{
        borderRadius: "8px",
        border: "1px solid transparent",
        padding: " 0.6em 1.2em",
        fontSize: "1em",
        fontWeight: "500",
        fontFamily: "inherit",
        backgroundColor: "#1a1a1a",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
