// src/pages/Dynamic.jsx
import React, { useState, useEffect } from "react";

/**
 * Recursively converts a JSON node into a React element.
 * Assumes that `node.type` is always a valid HTML tag name.
 */
function renderNode(node) {
  console.log("renderNode: received node:", node);

  if (typeof node === "string" || typeof node === "number") {
    console.log("renderNode: primitive, returning:", node);
    return node;
  }

  const { type, props = {}, children } = node;
  console.log(`renderNode: creating <${type}/> with props:`, props);

  // Normalize children into an array
  let kids = Array.isArray(children) ? children : [children];
  if (kids.length === 0 && props.children != null) {
    kids = Array.isArray(props.children) ? props.children : [props.children];
    console.log(`renderNode: fell back to props.children, now kids =`, kids);
  }

  // Drop the children prop so it isn’t passed twice
  const { children: _omit, ...restProps } = props;

  const element = React.createElement(
    type,
    restProps,
    kids.map((child, i) =>
      typeof child === "object"
        ? React.cloneElement(renderNode(child), { key: i })
        : child
    )
  );

  console.log(`renderNode: created React element for <${type}>:`, element);
  return element;
}

/**
 * Handlers keyed by component ID (only root‐level clicks)
 */
const clickHandlers = {
  1: () => console.log("This is the FIRST component!"),
  2: () => console.log("This is the SECOND component!"),
  3: () => console.log("Another component, #3!"),
};

export default function Dynamic() {
  const [nodes, setNodes] = useState(null);

  useEffect(() => {
    console.log("Dynamic: starting fetch of components");
    (async () => {
      try {
        const res = await fetch("http://localhost:4000/api/components");
        console.log("Dynamic: fetch response status:", res.status);
        const data = await res.json();
        console.log("Dynamic: fetched JSON nodes:", data);
        setNodes(data);
      } catch (err) {
        console.error("Dynamic: failed to load JSON:", err);
        setNodes([]);
      }
    })();
  }, []);

  if (nodes === null) {
    return <div>Loading components…</div>;
  }

  return (
    <div>
      <h2>🌟 Blind Dynamic Renderer</h2>
      {nodes.length === 0 && <p>No components saved yet.</p>}
      {nodes.map((node) => {
        console.log("Dynamic: mapping node:", node);

        // 1) Build the element tree purely from JSON
        let elem = renderNode(node);

        // 2) If there’s a handler for this node.id, inject it on the root element
        const handler = clickHandlers[node.id];
        if (typeof handler === "function") {
          console.log(
            `Dynamic: injecting click handler for node.id=${node.id}`
          );
          elem = React.cloneElement(elem, { onClick: handler });
        }

        console.log("Dynamic: final element to render:", elem);

        // 3) Wrap in a container with a key
        return (
          <div
            key={node.id}
            style={{
              margin: "1rem 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {elem}
          </div>
        );
      })}
    </div>
  );
}
