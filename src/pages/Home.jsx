// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
// use the browser-build of ReactDOMServer
import { renderToStaticMarkup } from "react-dom/server";
import Button from "@/components/Button";
import Card from "@/components/Card";
import CustomInput from "@/components/CustomInput";
import SamplePage from "@/components/SamplePage";

// Map HTML tags to React Native equivalents
const rnComponentMap = {
  div: "View",
  span: "Text",
  p: "Text",
  h1: "Text",
  h2: "Text",
  h3: "Text",
  h4: "Text",
  h5: "Text",
  h6: "Text",
  header: "View",
  footer: "View",
  section: "View",
  article: "View",
  nav: "View",
  main: "View",
  aside: "View",
  figure: "View",
  figcaption: "Text",
  ul: "View",
  ol: "View",
  li: "Text",
  button: "TouchableOpacity",
  input: "TextInput",
  textarea: "TextInput",
  select: "Picker",
  option: "Picker.Item",
  label: "Text",
  img: "Image",
  video: "Video",
  audio: "Audio",
  canvas: "ART.Surface",
  svg: "Svg",
  table: "View",
  thead: "View",
  tbody: "View",
  tr: "View",
  th: "Text",
  td: "Text",
  form: "View",
  small: "Text",
  strong: "Text",
  em: "Text",
  blockquote: "View",
  code: "Text",
  pre: "Text",
  a: "Text",
};

// Serialize React element to JSON
function elementToJSON(element) {
  const html = renderToStaticMarkup(element);
  const doc = new DOMParser().parseFromString(html, "text/html");
  const node = doc.body.firstElementChild;
  if (!node) throw new Error("elementToJSON: no DOM node");
  return domToJson(node);
}

function domToJson(node) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const type = node.tagName.toLowerCase();
  const nativeComponent = rnComponentMap[type] || type;
  const webProps = {};
  const rnProps = {};
  for (let attr of Array.from(node.attributes)) {
    let name = attr.name;
    const val = attr.value;
    if (name === "class") name = "className";
    if (name === "for") name = "htmlFor";
    if (name === "style") {
      // Build web style object (camelCase keys, raw CSS values)
      const webStyle = {};
      // Build RN style object (camelCase keys, numeric px/rem values)
      const rnStyle = {};
      for (let key of node.style) {
        const raw = node.style.getPropertyValue(key);
        const camel = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        webStyle[camel] = raw;
        const pxMatch = raw.match(/^(\d+(?:\.\d+)?)px$/);
        const remMatch = raw.match(/^(\d+(?:\.\d+)?)(rem|em)$/);
        if (pxMatch) {
          rnStyle[camel] = parseFloat(pxMatch[1]);
        } else if (remMatch) {
          rnStyle[camel] = parseFloat(remMatch[1]) * 16;
        } else {
          rnStyle[camel] = raw;
        }
      }
      webProps.style = webStyle;
      rnProps.style = rnStyle;
    } else {
      webProps[name] = val;
      rnProps[name] = val;
    }
  }
  const children = [];
  for (let cn of Array.from(node.childNodes)) {
    const cjson = domToJson(cn);
    if (cjson != null && !(typeof cjson === "string" && cjson.trim() === "")) {
      children.push(cjson);
    }
  }
  return { type, webProps, children, nativeComponent, rnProps };
}

export default function Home() {
  const [components, setComponents] = useState([]);
  const [sampleType, setSampleType] = useState("button");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  // Fetch saved JSON on mount
  useEffect(() => {
    fetch("http://localhost:4000/api/components")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setComponents)
      .catch((err) => console.error("Home: fetch error:", err));
  }, []);

  // Create + POST
  const createSample = async () => {
    let element;
    switch (sampleType) {
      case "button":
        element = <Button label="Click Me" style={{ margin: "8px" }} />;
        break;
      case "card":
        element = (
          <Card
            title="Sample Card"
            content="This is a demo card."
            tags={["demo", "test"]}
            footer="Footer text"
            style={{ border: "1px solid #ccc", padding: "16px" }}
          >
            <small>Extra child</small>
          </Card>
        );
        break;
      case "input":
        element = (
          <CustomInput
            value=""
            placeholder="Type here"
            style={{ border: "1px solid #007acc" }}
          />
        );

        break;

      case "page":
        element = <SamplePage />;

        break;
      default:
        element = <div>Unknown sample</div>;
    }

    try {
      const json = elementToJSON(element);
      const res = await fetch("http://localhost:4000/api/components", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json();
      setComponents((prev) => [...prev, saved]);
    } catch (err) {
      console.error("Home: save error:", err);
    }
  };

  // Delete handler
  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`http://localhost:4000/api/components/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setComponents((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Home: delete error:", err);
    }
  };

  // Edit init
  const startEdit = (item) => {
    setEditId(item.id);
    setEditText(JSON.stringify(item, null, 2));
  };

  // Save edited item
  const saveEdit = async () => {
    try {
      const updated = JSON.parse(editText);
      const res = await fetch(
        `http://localhost:4000/api/components/${editId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json();
      setComponents((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
      cancelEdit();
    } catch (err) {
      console.error("Home: edit save error:", err);
      alert("Failed to save. Please check JSON format.");
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditText("");
  };

  return (
    <div>
      <h2>⎈ Home / Manage Components</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Pick sample:{" "}
          <select
            value={sampleType}
            onChange={(e) => setSampleType(e.target.value)}
          >
            <option value="button">Button</option>
            <option value="card">Card</option>
            <option value="input">CustomInput</option>
            <option value="page">Sample Page</option>
          </select>
        </label>{" "}
        <button onClick={createSample}>Create Sample</button>
      </div>

      <h3>Saved JSON</h3>
      {components.length === 0 && <p>No components yet.</p>}

      {components.map((c) => (
        <div
          key={c.id}
          style={{
            background: "black",
            color: "green",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          {editId === c.id ? (
            <>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={10}
                style={{ width: "100%", fontFamily: "monospace" }}
              />
              <div style={{ marginTop: "0.5rem" }}>
                <button onClick={saveEdit} style={{ marginRight: "8px" }}>
                  Save
                </button>
                <button onClick={cancelEdit}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <pre style={{ overflowX: "auto" }}>
                {JSON.stringify(c, null, 2)}
              </pre>
              <button
                onClick={() => startEdit(c)}
                style={{ marginRight: "8px" }}
              >
                Edit
              </button>
              <button onClick={() => deleteItem(c.id)}>Delete</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
