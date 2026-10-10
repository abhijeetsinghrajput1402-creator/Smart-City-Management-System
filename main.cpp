#include <iostream>
#include <vector>
#include <list>
#include <queue>
#include <string>
#include <algorithm>
#include <limits>
#include <functional>
using namespace std;

// ==================================================
// SMART CITY MANAGEMENT SYSTEM
// OOP + DATA STRUCTURES + ALGORITHMS
// ==================================================

// ---------- COMMON INPUT HELPER ----------
void clearInput() {
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
}

// ---------- ABSTRACTION + INHERITANCE ----------
// Abstract base class for all city services
class CityService {
public:
    virtual void showStatus() const = 0;

    virtual ~CityService() {}
};

// ---------- CITIZEN CLASS ----------
class Citizen {
private:
    int id;
    string name;
    string address;

public:
    Citizen(int i, string n, string a)
        : id(i), name(n), address(a) {}

    int getId() const { return id; }
    string getName() const { return name; }

    void display() const {
        cout << "ID: " << id
             << " | Name: " << name
             << " | Address: " << address << "\n";
    }
};

// ---------- 1. COMPLAINT MANAGEMENT ----------
// Data structure: Linked List
struct Complaint {
    int id;
    string citizen;
    string issue;
    string status;
};

class ComplaintManager : public CityService {
private:
    list<Complaint> complaints;
    int nextId = 1;

public:
    void addComplaint() {
        Complaint c;
        c.id = nextId++;

        clearInput();
        cout << "Citizen name: ";
        getline(cin, c.citizen);

        cout << "Complaint: ";
        getline(cin, c.issue);

        c.status = "Pending";
        complaints.push_back(c);

        cout << "Complaint registered. ID: "
             << c.id << "\n";
    }

    void viewComplaints() const {
        if (complaints.empty()) {
            cout << "No complaints available.\n";
            return;
        }

        for (const auto& c : complaints) {
            cout << "\nComplaint ID: " << c.id
                 << "\nCitizen: " << c.citizen
                 << "\nIssue: " << c.issue
                 << "\nStatus: " << c.status << "\n";
        }
    }

    void updateComplaint() {
        int id;
        cout << "Enter complaint ID: ";
        cin >> id;

        for (auto& c : complaints) {
            if (c.id == id) {
                cout << "1. In Progress\n";
                cout << "2. Resolved\n";
                cout << "Choice: ";

                int choice;
                cin >> choice;

                if (choice == 1)
                    c.status = "In Progress";
                else if (choice == 2)
                    c.status = "Resolved";
                else {
                    cout << "Invalid choice.\n";
                    return;
                }

                cout << "Complaint status updated.\n";
                return;
            }
        }

        cout << "Complaint not found.\n";
    }

    void showStatus() const override {
        cout << "Complaint records: "
             << complaints.size() << "\n";
    }

    int count() const {
        return static_cast<int>(complaints.size());
    }
};

// ---------- 2. WASTE MANAGEMENT ----------
// Data structure: Queue (FIFO)
struct WasteRequest {
    int id;
    string area;
    string type;
};

class WasteManager : public CityService {
private:
    queue<WasteRequest> requests;
    int nextId = 1;

public:
    void addRequest() {
        WasteRequest w;
        w.id = nextId++;

        clearInput();
        cout << "Area: ";
        getline(cin, w.area);

        cout << "Waste type: ";
        getline(cin, w.type);

        requests.push(w);
        cout << "Waste collection request added.\n";
    }

    void processRequest() {
        if (requests.empty()) {
            cout << "No waste requests waiting.\n";
            return;
        }

        WasteRequest w = requests.front();
        requests.pop();

        cout << "Processing waste request #" << w.id
             << "\nArea: " << w.area
             << "\nWaste type: " << w.type << "\n";
    }

    void showStatus() const override {
        cout << "Waste requests waiting: "
             << requests.size() << "\n";
    }

    int count() const {
        return static_cast<int>(requests.size());
    }
};

// ---------- 3. EMERGENCY MANAGEMENT ----------
// Data structure: Priority Queue
struct Emergency {
    int id;
    string location;
    string type;
    int priority;
};

struct EmergencyCompare {
    bool operator()(const Emergency& a,
                    const Emergency& b) const {
        return a.priority < b.priority;
    }
};

class EmergencyManager : public CityService {
private:
    priority_queue<Emergency, vector<Emergency>,
                   EmergencyCompare> emergencies;
    int nextId = 1;

public:
    void addEmergency() {
        Emergency e;
        e.id = nextId++;

        clearInput();
        cout << "Emergency location: ";
        getline(cin, e.location);

        cout << "Emergency type: ";
        getline(cin, e.type);

        cout << "Priority (1-10, 10 is highest): ";
        cin >> e.priority;

        e.priority = max(1, min(10, e.priority));
        emergencies.push(e);

        cout << "Emergency registered.\n";
    }

    void processEmergency() {
        if (emergencies.empty()) {
            cout << "No emergencies waiting.\n";
            return;
        }

        Emergency e = emergencies.top();
        emergencies.pop();

        cout << "Handling emergency #" << e.id
             << "\nType: " << e.type
             << "\nLocation: " << e.location
             << "\nPriority: " << e.priority << "\n";
    }

    void showStatus() const override {
        cout << "Emergencies waiting: "
             << emergencies.size() << "\n";
    }

    int count() const {
        return static_cast<int>(emergencies.size());
    }
};

// ---------- 4. PARKING MANAGEMENT ----------
// Data structure: Vector
class ParkingManager : public CityService {
private:
    vector<bool> occupied;

public:
    ParkingManager(int totalSlots = 10)
        : occupied(totalSlots, false) {
        occupied[1] = true;
        occupied[4] = true;
        occupied[7] = true;
    }

    void viewParking() const {
        for (size_t i = 0; i < occupied.size(); i++) {
            cout << "Slot " << i + 1 << ": "
                 << (occupied[i] ? "Occupied" : "Available")
                 << "\n";
        }
    }

    void changeSlot() {
        int id;
        cout << "Enter slot number (1-"
             << occupied.size() << "): ";
        cin >> id;

        if (id < 1 || id > static_cast<int>(occupied.size())) {
            cout << "Invalid slot number.\n";
            return;
        }

        occupied[id - 1] = !occupied[id - 1];

        cout << "Slot " << id << " is now "
             << (occupied[id - 1] ? "Occupied" : "Available")
             << ".\n";
    }

    int availableSlots() const {
        return static_cast<int>(
            count(occupied.begin(), occupied.end(), false)
        );
    }

    void showStatus() const override {
        cout << "Available parking slots: "
             << availableSlots() << "\n";
    }
};

// ---------- 5. STREET-LIGHT MAINTENANCE ----------
// Data structure: Queue
struct LightRequest {
    int id;
    string location;
    string problem;
};

class StreetLightManager : public CityService {
private:
    queue<LightRequest> requests;
    int nextId = 1;

public:
    void addRequest() {
        LightRequest r;
        r.id = nextId++;

        clearInput();
        cout << "Street-light location: ";
        getline(cin, r.location);

        cout << "Problem: ";
        getline(cin, r.problem);

        requests.push(r);
        cout << "Maintenance request added.\n";
    }

    void processRequest() {
        if (requests.empty()) {
            cout << "No maintenance requests waiting.\n";
            return;
        }

        LightRequest r = requests.front();
        requests.pop();

        cout << "Processing request #" << r.id
             << "\nLocation: " << r.location
             << "\nProblem: " << r.problem << "\n";
    }

    void showStatus() const override {
        cout << "Street-light requests: "
             << requests.size() << "\n";
    }

    int count() const {
        return static_cast<int>(requests.size());
    }
};

// ---------- 6. TRAFFIC MANAGEMENT ----------
// Data structure: Graph
// Algorithm: Dijkstra's shortest path
class TrafficManager : public CityService {
private:
    int n = 6;

    vector<string> locations = {
        "City Center",
        "Hospital",
        "Railway Station",
        "University",
        "Market",
        "Industrial Area"
    };

    vector<vector<pair<int, int>>> roads;

public:
    TrafficManager() : roads(n) {
        addRoad(0, 1, 4);
        addRoad(0, 2, 3);
        addRoad(1, 3, 5);
        addRoad(2, 3, 4);
        addRoad(2, 4, 6);
        addRoad(3, 4, 2);
        addRoad(4, 5, 3);
        addRoad(3, 5, 7);
    }

    void addRoad(int u, int v, int distance) {
        roads[u].push_back({v, distance});
        roads[v].push_back({u, distance});
    }

    void findRoute() const {
        cout << "\n--- City Locations ---\n";
        for (int i = 0; i < n; i++)
            cout << i << ". " << locations[i] << "\n";

        int source, destination;

        cout << "Source number: ";
        cin >> source;

        cout << "Destination number: ";
        cin >> destination;

        if (source < 0 || source >= n ||
            destination < 0 || destination >= n) {
            cout << "Invalid location.\n";
            return;
        }

        const int INF = numeric_limits<int>::max();
        vector<int> dist(n, INF);
        vector<int> parent(n, -1);

        priority_queue<pair<int, int>,
            vector<pair<int, int>>,
            greater<pair<int, int>>> pq;

        dist[source] = 0;
        pq.push({0, source});

        while (!pq.empty()) {
            auto current = pq.top();
            pq.pop();

            int d = current.first;
            int u = current.second;

            if (d != dist[u])
                continue;

            for (auto road : roads[u]) {
                int v = road.first;
                int weight = road.second;

                if (dist[u] != INF &&
                    dist[u] + weight < dist[v]) {
                    dist[v] = dist[u] + weight;
                    parent[v] = u;
                    pq.push({dist[v], v});
                }
            }
        }

        if (dist[destination] == INF) {
            cout << "No route found.\n";
            return;
        }

        vector<int> path;
        for (int v = destination; v != -1; v = parent[v])
            path.push_back(v);

        reverse(path.begin(), path.end());

        cout << "Shortest route: ";
        for (size_t i = 0; i < path.size(); i++) {
            cout << locations[path[i]];
            if (i + 1 < path.size())
                cout << " -> ";
        }

        cout << "\nDistance: " << dist[destination]
             << " km\n";
    }

    void showStatus() const override {
        cout << "Traffic network locations: " << n << "\n";
    }
};

// ---------- 7. SERVICE RECORDS ----------
// Vector + Sorting + Binary Search
struct ServiceRecord {
    int id;
    string name;
    string service;
};

class RecordManager : public CityService {
private:
    vector<ServiceRecord> records = {
        {101, "Aarav", "Parking"},
        {102, "Priya", "Waste Management"},
        {103, "Rahul", "Traffic"},
        {104, "Ananya", "Emergency"},
        {105, "Vikram", "Street Lights"}
    };

    void sortById() {
        sort(records.begin(), records.end(),
             [](const ServiceRecord& a,
                const ServiceRecord& b) {
                 return a.id < b.id;
             });
    }

public:
    void viewSortedRecords() {
        sortById();

        cout << "\n--- Service Records ---\n";
        for (const auto& r : records) {
            cout << r.id << " | "
                 << r.name << " | "
                 << r.service << "\n";
        }
    }

    void searchRecord() {
        sortById();

        int target;
        cout << "Enter record ID (101-105): ";
        cin >> target;

        int low = 0;
        int high = static_cast<int>(records.size()) - 1;

        while (low <= high) {
            int mid = low + (high - low) / 2;

            if (records[mid].id == target) {
                cout << "Record found: "
                     << records[mid].name << " | "
                     << records[mid].service << "\n";
                return;
            }

            if (records[mid].id < target)
                low = mid + 1;
            else
                high = mid - 1;
        }

        cout << "Record not found.\n";
    }

    void showStatus() const override {
        cout << "Service records stored: "
             << records.size() << "\n";
    }
};

// ---------- MAIN SYSTEM CLASS ----------
// Objects of all service classes are created here.
class SmartCitySystem {
private:
    ComplaintManager complaintManager;
    WasteManager wasteManager;
    EmergencyManager emergencyManager;
    ParkingManager parkingManager;
    StreetLightManager lightManager;
    TrafficManager trafficManager;
    RecordManager recordManager;

    void dashboard() const {
        cout << "\n====== SMART CITY DASHBOARD ======\n";

        // Runtime polymorphism:
        // Base-class pointers call derived implementations.
        const CityService* services[] = {
            &complaintManager,
            &wasteManager,
            &emergencyManager,
            &parkingManager,
            &lightManager,
            &trafficManager,
            &recordManager
        };

        for (const CityService* service : services)
            service->showStatus();

        cout << "==================================\n";
    }

public:
    void run() {
        int choice;

        do {
            cout << "\n====================================\n";
            cout << "    SMART CITY MANAGEMENT SYSTEM\n";
            cout << "====================================\n";
            cout << "1. Dashboard\n";
            cout << "2. Add Citizen Complaint\n";
            cout << "3. View Complaints\n";
            cout << "4. Update Complaint Status\n";
            cout << "5. Add Waste Request\n";
            cout << "6. Process Waste Request\n";
            cout << "7. Register Emergency\n";
            cout << "8. Process Emergency\n";
            cout << "9. View Parking Slots\n";
            cout << "10. Change Parking Status\n";
            cout << "11. Add Street-Light Request\n";
            cout << "12. Process Street-Light Request\n";
            cout << "13. Find Shortest Traffic Route\n";
            cout << "14. View Sorted Service Records\n";
            cout << "15. Search Service Record\n";
            cout << "0. Exit\n";
            cout << "Enter choice: ";

            if (!(cin >> choice)) {
                cout << "Invalid input. Please restart and enter a number.\n";
                return;
            }

            switch (choice) {
                case 1:
                    dashboard();
                    break;
                case 2:
                    complaintManager.addComplaint();
                    break;
                case 3:
                    complaintManager.viewComplaints();
                    break;
                case 4:
                    complaintManager.updateComplaint();
                    break;
                case 5:
                    wasteManager.addRequest();
                    break;
                case 6:
                    wasteManager.processRequest();
                    break;
                case 7:
                    emergencyManager.addEmergency();
                    break;
                case 8:
                    emergencyManager.processEmergency();
                    break;
                case 9:
                    parkingManager.viewParking();
                    break;
                case 10:
                    parkingManager.changeSlot();
                    break;
                case 11:
                    lightManager.addRequest();
                    break;
                case 12:
                    lightManager.processRequest();
                    break;
                case 13:
                    trafficManager.findRoute();
                    break;
                case 14:
                    recordManager.viewSortedRecords();
                    break;
                case 15:
                    recordManager.searchRecord();
                    break;
                case 0:
                    cout << "Exiting Smart City System. Goodbye!\n";
                    break;
                default:
                    cout << "Invalid choice. Try again.\n";
            }

        } while (choice != 0);
    }
};

// ---------- MAIN FUNCTION ----------
int main() {
    SmartCitySystem system;
    system.run();
    return 0;
}
