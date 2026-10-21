import { Queue, PriorityQueue, LinkedList, CityGraph, mergeSort } from "./dsa.js";

export const locations = [
  "City Center", "Railway Station", "Bus Terminal", "University",
  "Hospital", "Airport", "Industrial Area", "Old Town"
];

export const graph = new CityGraph([
  ["City Center", "Railway Station", 4],
  ["City Center", "Bus Terminal", 3],
  ["City Center", "University", 6],
  ["Railway Station", "Airport", 9],
  ["Railway Station", "Old Town", 5],
  ["Bus Terminal", "University", 4],
  ["Bus Terminal", "Old Town", 7],
  ["University", "Hospital", 3],
  ["Hospital", "Airport", 5],
  ["Old Town", "Industrial Area", 6],
  ["Airport", "Industrial Area", 8]
]);

export const state = {
  traffic: {
    congestion: 62,
    activeIncidents: 4,
    avgSpeed: 31,
    routes: [
      { id: "R-101", from: "City Center", to: "University", status: "Moderate", congestion: 54 },
      { id: "R-102", from: "Railway Station", to: "Airport", status: "Heavy", congestion: 82 },
      { id: "R-103", from: "Bus Terminal", to: "Hospital", status: "Clear", congestion: 24 }
    ]
  },

  waste: {
    requests: new Queue([
      { id: "W-201", area: "Old Town", type: "Garbage Pickup", priority: 2, status: "Pending" },
      { id: "W-202", area: "University", type: "Recycling", priority: 1, status: "Pending" },
      { id: "W-203", area: "Industrial Area", type: "Overflow Bin", priority: 3, status: "Pending" }
    ])
  },

  parking: {
    slots: Array.from({ length: 24 }, (_, i) => ({
      id: `P-${String(i + 1).padStart(2, "0")}`,
      zone: i < 8 ? "City Center" : i < 16 ? "University" : "Railway Station",
      occupied: [1, 4, 7, 9, 12, 15, 18, 21].includes(i)
    }))
  },

  emergency: {
    requests: new PriorityQueue([
      { id: "E-301", type: "Ambulance", location: "Hospital", priority: 5, status: "Active" },
      { id: "E-302", type: "Fire", location: "Industrial Area", priority: 4, status: "Waiting" },
      { id: "E-303", type: "Police", location: "Old Town", priority: 3, status: "Waiting" }
    ])
  },

  streetLights: {
    requests: new Queue([
      { id: "SL-401", location: "Old Town Road", issue: "Light not working", status: "Pending" },
      { id: "SL-402", location: "University Gate", issue: "Flickering", status: "Pending" },
      { id: "SL-403", location: "Airport Road", issue: "Pole damaged", status: "Pending" }
    ])
  },

  complaints: new LinkedList([
    { id: "C-501", citizen: "Aarav", category: "Waste", description: "Bin overflowing near market", priority: "High", status: "In Progress" },
    { id: "C-502", citizen: "Meera", category: "Street Light", description: "Street is dark after 9 PM", priority: "Medium", status: "Pending" },
    { id: "C-503", citizen: "Kabir", category: "Parking", description: "Parking slot information is outdated", priority: "Low", status: "Resolved" }
  ])
};

export function dashboard() {
  const parkingTotal = state.parking.slots.length;
  const occupied = state.parking.slots.filter(s => s.occupied).length;
  const complaints = state.complaints.toArray();

  return {
    traffic: state.traffic,
    waste: { pending: state.waste.requests.size(), next: state.waste.requests.peek() },
    parking: { total: parkingTotal, occupied, available: parkingTotal - occupied },
    emergency: { active: state.emergency.requests.toArray().filter(x => x.status === "Active").length, queue: state.emergency.requests.size() },
    streetLights: { pending: state.streetLights.requests.size() },
    complaints: {
      total: complaints.length,
      pending: complaints.filter(c => c.status !== "Resolved").length,
      resolved: complaints.filter(c => c.status === "Resolved").length
    }
  };
}

export function reportData() {
  const complaints = mergeSort(state.complaints.toArray(), "id");
  return {
    generatedAt: new Date().toISOString(),
    summary: dashboard(),
    complaints,
    wasteQueue: state.waste.requests.toArray(),
    emergencyQueue: state.emergency.requests.toArray(),
    streetLights: state.streetLights.requests.toArray(),
    parking: state.parking.slots
  };
}
