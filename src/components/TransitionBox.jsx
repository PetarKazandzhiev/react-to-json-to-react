import React, { useState } from "react";

export default function TransitionBox() {
  const [expanded, setExpanded] = useState(false);

  const boxStyle = {
    width: expanded ? 300 : 200, // px
    height: expanded ? 200 : 150, // px
    backgroundColor: expanded ? "#1326FD" : "#E7F0FF",
    color: expanded ? "#FFF" : "#1326FD",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.4s ease", // smooth all changes
    fontSize: "1rem",
    userSelect: "none",
    margin: "1rem auto",
  };

  return (
    <div style={boxStyle} onClick={() => setExpanded((prev) => !prev)}>
      {expanded ? "Click to shrink" : "Click to expand"}
    </div>
  );
}
