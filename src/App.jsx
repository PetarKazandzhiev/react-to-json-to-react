import React, { useState } from "react";
import "./App.css";
import Home from "./pages/Home";
import Dynamic from "./pages/Dynamic";
import RNDynamic from "./pages/RNDynamic";

function App() {
  const [tab, setTab] = useState("home");

  return (
    <>
      <nav style={{ marginBottom: "1rem" }}>
        <button style={{ marginRight: "1rem" }} onClick={() => setTab("home")}>
          Home
        </button>
        <button
          style={{ marginRight: "1rem" }}
          onClick={() => setTab("dynamic")}
        >
          Dynamic
        </button>
        <button onClick={() => setTab("rn-dynamic")}>
          React Native Dynamic
        </button>
      </nav>
      <hr />
      <div>
        {tab === "home" && <Home />}
        {tab === "dynamic" && <Dynamic />}
        {tab === "rn-dynamic" && <RNDynamic />}
      </div>
    </>
  );
}

export default App;
