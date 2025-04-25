// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
// use the browser‐build of ReactDOMServer
import { renderToStaticMarkup } from "react-dom/server";
import Button from "@/components/Button";
import Card from "@/components/Card";
import CustomInput from "@/components/CustomInput";

/**
 * Turn *any* React element into a JSON tree of HTML nodes:
 *   { type: string, props: object, children: array }
 */
function elementToJSON(element) {
  // 1. render to HTML string
  const html = renderToStaticMarkup(element);

  // 2. parse it into a Document
  const doc = new DOMParser().parseFromString(html, "text/html");

  // 3. grab the first element under <body>
  const domNode = doc.body.firstElementChild;
  if (!domNode) {
    throw new Error("elementToJSON: no DOM node produced");
  }

  // 4. walk it
  return domToJson(domNode);
}

function domToJson(node) {
  // text node → string
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent;
  }
  // only handle ELEMENT_NODE otherwise
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const type = node.tagName.toLowerCase();
  const props = {};

  // convert attributes → props
  for (const attr of Array.from(node.attributes)) {
    let name = attr.name;
    if (name === "class") name = "className";
    if (name === "for") name = "htmlFor";

    if (name === "style") {
      // build a proper style object
      const styleObj = {};
      for (const propName of node.style) {
        styleObj[propName] = node.style.getPropertyValue(propName);
      }
      props.style = styleObj;
    } else {
      props[name] = attr.value;
    }
  }

  // children
  const children = [];
  for (const cn of Array.from(node.childNodes)) {
    const childJson = domToJson(cn);
    if (
      childJson != null &&
      // skip whitespace‐only text nodes
      !(typeof childJson === "string" && childJson.trim() === "")
    ) {
      children.push(childJson);
    }
  }

  return { type, props, children };
}

export default function Home() {
  const [components, setComponents] = useState([]);
  const [sampleType, setSampleType] = useState("button");

  // fetch saved JSON on mount
  useEffect(() => {
    fetch("http://localhost:4000/api/components")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setComponents)
      .catch((err) => console.error("Home: fetch error:", err));
  }, []);

  // create + POST
  const createSample = async () => {
    let element;
    switch (sampleType) {
      case "button":
        element = <Button label="Click Me" style={{ margin: "0.5rem" }} />;
        break;
      case "card":
        element = (
          <Card
            title="Sample Card"
            content="This is a demo card."
            tags={["demo", "test"]}
            footer="Footer text"
            style={{ border: "1px solid #ccc", padding: "1rem" }}
          >
            <small>Extra child</small>
          </Card>
        );
        break;
      default:
        element = (
          <CustomInput
            value=""
            placeholder="Type here"
            style={{ border: "1px solid #007acc" }}
          />
        );
    }

    // build JSON from DOM
    let json;
    try {
      json = elementToJSON(element);
    } catch (err) {
      console.error("Home: elementToJSON error:", err);
      return;
    }

    // POST it
    try {
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
        </label>{" "}
        <button onClick={createSample}>Create Sample</button>
      </div>

      <h3>Saved JSON</h3>
      {components.length === 0 ? (
        <p>No components yet.</p>
      ) : (
        components.map((c) => (
          <pre
            key={c.id}
            style={{
              background: "black",
              color: "green",
              padding: "1rem",
              overflowX: "auto",
            }}
          >
            {JSON.stringify(c, null, 2)}
          </pre>
        ))
      )}
    </div>
  );
}
