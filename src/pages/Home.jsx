// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from "react";
import TestRenderer from "react-test-renderer";
import Button from "@/components/Button";
import Card from "@/components/Card";
import CustomInput from "@/components/CustomInput";

/**
 * Turn *any* React element into a pure JSON tree:
 * { type: string, props: object, children: array }
 * by using react-test-renderer under the hood.
 */
function elementToJSON(element) {
  console.log("elementToJSON: input element:", element);

  // mount it in-memory
  const testInst = TestRenderer.create(element);
  let raw = testInst.toJSON();
  console.log("elementToJSON: raw TestRenderer output:", raw);

  // handle fragments/arrays
  if (Array.isArray(raw)) {
    return raw.map((child) => elementToJSON(child));
  }

  // primitives
  if (raw === null || typeof raw === "string" || typeof raw === "number") {
    return raw;
  }

  // now raw is { type, props, children }
  const { type, props, children } = raw;
  const kids = Array.isArray(children) ? children : children ? [children] : [];

  // recursively walk
  const result = {
    type,
    props: { ...props },
    children: kids.filter((c) => c != null).map((c) => elementToJSON(c)),
  };
  console.log("elementToJSON: result JSON node:", result);
  return result;
}

/**
 * Recursively converts JSON → React element (for preview).
 */
function renderNode(node) {
  if (typeof node === "string" || typeof node === "number") {
    return node;
  }
  const { type, props = {}, children = [] } = node;

  // normalize children
  let kids = Array.isArray(children) ? children : [children];
  if (kids.length === 0 && props.children != null) {
    kids = Array.isArray(props.children) ? props.children : [props.children];
  }

  // strip out children prop
  const { children: _omit, ...rest } = props;

  // special-case <input> so we don't get void-element errors or controlled warnings
  if (type === "input" && rest.value !== undefined) {
    rest.defaultValue = rest.value;
    delete rest.value;
  }

  // create the element, spreading children only when present
  const childEls = kids
    .map((c, i) =>
      typeof c === "object" ? React.cloneElement(renderNode(c), { key: i }) : c
    )
    .filter((c) => c != null);

  return React.createElement(type, rest, ...childEls);
}

/**
 * Pretty‐print JSON → HTML‐like tree.
 */
function printStructure(node, indent = 0) {
  const pad = "  ".repeat(indent);
  if (typeof node === "string" || typeof node === "number") {
    return pad + node;
  }
  const { type, props = {}, children = [] } = node;
  const attrs = Object.entries(props)
    .filter(([, v]) => typeof v !== "object")
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
  const open = `<${type}${attrs ? " " + attrs : ""}>`;
  const close = `</${type}>`;
  const kids = Array.isArray(children) ? children : [children];
  const inner = kids.map((c) => printStructure(c, indent + 1)).join("\n");
  return [pad + open, inner, pad + close].join("\n");
}

/**
 * Detail‐card for one JSON component.
 */
function ComponentDetails({ comp, onEdit, onDelete }) {
  const { id, type, props = {}, children = [] } = comp;
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        marginBottom: "1rem",
        borderRadius: "4px",
      }}
    >
      <h3>
        Component #{id}: <code>{type}</code>
      </h3>

      {/* Preview */}
      <div
        style={{
          margin: "0.5rem 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <strong style={{ marginBottom: "0.5rem" }}>Preview:</strong>
        {renderNode(comp)}
      </div>

      {/* Structure */}
      <div style={{ margin: "0.5rem 0" }}>
        <strong>Structure:</strong>
        <pre
          style={{
            background: "#000",
            color: "#0f0",
            padding: "0.5rem",
            overflowX: "auto",
          }}
        >
          {printStructure(comp)}
        </pre>
      </div>

      {/* Props */}
      <div style={{ margin: "0.5rem 0" }}>
        <strong>Props:</strong>
        {Object.keys(props).length === 0 ? (
          <p>
            <em>None</em>
          </p>
        ) : (
          <ul>
            {Object.entries(props).map(([k, v]) => (
              <li key={k}>
                <code>{k}</code>:{" "}
                {typeof v === "object" ? JSON.stringify(v) : v.toString()}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Styles */}
      {props.style && (
        <div style={{ margin: "0.5rem 0" }}>
          <strong>Styles:</strong>
          <ul>
            {Object.entries(props.style).map(([k, v]) => (
              <li key={k}>
                <code>{k}</code>: {v}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Children summary */}
      <div style={{ margin: "0.5rem 0" }}>
        <strong>Children:</strong>{" "}
        {children.length === 0 ? (
          <em>None</em>
        ) : (
          <ul>
            {children.map((c, i) => (
              <li key={i}>
                {typeof c === "object"
                  ? `<${c.type}>…</${c.type}>`
                  : JSON.stringify(c)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Edit/Delete */}
      <div style={{ marginTop: "0.5rem" }}>
        <button onClick={() => onEdit(id)}>Edit</button>{" "}
        <button onClick={() => onDelete(id)}>Delete</button>
      </div>
    </div>
  );
}

export default function Home() {
  const [components, setComponents] = useState([]);
  const [sampleType, setSampleType] = useState("button");

  // inline‐editor state
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const editorRef = useRef(null);

  // initial fetch
  useEffect(() => {
    console.log("Home: fetching initial components");
    (async () => {
      try {
        const res = await fetch("http://localhost:4000/api/components");
        const data = await res.json();
        console.log("Home: initial components:", data);
        setComponents(data);
      } catch (err) {
        console.error("Home: fetch error:", err);
      }
    })();
  }, []);

  const fetchComponents = async () => {
    console.log("Home: re-fetching components");
    try {
      const res = await fetch("http://localhost:4000/api/components");
      const data = await res.json();
      console.log("Home: re-fetched components:", data);
      setComponents(data);
    } catch (err) {
      console.error("Home: re-fetch error:", err);
    }
  };

  const createSample = () => {
    console.log("Home: creating sample of type:", sampleType);
    let element;
    if (sampleType === "button") {
      element = <Button label="Click Me" />;
    } else if (sampleType === "card") {
      element = (
        <Card
          title="Sample Card"
          content="This is a card created from the real component."
          tags={["demo", "test"]}
          footer="Card Footer"
          actions={[
            { label: "OK", onClick: () => alert("OK!") },
            { label: "Cancel", onClick: () => alert("Canceled!") },
          ]}
          style={{ maxWidth: 300 }}
        >
          <small>Extra child content</small>
        </Card>
      );
    } else {
      element = (
        <CustomInput
          value=""
          placeholder="Type here"
          style={{ border: "1px solid #007acc" }}
        />
      );
    }

    // flatten ANY component into JSON
    const body = elementToJSON(element);
    console.log("Home: POST body:", body);

    fetch("http://localhost:4000/api/components", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => {
        console.log("Home: createSample status:", res.status);
        return res.json();
      })
      .then((json) => {
        console.log("Home: created:", json);
        fetchComponents();
      })
      .catch((err) => console.error("Home: createSample error:", err));
  };

  const editComponent = (id) => {
    console.log("Home: editComponent id =", id);
    const comp = components.find((c) => c.id === id);
    console.log("Home: editing data:", comp);
    setEditingId(id);
    setEditingValue(JSON.stringify(comp, null, 2));
  };

  useEffect(() => {
    if (editingId != null && editorRef.current) {
      console.log("Home: scrolling editor into view:", editingId);
      editorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [editingId]);

  const saveEdit = async () => {
    console.log("Home: saveEdit id =", editingId);
    try {
      const parsed = JSON.parse(editingValue);
      console.log("Home: PUT body:", parsed);
      const res = await fetch(
        `http://localhost:4000/api/components/${editingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed),
        }
      );
      console.log("Home: saveEdit status:", res.status);
      await fetchComponents();
    } catch (err) {
      console.error("Home: saveEdit error:", err);
      alert("Invalid JSON");
    } finally {
      setEditingId(null);
      setEditingValue("");
    }
  };

  const cancelEdit = () => {
    console.log("Home: cancelEdit id =", editingId);
    setEditingId(null);
    setEditingValue("");
  };

  const deleteComponent = (id) => {
    console.log("Home: deleteComponent id =", id);
    fetch(`http://localhost:4000/api/components/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        console.log("Home: deleted status:", res.status);
        fetchComponents();
      })
      .catch((err) => console.error("Home: delete error:", err));
  };

  return (
    <div>
      <h2>⎈ Home / Manage Components</h2>
      {/* Sample creator */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Pick sample:{" "}
          <select
            value={sampleType}
            onChange={(e) => {
              console.log("Home: sampleType →", e.target.value);
              setSampleType(e.target.value);
            }}
          >
            <option value="button">Button</option>
            <option value="card">Card</option>
            <option value="input">CustomInput</option>
          </select>
        </label>{" "}
        <button onClick={createSample}>Create Sample</button>
      </div>

      {/* Inline editor */}
      {components.map((c) => (
        <React.Fragment key={c.id}>
          {editingId === c.id && (
            <div
              ref={editorRef}
              style={{
                marginBottom: "1rem",
                border: "1px solid #888",
                padding: "1rem",
              }}
            >
              <h3>Edit Component #{c.id}</h3>
              <textarea
                rows={10}
                style={{ width: "100%", fontFamily: "monospace" }}
                value={editingValue}
                onChange={(e) => {
                  console.log("Home: editingValue changed");
                  setEditingValue(e.target.value);
                }}
              />
              <div>
                <button onClick={saveEdit}>Save</button>{" "}
                <button onClick={cancelEdit}>Cancel</button>
              </div>
            </div>
          )}
          <ComponentDetails
            comp={c}
            onEdit={editComponent}
            onDelete={deleteComponent}
          />
        </React.Fragment>
      ))}

      {components.length === 0 && <p>No components yet. Create one above.</p>}
    </div>
  );
}
