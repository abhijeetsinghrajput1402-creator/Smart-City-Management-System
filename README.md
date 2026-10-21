# Smart City Management System — Backend

## Run

```bash
npm install
npm run dev
```

Server: `http://localhost:5000`

## DSA mapping

- `CityGraph` + Dijkstra → Traffic / route management
- `Queue` → Waste and street-light requests
- `PriorityQueue` → Emergency requests
- `LinkedList` → Citizen complaints
- `binarySearchById` → Complaint search
- `mergeSort` → Reports and sorted complaint records

The backend currently uses in-memory simulated data, matching the project's academic/simulation scope.
