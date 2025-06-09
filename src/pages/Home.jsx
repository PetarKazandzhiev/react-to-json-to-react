// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Button from "@/components/Button";
import Card from "@/components/Card";
import CustomInput from "@/components/CustomInput";
import SamplePage from "@/components/SamplePage";
import AnimatedButton from "@/components/AnimatedButton";
import TransitionBox from "@/components/TransitionBox";

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

const parseBoxShadow = (raw) => {
  return {
    boxShadow: raw,
  };
};

const parseTransform = (raw) => {
  // convert e.g. "scale(1.2) translateX(10px)"
  const ops = [];
  raw.replace(/([a-z]+)\(([^)]+)\)/g, (_, fn, arg) => {
    const val = parseFloat(arg);
    if (fn === "scale") ops.push({ scale: val });
    else if (fn === "translateX") ops.push({ translateX: val });
    else if (fn === "translateY") ops.push({ translateY: val });
    else if (fn === "rotate") ops.push({ rotate: arg });
  });
  return ops;
};

// parse a single CSS transition declaration, e.g. "opacity 300ms ease-in 100ms"
const parseTransition = (raw) => {
  const [property, dur, timing = "ease", delay = "0ms"] = raw.split(/\s+/);
  return {
    property,
    duration: parseFloat(dur),
    delay: parseFloat(delay),
    easing: timing,
  };
};

// parse CSS animation shorthand robustly, e.g. "fadeIn 2s ease-in-out 0s infinite"
const parseAnimation = (raw) => {
  if (typeof raw !== "string") return null;
  const parts = raw.trim().split(/\s+/);
  const name = parts[0] || "";

  // pick out all tokens ending in "ms" or "s" (but not "infinite")
  const timeTokens = parts.filter((p) => p && /(^\d+\.?\d*(ms|s)$)/.test(p));
  let duration = 0,
    delay = 0;
  if (timeTokens.length >= 1) {
    const d = timeTokens[0];
    duration = d.endsWith("ms") ? parseFloat(d) : parseFloat(d) * 1000;
  }
  if (timeTokens.length >= 2) {
    const dl = timeTokens[1];
    delay = dl.endsWith("ms") ? parseFloat(dl) : parseFloat(dl) * 1000;
  }

  // easing: first token that looks like "ease", "linear", or "cubic-bezier(...)"
  const easingToken =
    parts.find(
      (p) => /^ease/.test(p) || p === "linear" || /^cubic-bezier/.test(p)
    ) || "ease";

  // iteration: "infinite" or the first plain integer
  const iterationCount = parts.includes("infinite")
    ? Infinity
    : parseInt(parts.find((p) => /^\d+$/.test(p)) || "1", 10);

  return {
    name,
    duration,
    delay,
    easing: easingToken,
    iterationCount,
  };
};

// expand shorthand margin/padding
const expandQuad = (prop, raw) => {
  const parts = raw.split(/\s+/).map((v) => parseFloat(v));
  const [a, b, c, d] =
    parts.length === 1
      ? [parts[0], parts[0], parts[0], parts[0]]
      : parts.length === 2
      ? [parts[0], parts[1], parts[0], parts[1]]
      : parts.length === 3
      ? [parts[0], parts[1], parts[2], parts[1]]
      : [parts[0], parts[1], parts[2], parts[3]];
  return {
    [`${prop}Top`]: a,
    [`${prop}Right`]: b,
    [`${prop}Bottom`]: c,
    [`${prop}Left`]: d,
  };
};

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

  // 1) style
  const rawStyle = node.getAttribute("style");
  if (rawStyle) {
    const webStyle = {};
    const rnStyle = {};

    Array.from(node.style).forEach((key) => {
      const raw = node.style.getPropertyValue(key);
      const prop = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      webStyle[prop] = raw;

      // RN conversion
      if (/^-?\d+(\.\d+)?px$/.test(raw)) {
        rnStyle[prop] = parseFloat(raw);
      } else if (/^-?\d+(\.\d+)?(rem|em)$/.test(raw)) {
        rnStyle[prop] = parseFloat(raw) * 16;
      } else if (/%$/.test(raw)) {
        // keep percentage
        rnStyle[prop] = raw;
      } else if (prop === "margin" || prop === "padding") {
        Object.assign(rnStyle, expandQuad(prop, raw));
      } else if (prop === "border") {
        // "1px solid #ccc"
        const [w, style, color] = raw.split(/\s+/);
        rnStyle.borderWidth = parseFloat(w);
        rnStyle.borderStyle = style;
        rnStyle.borderColor = color;
      } else if (prop === "borderRadius") {
        rnStyle.borderRadius = parseFloat(raw);
      } else if (prop === "boxShadow") {
        Object.assign(rnStyle, parseBoxShadow(raw));
      } else if (prop === "background" && raw.startsWith("linear-gradient")) {
        // drop gradients in RN
      } else if (prop === "transform") {
        rnStyle.transform = parseTransform(raw);
      } else if (prop === "transition") {
        // capture one or more transitions
        const transitions = raw
          .split(",")
          .map((r) => parseTransition(r.trim()));
        rnProps.transitions = transitions;
      } else if (prop === "animation" || prop.startsWith("animation")) {
        // handle a single animation shorthand
        rnProps.animations = (rnProps.animations || []).concat(
          parseAnimation(raw)
        );
      } else {
        rnStyle[prop] = raw;
      }
    });

    webProps.style = webStyle;
    rnProps.style = rnStyle;
  }

  // 2) other attributes
  Array.from(node.attributes).forEach((attr) => {
    if (attr.name === "style") return;
    webProps[attr.name] = attr.value;
    rnProps[attr.name] = attr.value;
  });

  // 3) children
  const children = [];
  node.childNodes.forEach((cn) => {
    const cjson = domToJson(cn);
    if (cjson != null && !(typeof cjson === "string" && cjson.trim() === "")) {
      children.push(cjson);
    }
  });

  return { type, nativeComponent, webProps, rnProps, children };
}

export default function Home() {
  const [components, setComponents] = useState([]);
  const [sampleType, setSampleType] = useState("button");

  useEffect(() => {
    fetch("http://localhost:4000/api/components")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setComponents)
      .catch((err) => console.error("Home: fetch error:", err));
  }, []);

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
      case "AnimatedButton":
        element = (
          <AnimatedButton
            label="Click Me"
            onClick={() => alert("Clicked!")}
            style={{ margin: "8px" }}
          />
        );
        break;
      case "TransitionBox":
        element = (
          <TransitionBox
            style={{ width: "100px", height: "100px", backgroundColor: "blue" }}
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
            {[
              "button",
              "card",
              "input",
              "AnimatedButton",
              "TransitionBox",
              "page",
            ].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>{" "}
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
              background: "black",
              color: "green",
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <pre style={{ overflowX: "auto" }}>
              {JSON.stringify(c, null, 2)}
            </pre>
            <button onClick={() => deleteItem(c.id)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
}
