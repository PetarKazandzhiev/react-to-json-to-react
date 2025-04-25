// server/index.js
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let components = [];
let nextId = 1;

// List all
app.get("/api/components", (req, res) => {
  res.json(components);
});

// Get one
app.get("/api/components/:id", (req, res) => {
  const comp = components.find((c) => c.id === +req.params.id);
  if (!comp) return res.status(404).json({ error: "Not found" });
  res.json(comp);
});

// Create
app.post("/api/components", (req, res) => {
  const comp = { id: nextId++, ...req.body };
  components.push(comp);
  res.status(201).json(comp);
});

// Update
app.put("/api/components/:id", (req, res) => {
  const id = +req.params.id;
  const idx = components.findIndex((c) => c.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  components[idx] = { id, ...req.body };
  res.json(components[idx]);
});

// Delete
app.delete("/api/components/:id", (req, res) => {
  const id = +req.params.id;
  components = components.filter((c) => c.id !== id);
  res.json({ success: true });
});

app.listen(4000, () =>
  console.log("Mock API running at http://localhost:4000")
);
