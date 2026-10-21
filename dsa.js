// DSA layer used by the Smart City Management System.
// The web API calls these structures instead of treating the project as
// a simple CRUD application.

export class Queue {
  constructor(items = []) { this.items = [...items]; }
  enqueue(item) { this.items.push(item); }
  dequeue() { return this.items.shift() ?? null; }
  peek() { return this.items[0] ?? null; }
  size() { return this.items.length; }
  toArray() { return [...this.items]; }
}

export class PriorityQueue {
  constructor(items = []) {
    this.items = [];
    items.forEach(item => this.enqueue(item));
  }
  enqueue(item) {
    this.items.push(item);
    this.items.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }
  dequeue() { return this.items.shift() ?? null; }
  peek() { return this.items[0] ?? null; }
  size() { return this.items.length; }
  toArray() { return [...this.items]; }
}

// Singly linked list for complaint records.
export class LinkedList {
  constructor(items = []) {
    this.head = null;
    this.tail = null;
    this.length = 0;
    items.forEach(item => this.append(item));
  }
  append(data) {
    const node = { data, next: null };
    if (!this.head) this.head = node;
    else this.tail.next = node;
    this.tail = node;
    this.length++;
  }
  find(predicate) {
    let current = this.head;
    while (current) {
      if (predicate(current.data)) return current.data;
      current = current.next;
    }
    return null;
  }
  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }
}

// Undirected weighted graph + Dijkstra shortest path.
export class CityGraph {
  constructor(edges = []) {
    this.adj = new Map();
    edges.forEach(([a, b, weight]) => this.addEdge(a, b, weight));
  }
  addEdge(a, b, weight) {
    if (!this.adj.has(a)) this.adj.set(a, []);
    if (!this.adj.has(b)) this.adj.set(b, []);
    this.adj.get(a).push({ node: b, weight });
    this.adj.get(b).push({ node: a, weight });
  }
  shortestPath(start, end) {
    if (!this.adj.has(start) || !this.adj.has(end)) {
      return { distance: null, path: [], message: "Location not found" };
    }

    const dist = new Map();
    const previous = new Map();
    const unvisited = new Set(this.adj.keys());

    for (const node of unvisited) dist.set(node, Infinity);
    dist.set(start, 0);

    while (unvisited.size) {
      let current = null;
      let best = Infinity;
      for (const node of unvisited) {
        if (dist.get(node) < best) {
          best = dist.get(node);
          current = node;
        }
      }

      if (current === null || best === Infinity) break;
      unvisited.delete(current);
      if (current === end) break;

      for (const edge of this.adj.get(current)) {
        if (!unvisited.has(edge.node)) continue;
        const candidate = dist.get(current) + edge.weight;
        if (candidate < dist.get(edge.node)) {
          dist.set(edge.node, candidate);
          previous.set(edge.node, current);
        }
      }
    }

    if (dist.get(end) === Infinity) return { distance: null, path: [] };

    const path = [];
    let current = end;
    while (current) {
      path.unshift(current);
      current = previous.get(current);
    }
    return { distance: dist.get(end), path };
  }
}

export function binarySearchById(items, id) {
  let low = 0, high = items.length - 1;
  const sorted = [...items].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const value = String(sorted[mid].id);
    if (value === String(id)) return sorted[mid];
    if (value < String(id)) low = mid + 1;
    else high = mid - 1;
  }
  return null;
}

export function mergeSort(items, key = "id") {
  if (items.length <= 1) return [...items];
  const mid = Math.floor(items.length / 2);
  const left = mergeSort(items.slice(0, mid), key);
  const right = mergeSort(items.slice(mid), key);
  const out = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (String(left[i][key]).localeCompare(String(right[j][key])) <= 0) out.push(left[i++]);
    else out.push(right[j++]);
  }
  return out.concat(left.slice(i), right.slice(j));
}
