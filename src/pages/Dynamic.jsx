// src/pages/Dynamic.jsx
import React, { useState, useEffect } from "react";

// helper to convert camelCase → kebab-case for CSS
const toKebab = (str) => str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

// build a single CSS <style> string from all nodes’ webProps.style definitions
const buildCSS = (nodes) =>
  nodes
    .map((node) => {
      const def = node.webProps?.style;
      if (!def) return "";
      const cls = `dyn-${node.id}`;
      const {
        base = {},
        hover = {},
        active = {},
        focus = {},
        media = {},
      } = def;

      // base rules
      let css = `.${cls} { ${Object.entries(base)
        .map(([k, v]) => `${toKebab(k)}: ${v};`)
        .join(" ")} }`;

      // pseudo-classes
      if (Object.keys(hover).length) {
        css += ` .${cls}:hover { ${Object.entries(hover)
          .map(([k, v]) => `${toKebab(k)}: ${v};`)
          .join(" ")} }`;
      }
      if (Object.keys(active).length) {
        css += ` .${cls}:active { ${Object.entries(active)
          .map(([k, v]) => `${toKebab(k)}: ${v};`)
          .join(" ")} }`;
      }
      if (Object.keys(focus).length) {
        css += ` .${cls}:focus { ${Object.entries(focus)
          .map(([k, v]) => `${toKebab(k)}: ${v};`)
          .join(" ")} }`;
      }

      // media queries
      Object.entries(media).forEach(([query, states]) => {
        const mqBase = states.base || {};
        if (Object.keys(mqBase).length) {
          css += ` @media ${query} { .${cls} { ${Object.entries(mqBase)
            .map(([k, v]) => `${toKebab(k)}: ${v};`)
            .join(" ")} } }`;
        }
      });

      return css;
    })
    .join("\n");

function renderNode(node) {
  if (node == null || typeof node === "string" || typeof node === "number") {
    return node;
  }

  const { type, webProps = {}, children = [] } = node;
  const cls = node.id ? `dyn-${node.id}` : undefined;

  // copy webProps into domProps
  const domProps = { ...webProps };
  if (cls) domProps.className = cls;

  // uncontrolled inputs: drop value → defaultValue
  if ((type === "input" || type === "textarea") && domProps.value != null) {
    domProps.defaultValue = domProps.value;
    delete domProps.value;
  }

  // recurse children
  const kids = (Array.isArray(children) ? children : [children]).map((c, i) =>
    typeof c === "object" ? React.cloneElement(renderNode(c), { key: i }) : c
  );

  return React.createElement(type, domProps, ...kids);
}

export default function Dynamic() {
  const [nodes, setNodes] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:4000/api/components");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setNodes(await res.json());
      } catch (err) {
        console.error("Dynamic: load error:", err);
        setNodes([]);
      }
    })();
  }, []);

  if (nodes === null) {
    return <div>Loading components…</div>;
  }

  return (
    <>
      {/* Inject generated CSS */}
      <style>{buildCSS(nodes)}</style>

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
    </>
  );
}
