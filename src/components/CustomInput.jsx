// CustomInput.jsx
import React from "react";

const PRIMARY_COLOR = "#1326FD";
const BORDER_COLOR = "#d1d7e0";
const FOCUS_SHADOW = "0 0 0 0.15rem rgba(19,38,253,0.25)";

export default function CustomInput({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "0.6em 1em",
        fontSize: "1rem",
        borderRadius: "8px",
        border: `1px solid ${BORDER_COLOR}`,
        backgroundColor: "#fff",
        transition: "border-color 0.2s, box-shadow 0.2s",
        outline: "none",
        fontFamily: "inherit",
        color: "#1a1a1a",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = PRIMARY_COLOR;
        e.currentTarget.style.boxShadow = FOCUS_SHADOW;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = BORDER_COLOR;
        e.currentTarget.style.boxShadow = "none";
      }}
    />
  );
}
