// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
// use the browser‐build of ReactDOMServer
import { renderToStaticMarkup } from "react-dom/server";
import Button from "@/components/Button";
import Card from "@/components/Card";
import CustomInput from "@/components/CustomInput";

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

// serialize React element to JSON
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
      const styleObj = {};
      for (let key of node.style) {
        const raw = node.style.getPropertyValue(key);
        const camel = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        styleObj[camel] = raw;
        // RN parsing skipped here for brevity
        rnProps.style = styleObj;
      }
      webProps.style = styleObj;
    } else {
      webProps[name] = val;
      rnProps[name] = val;
    }
  }
  const children = [];
  for (let cn of Array.from(node.childNodes)) {
    const cjson = domToJson(cn);
    if (cjson != null && !(typeof cjson === "string" && cjson.trim() === ""))
      children.push(cjson);
  }
  return { type, webProps, children, nativeComponent, rnProps };
}

export default function Home() {
  const [components, setComponents] = useState([]);
  const [sampleType, setSampleType] = useState("button");

  // load saved JSON
  useEffect(() => {
    fetch("http://localhost:4000/api/components")
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        return res.json();
      })
      .then(setComponents)
      .catch((err) => console.error("Home fetch error:", err));
  }, []);

  // create + POST
  const createSample = async () => {
    let element;
    if (sampleType === "button") {
      element = <Button label="Click Me" style={{ margin: "8px" }} />;
    } else if (sampleType === "card") {
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
    } else {
      element = (
        <CustomInput
          value=""
          placeholder="Type here"
          style={{ border: "1px solid #007acc" }}
        />
      );
    }
    try {
      const json = elementToJSON(element);
      const res = await fetch("http://localhost:4000/api/components", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      if (!res.ok) throw new Error(res.status);
      const saved = await res.json();
      setComponents((prev) => [...prev, saved]);
    } catch (err) {
      console.error("Home save error:", err);
    }
  };

  // delete handler
  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`http://localhost:4000/api/components/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(res.status);
      setComponents((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // edit handler
  const editItem = async (item) => {
    const text = window.prompt(
      "Edit component JSON:",
      JSON.stringify(item, null, 2)
    );
    if (!text) return;
    try {
      const updated = JSON.parse(text);
      const res = await fetch(
        `http://localhost:4000/api/components/${item.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        }
      );
      if (!res.ok) throw new Error(res.status);
      const saved = await res.json();
      setComponents((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
    } catch (err) {
      console.error("Edit error:", err);
      alert("Invalid JSON or update failed.");
    }
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
          </select>
        </label>
        <button onClick={createSample}>Create Sample</button>
      </div>

      <h3>Saved JSON</h3>
      {components.length === 0 ? (
        <p>No components yet.</p>
      ) : (
        components.map((c) => (
          <div
            key={c.id}
            style={{
              background: "#000",
              color: "#0f0",
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <pre style={{ overflowX: "auto" }}>
              {JSON.stringify(c, null, 2)}
            </pre>
            <button onClick={() => editItem(c)} style={{ marginRight: "8px" }}>
              Edit
            </button>
            <button onClick={() => deleteItem(c.id)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
}
