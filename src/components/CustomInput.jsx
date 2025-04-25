import React from "react";

export default function CustomInput({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ padding: "0.5rem", fontSize: "1rem" }}
    />
  );
}
