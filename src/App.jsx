import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import "./App.css";
import Home from "./pages/Home";
import Dynamic from "./pages/Dynamic";

function App() {
  // const [count, setCount] = useState(0);
  const [tab, setTab] = useState("home");

  return (
    <>
      <>
        <nav>
          <button
            style={{ marginRight: "20px" }}
            onClick={() => setTab("home")}
          >
            Home
          </button>
          <button onClick={() => setTab("dynamic")}>Dynamic</button>
        </nav>
        <hr />
        {tab === "home" ? <Home /> : <Dynamic />}
      </>
      {/* <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
    </>
  );
}

export default App;
