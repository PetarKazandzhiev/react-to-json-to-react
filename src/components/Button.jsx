import React from "react";

const PRIMARY_COLOR = "#1326FD";
const HOVER_COLOR = "#0F16B8";
const TEXT_COLOR = "#FFFFFF";

export default function Button({ label, onClick }) {
  return (
    <button
      style={{
        borderRadius: "8px",
        border: "none",
        padding: "0.6em 1.2em",
        fontSize: "1em",
        fontWeight: 500,
        fontFamily: "inherit",
        backgroundColor: PRIMARY_COLOR,
        color: TEXT_COLOR,
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        transition: "background-color 0.2s ease",
      }}
      onClick={onClick}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = HOVER_COLOR)
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = PRIMARY_COLOR)
      }
    >
      {label}
    </button>
  );
}
