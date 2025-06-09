// Card.jsx
import React, { useState } from "react";

const PRIMARY_COLOR = "#1326FD";
const CARD_BG = "#fff";
const BORDER_COLOR = "#E1E5EB";
const DEFAULT_SHADOW = "0 4px 8px rgba(0,0,0,0.08)";
const HOVER_SHADOW = "0 12px 24px rgba(0,0,0,0.15)";
const TAG_BG = "#E7F0FF";
const TAG_COLOR = PRIMARY_COLOR;
const BUTTON_BG = PRIMARY_COLOR;
const BUTTON_HOVER = "#0F16B8";
const BUTTON_TEXT = "#fff";

export default function Card({
  title,
  content,
  image,
  tags = [],
  actions = [],
  footer,
  children,
  style = {},
  onClick,
  ...rest
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const containerStyle = {
    position: "relative",
    backgroundColor: CARD_BG,
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: "12px",
    boxShadow: hovered ? HOVER_SHADOW : DEFAULT_SHADOW,
    transform: pressed ? "scale(0.98)" : hovered ? "scale(1.02)" : "scale(1)",
    transition: "all 0.2s ease-out",
    cursor: onClick ? "pointer" : "default",
    padding: "1.5rem",
    overflow: "hidden",
    ...style,
  };

  return (
    <div
      {...rest}
      style={containerStyle}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      {image && (
        <img
          src={image}
          alt=""
          style={{ width: "100%", borderRadius: "8px", marginBottom: "1rem" }}
        />
      )}

      <h2
        style={{
          margin: 0,
          fontSize: "1.75rem",
          color: "#222",
          marginBottom: "0.5rem",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          color: "#555",
          lineHeight: 1.4,
          marginBottom: "1rem",
        }}
      >
        {content}
      </p>

      {children && <div style={{ marginBottom: "1rem" }}>{children}</div>}

      {tags.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          {tags.map((tag, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                backgroundColor: TAG_BG,
                color: TAG_COLOR,
                borderRadius: "4px",
                padding: "0.25rem 0.5rem",
                fontSize: "0.85rem",
                marginRight: "0.5rem",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {actions.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
            marginBottom: footer ? "1rem" : 0,
          }}
        >
          {actions.map(({ label, onClick: btnClick }, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                btnClick();
              }}
              style={{
                padding: "0.5rem 1rem",
                border: "none",
                backgroundColor: BUTTON_BG,
                color: BUTTON_TEXT,
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background-color 0.2s",
                fontFamily: "inherit",
                fontSize: "1rem",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = BUTTON_HOVER)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = BUTTON_BG)
              }
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {footer && (
        <div
          style={{
            borderTop: `1px solid ${BORDER_COLOR}`,
            paddingTop: "0.75rem",
            fontSize: "0.85rem",
            color: "#888",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
