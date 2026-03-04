import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRaceApi } from "../api/races";
import type { Race, RaceParticipant } from "../api/races";
import RaceMap from "../components/RaceMap";
import Leaderboard from "../components/Leaderboard";


export default function RaceTrackerPage() {
  const { raceId } = useParams();
  const navigate = useNavigate();
  const raceIdNum = Number(raceId);

  const [race, setRace] = useState<Race | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Map interaction state
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<number | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  // Group filter for leaderboard
  const [filterGroup, setFilterGroup] = useState("All");

  const loadRace = useCallback(async () => {
    setError(null);
    try {
      const data = await getRaceApi(raceIdNum);
      setRace(data);
      setLastRefreshed(new Date());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load race.");
    } finally {
      setLoading(false);
    }
  }, [raceIdNum]);

  // Load on mount
  useEffect(() => {
    loadRace();
  }, [loadRace]);

  // Auto-refresh every 30 seconds so the smartboard stays current
  // without anyone needing to manually refresh the page
  useEffect(() => {
    const interval = setInterval(() => {
      loadRace();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadRace]);

  const handleCheckpointClick = (id: number | null) => {
    setSelectedCheckpointId(id);
    setSelectedStudentId(null);
  };

  const handleStudentClick = (id: number | null) => {
    setSelectedStudentId(id);
    setSelectedCheckpointId(null);
  };

  // Build the participant shape RaceMap and Leaderboard expect
  const toMapParticipant = (p: RaceParticipant) => ({
    studentId: p.studentId,
    name: p.student?.fullName ?? "Unknown",
    group: p.student?.group ?? "",
    lapsCompleted: p.lapsCompleted
  });

  const milesPerLap = race?.milesPerLap ?? 1;

  // Available groups for the filter dropdown
  const availableGroups = race
    ? Array.from(
        new Set(
          race.raceParticipants
            .map(p => p.student?.group ?? "")
            .filter(Boolean)
        )
      ).sort()
    : [];

  const allParticipants = race
    ? race.raceParticipants.map(toMapParticipant)
    : [];

  const filteredParticipants = filterGroup === "All"
    ? allParticipants
    : allParticipants.filter(p => p.group === filterGroup);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#777" }}>
        Loading race tracker...
      </div>
    );
  }

  if (error || !race) {
    return (
      <div style={{ padding: "24px" }}>
        <div style={{ color: "#c62828", marginBottom: "12px" }}>
          {error ?? "Race not found."}
        </div>
        <button onPointerDown={() => navigate("/races")}>Back to Races</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "12px" }}>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
          flexWrap: "wrap",
          gap: "8px"
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>{race.title}</h2>
          <div style={{ fontSize: "0.85rem", color: "#666" }}>
            {race.totalDistanceMiles} miles · {milesPerLap} miles per lap
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Group filter */}
          {availableGroups.length > 0 && (
            <select
              value={filterGroup}
              onChange={e => setFilterGroup(e.target.value)}
              style={{ padding: "6px 10px" }}
            >
              <option value="All">All Groups</option>
              {availableGroups.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          )}

          <button
            onPointerDown={() => loadRace()}
            style={{ padding: "6px 14px" }}
            title="Refresh race data"
          >
            ↺ Refresh
          </button>

          <button
            onPointerDown={() => navigate(`/race/${race.id}`)}
            style={{ padding: "6px 14px" }}
          >
            ← Manage
          </button>
        </div>
      </div>

      {/* Last refreshed indicator */}
      <div style={{ fontSize: "0.75rem", color: "#aaa", marginBottom: "8px" }}>
        Last updated: {lastRefreshed.toLocaleTimeString()}
      </div>

      {/* Main Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: "12px",
          alignItems: "start"
        }}
      >
        {/* Map */}
        <RaceMap
          checkpoints={race.checkpoints}
          participants={filteredParticipants}
          milesPerLap={milesPerLap}
          selectedCheckpointId={selectedCheckpointId}
          selectedStudentId={selectedStudentId}
          onCheckpointClick={handleCheckpointClick}
          onStudentClick={handleStudentClick}
        />

        {/* Leaderboard */}
        <Leaderboard
          participants={filteredParticipants}
          milesPerLap={milesPerLap}
          selectedStudentId={selectedStudentId}
          onStudentClick={handleStudentClick}
        />
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          justifyContent: "center",
          marginTop: "10px",
          fontSize: "0.8rem",
          color: "#555"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#d13438" }} />
          Checkpoint
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#1976d2" }} />
          Student
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ffc107" }} />
          Selected
        </div>
      </div>
    </div>
  );
}