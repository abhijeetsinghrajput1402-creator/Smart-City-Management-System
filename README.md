# Smart City Management System — Full Stack PBL Project

This project is the web implementation of the Smart City Management System discussed in the PBL report and upper chat.

## Architecture

- Frontend: React + Vite
- Backend: Node.js + Express
- Data: simulated in-memory data, matching the academic project scope
- DSA layer: Graph, Dijkstra, Queue, Priority Queue, Linked List, Searching and Sorting

## Modules

1. Traffic Management
2. Waste Management
3. Smart Parking
4. Emergency Services
5. Street-Light Maintenance
6. Citizen Complaints
7. Reports & Results

## Run backend

```bash
cd backend
npm install
npm run dev
```

## Run frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

## DSA mapping to the report

| Smart-city feature | DSA |
|---|---|
| Traffic / routes | Weighted graph + Dijkstra |
| Waste requests | Queue |
| Emergency requests | Priority Queue |
| Parking slots | Array / Vector-style collection |
| Street-light maintenance | Queue |
| Citizen complaints | Linked List |
| Complaint search | Binary Search |
| Reports | Merge Sort / searching |

## Important

This is a software simulation, not a real sensor/IoT deployment. It is intentionally designed so that the DSA concepts can be demonstrated clearly during a PBL viva or presentation.
