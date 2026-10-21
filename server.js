import express from "express";
import cors from "cors";
import { dashboard, graph, locations, state, reportData } from "./store.js";
import { binarySearchById, mergeSort } from "./dsa.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "Smart City Backend" }));

app.get("/api/dashboard", (req, res) => res.json(dashboard()));

app.get("/api/locations", (req, res) => res.json(locations));

app.get("/api/traffic", (req, res) => res.json(state.traffic));

app.post("/api/traffic/route", (req, res) => {
  const { from, to } = req.body;
  if (!from || !to) return res.status(400).json({ message: "from and to are required" });
  const result = graph.shortestPath(from, to);
  res.json(result);
});

app.get("/api/waste", (req, res) => {
  res.json(state.waste.requests.toArray());
});

app.post("/api/waste", (req, res) => {
  const { area, type, priority = 1 } = req.body;
  if (!area || !type) return res.status(400).json({ message: "area and type are required" });
  const item = {
    id: `W-${Date.now().toString().slice(-5)}`,
    area, type, priority: Number(priority), status: "Pending"
  };
  state.waste.requests.enqueue(item);
  res.status(201).json(item);
});

app.post("/api/waste/process", (req, res) => {
  const item = state.waste.requests.dequeue();
  if (!item) return res.status(404).json({ message: "No waste requests in queue" });
  item.status = "Processing";
  res.json(item);
});

app.get("/api/parking", (req, res) => res.json(state.parking.slots));

app.post("/api/parking/toggle", (req, res) => {
  const slot = state.parking.slots.find(s => s.id === req.body.id);
  if (!slot) return res.status(404).json({ message: "Parking slot not found" });
  slot.occupied = !slot.occupied;
  res.json(slot);
});

app.get("/api/emergency", (req, res) => res.json(state.emergency.requests.toArray()));

app.post("/api/emergency", (req, res) => {
  const { type, location, priority = 3 } = req.body;
  if (!type || !location) return res.status(400).json({ message: "type and location are required" });
  const item = {
    id: `E-${Date.now().toString().slice(-5)}`,
    type, location, priority: Number(priority), status: "Waiting"
  };
  state.emergency.requests.enqueue(item);
  res.status(201).json(item);
});

app.post("/api/emergency/process", (req, res) => {
  const item = state.emergency.requests.dequeue();
  if (!item) return res.status(404).json({ message: "No emergency requests" });
  item.status = "Active";
  res.json(item);
});

app.get("/api/streetlights", (req, res) => res.json(state.streetLights.requests.toArray()));

app.post("/api/streetlights", (req, res) => {
  const { location, issue } = req.body;
  if (!location || !issue) return res.status(400).json({ message: "location and issue are required" });
  const item = {
    id: `SL-${Date.now().toString().slice(-5)}`,
    location, issue, status: "Pending"
  };
  state.streetLights.requests.enqueue(item);
  res.status(201).json(item);
});

app.post("/api/streetlights/process", (req, res) => {
  const item = state.streetLights.requests.dequeue();
  if (!item) return res.status(404).json({ message: "No maintenance requests" });
  item.status = "In Progress";
  res.json(item);
});

app.get("/api/complaints", (req, res) => {
  const sorted = mergeSort(state.complaints.toArray(), "id");
  res.json(sorted);
});

app.post("/api/complaints", (req, res) => {
  const { citizen, category, description, priority = "Medium" } = req.body;
  if (!citizen || !category || !description) {
    return res.status(400).json({ message: "citizen, category and description are required" });
  }
  const item = {
    id: `C-${Date.now().toString().slice(-5)}`,
    citizen, category, description, priority, status: "Pending"
  };
  state.complaints.append(item);
  res.status(201).json(item);
});

app.get("/api/complaints/search/:id", (req, res) => {
  const found = binarySearchById(state.complaints.toArray(), req.params.id);
  if (!found) return res.status(404).json({ message: "Complaint not found" });
  res.json(found);
});

app.patch("/api/complaints/:id", (req, res) => {
  const item = state.complaints.find(c => c.id === req.params.id);
  if (!item) return res.status(404).json({ message: "Complaint not found" });
  if (req.body.status) item.status = req.body.status;
  res.json(item);
});

app.get("/api/reports", (req, res) => res.json(reportData()));

app.listen(PORT, () => {
  console.log(`Smart City backend running on http://localhost:${PORT}`);
});
