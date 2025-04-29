// src/pages/Dynamic.jsx
import React, { useState, useEffect } from "react";

/**
 * Blindly convert a JSON node into a DOM element.
 * Assumes node.type is a valid HTML tag and node.props are valid DOM props.
 */
function renderNode(node) {
  if (node == null || typeof node === "string" || typeof node === "number") {
    return node;
  }
  //const { type, props = {}, children = [] } = node;

  // normalize children → array, strip nulls, recurse
  const type = node.type || node.component;

  const props = node.props || node.webProps || {};

  const children = node.children || [];

  const kids = (Array.isArray(children) ? children : [children])
    .filter((c) => c != null)
    .map((c, i) =>
      typeof c === "object" ? React.cloneElement(renderNode(c), { key: i }) : c
    );

  return React.createElement(type, props, ...kids);
}

export default function Dynamic() {
  const [nodes, setNodes] = useState(null);

  // same async-within-effect pattern
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:4000/api/components");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setNodes(data);
      } catch (err) {
        console.error("Dynamic: load error:", err);
        setNodes([]);
      }
    }
    load();
  }, []);

  if (nodes === null) {
    return <div>Loading components…</div>;
  }

  return (
    <div>
      <h2>🌟 Blind Dynamic Renderer</h2>
      {nodes.length === 0 ? (
        <p>No components saved yet.</p>
      ) : (
        nodes.map((node) => (
          <div
            key={node.id}
            style={{
              margin: "1rem 0",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {renderNode(node)}
          </div>
        ))
      )}
    </div>
  );
}
