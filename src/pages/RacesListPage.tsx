import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRacesApi, createRaceApi } from "../api/races";
import type { Race } from "../api/races";

export default function RacesListPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New race form state
  const [newTitle, setNewTitle] = useState("");
  const [newMiles, setNewMiles] = useState<number>(0);
  const [creating, setCreating] = useState(false);
  const [newMilesPerLap, setNewMilesPerLap] = useState<number>(1);

  // Load races on mount
  useEffect(() => {
    loadRaces();
  }, []);

  const loadRaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRacesApi();
      setRaces(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load races.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRace = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await createRaceApi(newTitle.trim(), newMiles, newMilesPerLap);
      setNewTitle("");
      setNewMiles(0);
      await loadRaces();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create race.");
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px"
        }}
      >
        <h2 style={{ margin: 0 }}>Race Manager</h2>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "#666" }}>{user?.email}</span>
          <button
            onPointerDown={() => navigate("/students")}
            style={{ padding: "6px 12px" }}
          >
            Students
          </button>
          <button
            onPointerDown={() => navigate("/team")}
            style={{ padding: "6px 12px" }}
          >
            Team
          </button>
          <button
            onPointerDown={handleLogout}
            style={{ padding: "6px 12px", color: "#c62828" }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Create Race Form */}
      <div
        style={{
          background: "white",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "24px"
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "12px" }}>Create New Race</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            placeholder="Race title"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreateRace()}
            style={{ flex: 1, minWidth: "180px", padding: "8px" }}
          />
          <input
            type="number"
            placeholder="Total miles"
            value={newMiles || ""}
            onChange={e => setNewMiles(Number(e.target.value))}
            style={{ width: "120px", padding: "8px" }}
          />

          <input
            type="number"
            placeholder="Miles per lap"
            value={newMilesPerLap || ""}
            onChange={e => setNewMilesPerLap(Number(e.target.value))}
            style={{ width: "120px", padding: "8px" }}
          />
          <button
            onPointerDown={handleCreateRace}
            disabled={creating || !newTitle.trim()}
            style={{
              padding: "8px 20px",
              backgroundColor: creating || !newTitle.trim() ? "#aaa" : "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: creating || !newTitle.trim() ? "not-allowed" : "pointer"
            }}
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: "#fdecea",
            color: "#c62828",
            padding: "10px 14px",
            borderRadius: "4px",
            marginBottom: "16px"
          }}
        >
          {error}
        </div>
      )}

      {/* Races List */}
      {loading ? (
        <div style={{ textAlign: "center", color: "#777", padding: "40px" }}>
          Loading races...
        </div>
      ) : races.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "#777",
            padding: "40px",
            border: "1px dashed #ddd",
            borderRadius: "8px"
          }}
        >
          No races yet. Create one above to get started.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {races.map(race => (
            <div
              key={race.id}
              style={{
                background: "white",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: "1.05rem" }}>
                  {race.title}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "2px" }}>
                  {race.totalDistanceMiles} miles ·{" "}
                  <span
                    style={{
                      color: race.isActive ? "#2e7d32" : "#666"
                    }}
                  >
                    {race.isActive ? "Active" : "Finished"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onPointerDown={() => navigate(`/race/${race.id}`)}
                  style={{
                    padding: "6px 14px",
                    backgroundColor: "#1976d2",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Manage
                </button>
                <button
                  onPointerDown={() => navigate(`/tracker/${race.id}`)}
                  style={{
                    padding: "6px 14px",
                    backgroundColor: "#f57c00",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Tracker
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}