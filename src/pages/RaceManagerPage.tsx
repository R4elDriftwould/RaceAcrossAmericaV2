import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRaceApi, addLapApi, removeLapApi, addParticipantApi, updateRaceApi } from "../api/races";
import { getStudentsApi } from "../api/students";
import type { Race, RaceParticipant } from "../api/races";
import type { Student } from "../api/students";
import CheckpointDrawer from "../components/CheckpointDrawer";


export default function RaceManagerPage() {
  const { raceId } = useParams();
  const navigate = useNavigate();
  const raceIdNum = Number(raceId);

  const [race, setRace] = useState<Race | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckpointDrawerOpen, setIsCheckpointDrawerOpen] = useState(false);

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingMiles, setEditingMiles] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftMiles, setDraftMiles] = useState(0);

  const [editingMilesPerLap, setEditingMilesPerLap] = useState(false);
  const [draftMilesPerLap, setDraftMilesPerLap] = useState(0);

  // Add student to race
  const [selectedStudentId, setSelectedStudentId] = useState<number>(0);
  const [addingStudent, setAddingStudent] = useState(false);

  useEffect(() => {
    loadAll();
  }, [raceIdNum]);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [raceData, studentData] = await Promise.all([
        getRaceApi(raceIdNum),
        getStudentsApi()
      ]);
      setRace(raceData);
      setAllStudents(studentData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load race.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!draftTitle.trim() || !race) return;
    try {
      await updateRaceApi(raceIdNum, draftTitle.trim(), race.totalDistanceMiles, race.milesPerLap);
      setEditingTitle(false);
      await loadAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update title.");
    }
  };

  const handleSaveMiles = async () => {
    if (!race) return;
    try {
      await updateRaceApi(raceIdNum, race.title, draftMiles, race.milesPerLap);
      setEditingMiles(false);
      await loadAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update miles.");
    }
  };

  const handleSaveMilesPerLap = async () => {
  if (!race) return;
  try {
    await updateRaceApi(raceIdNum, race.title, race.totalDistanceMiles, draftMilesPerLap);
    setEditingMilesPerLap(false);
    await loadAll();
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : "Failed to update miles per lap.");
  }
};

  const handleAddLap = async (studentId: number) => {
    try {
      await addLapApi(raceIdNum, studentId);
      await loadAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add lap.");
    }
  };

  const handleRemoveLap = async (studentId: number) => {
    try {
      await removeLapApi(raceIdNum, studentId);
      await loadAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to remove lap.");
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudentId) return;
    setAddingStudent(true);
    try {
      await addParticipantApi(raceIdNum, selectedStudentId);
      setSelectedStudentId(0);
      await loadAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add student.");
    } finally {
      setAddingStudent(false);
    }
  };

  // Students not yet in the race, so the dropdown only shows
  // students that haven't been added yet
  const unenrolledStudents = allStudents.filter(
    s => !race?.raceParticipants.some(p => p.studentId === s.id)
  );

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#777" }}>
        Loading race...
      </div>
    );
  }

  if (error || !race) {
    return (
      <div style={{ padding: "24px" }}>
        <div style={{ color: "#c62828", marginBottom: "12px" }}>
          {error ?? "Race not found."}
        </div>
        <button onPointerDown={() => navigate("/races")}>
          Back to Races
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px", maxWidth: "1000px", margin: "0 auto" }}>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px"
        }}
      >
        <div>
          <button
            onPointerDown={() => navigate("/races")}
            style={{
              background: "none",
              border: "none",
              color: "#1976d2",
              cursor: "pointer",
              padding: 0,
              marginBottom: "4px",
              fontSize: "0.9rem"
            }}
          >
            ← Back to Races
          </button>

          {/* Editable Title */}
          {editingTitle ? (
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
              <input
                value={draftTitle}
                onChange={e => setDraftTitle(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSaveTitle()}
                style={{ fontSize: "1.3rem", fontWeight: 600, padding: "2px 6px" }}
                autoFocus
              />
              <button
                onPointerDown={handleSaveTitle}
                style={{
                  padding: "4px 12px",
                  backgroundColor: "#1976d2",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Save
              </button>
              <button onPointerDown={() => setEditingTitle(false)}>Cancel</button>
            </div>
          ) : (
            <h2
              style={{ margin: 0, cursor: "pointer" }}
              onPointerDown={() => {
                setDraftTitle(race.title);
                setEditingTitle(true);
              }}
              title="Click to edit"
            >
              {race.title} <span style={{ fontSize: "0.7rem", color: "#aaa" }}>✎</span>
            </h2>
          )}

          {/* Editable Miles */}
          {editingMiles ? (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="number"
                value={draftMiles}
                onChange={e => setDraftMiles(Number(e.target.value))}
                onKeyDown={e => e.key === "Enter" && handleSaveMiles()}
                style={{ width: "100px", padding: "2px 6px" }}
                autoFocus
              />
              <span style={{ color: "#666", fontSize: "0.9rem" }}>miles</span>
              <button
                onPointerDown={handleSaveMiles}
                style={{
                  padding: "4px 12px",
                  backgroundColor: "#1976d2",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Save
              </button>
              <button onPointerDown={() => setEditingMiles(false)}>Cancel</button>
            </div>
          ) : (
            <div
              style={{ color: "#666", fontSize: "0.9rem", cursor: "pointer" }}
              onPointerDown={() => {
                setDraftMiles(race.totalDistanceMiles);
                setEditingMiles(true);
              }}
              title="Click to edit"
            >
              {race.totalDistanceMiles} miles <span style={{ fontSize: "0.7rem", color: "#aaa" }}>✎</span>
            </div>
          )}

          {editingMilesPerLap ? (
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
              <input
                type="number"
                value={draftMilesPerLap}
                onChange={e => setDraftMilesPerLap(Number(e.target.value))}
                onKeyDown={e => e.key === "Enter" && handleSaveMilesPerLap()}
                style={{ width: "80px", padding: "2px 6px" }}
                autoFocus
              />
              <span style={{ color: "#666", fontSize: "0.9rem" }}>miles per lap</span>
              <button
                onPointerDown={handleSaveMilesPerLap}
                style={{
                  padding: "4px 12px",
                  backgroundColor: "#1976d2",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Save
              </button>
              <button onPointerDown={() => setEditingMilesPerLap(false)}>Cancel</button>
            </div>
          ) : (
            <div
              style={{ color: "#666", fontSize: "0.9rem", cursor: "pointer", marginTop: "2px" }}
              onPointerDown={() => {
                setDraftMilesPerLap(race.milesPerLap);
                setEditingMilesPerLap(true);
              }}
              title="Click to edit"
            >
              {race.milesPerLap} miles per lap <span style={{ fontSize: "0.7rem", color: "#aaa" }}>✎</span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onPointerDown={() => setIsCheckpointDrawerOpen(true)}
            style={{ padding: "8px 16px" }}
          >
            Manage Checkpoints
          </button>
          <button
            onPointerDown={() => navigate(`/tracker/${race.id}`)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f57c00",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Launch Tracker
          </button>
        </div>
      </div>

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

      {/* Add Student to Race */}
      <div
        style={{
          background: "white",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "20px"
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "12px" }}>Add Student to Race</h3>

        {unenrolledStudents.length === 0 ? (
          <div style={{ color: "#777", fontSize: "0.9rem" }}>
            All students are already enrolled, or no students exist yet.{" "}
            <span
              style={{ color: "#1976d2", cursor: "pointer" }}
              onPointerDown={() => navigate("/students")}
            >
              Manage students →
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(Number(e.target.value))}
              style={{ flex: 1, minWidth: "180px", padding: "8px" }}
            >
              <option value={0}>Select a student...</option>
              {unenrolledStudents.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullName} {s.group ? `— ${s.group}` : ""}
                </option>
              ))}
            </select>
            <button
              onPointerDown={handleAddStudent}
              disabled={!selectedStudentId || addingStudent}
              style={{
                padding: "8px 20px",
                backgroundColor: !selectedStudentId || addingStudent ? "#aaa" : "#1976d2",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: !selectedStudentId || addingStudent ? "not-allowed" : "pointer"
              }}
            >
              {addingStudent ? "Adding..." : "Add"}
            </button>
          </div>
        )}
      </div>

      {/* Participants List */}
      <div
        style={{
          background: "white",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "16px"
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "12px" }}>
          Race Participants ({race.raceParticipants.length})
        </h3>

        {race.raceParticipants.length === 0 ? (
          <div style={{ color: "#777", textAlign: "center", padding: "24px" }}>
            No participants yet. Add students above.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[...race.raceParticipants]
              .sort((a, b) => b.lapsCompleted - a.lapsCompleted)
              .map((p: RaceParticipant) => (
                <div
                  key={p.studentId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    border: "1px solid #eee",
                    borderRadius: "6px",
                    backgroundColor: "#fafafa"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {p.student?.fullName}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "#666" }}>
                      {p.student?.group && (
                        <span style={{ marginRight: "8px" }}>
                          {p.student.group}
                        </span>
                      )}
                      {p.lapsCompleted} laps
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <button
                      onPointerDown={() => handleRemoveLap(p.studentId)}
                      style={{
                        width: "36px",
                        height: "36px",
                        fontSize: "1.2rem",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        cursor: "pointer",
                        backgroundColor: "white"
                      }}
                    >
                      −
                    </button>
                    <span
                      style={{
                        minWidth: "32px",
                        textAlign: "center",
                        fontWeight: 600
                      }}
                    >
                      {p.lapsCompleted}
                    </span>
                    <button
                      onPointerDown={() => handleAddLap(p.studentId)}
                      style={{
                        width: "36px",
                        height: "36px",
                        fontSize: "1.2rem",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        cursor: "pointer",
                        backgroundColor: "white"
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Checkpoint Drawer */}
      <CheckpointDrawer
        open={isCheckpointDrawerOpen}
        raceId={raceIdNum}
        checkpoints={race.checkpoints}
        onClose={() => setIsCheckpointDrawerOpen(false)}
        onRefresh={loadAll}
      />
    </div>
  );
}