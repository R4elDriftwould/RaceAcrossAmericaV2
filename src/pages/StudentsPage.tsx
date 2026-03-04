import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStudentsApi, createStudentApi, deleteStudentApi } from "../api/students";
import type { Student } from "../api/students";

export default function StudentsPage() {
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [group, setGroup] = useState("");
  const [creating, setCreating] = useState(false);

  // Filter by group
  const [filterGroup, setFilterGroup] = useState("All");

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudentsApi();
      setStudents(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await createStudentApi(firstName.trim(), lastName.trim(), group.trim());
      setFirstName("");
      setLastName("");
      setGroup("");
      await loadStudents();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create student.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteStudent = async (studentId: number, name: string) => {
    if (!confirm(`Remove ${name} from the roster? This cannot be undone.`)) return;
    setError(null);
    try {
      await deleteStudentApi(studentId);
      await loadStudents();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete student.");
    }
  };

  // Build group list for the filter dropdown
  const availableGroups = [
    "All",
    ...Array.from(new Set(students.map(s => s.group).filter(Boolean))).sort()
  ];

  const filteredStudents = filterGroup === "All"
    ? students
    : students.filter(s => s.group === filterGroup);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>

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
          <h2 style={{ margin: 0 }}>Student Roster</h2>
        </div>
      </div>

      {/* Add Student Form */}
      <div
        style={{
          background: "white",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "24px"
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "12px" }}>Add New Student</h3>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            placeholder="First name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreateStudent()}
            style={{ flex: 1, minWidth: "120px", padding: "8px" }}
          />
          <input
            placeholder="Last name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreateStudent()}
            style={{ flex: 1, minWidth: "120px", padding: "8px" }}
          />
          <input
            placeholder="Group (e.g. Red Group)"
            value={group}
            onChange={e => setGroup(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreateStudent()}
            style={{ flex: 2, minWidth: "160px", padding: "8px" }}
          />
          <button
            onPointerDown={handleCreateStudent}
            disabled={creating || !firstName.trim() || !lastName.trim()}
            style={{
              padding: "8px 20px",
              backgroundColor:
                creating || !firstName.trim() || !lastName.trim()
                  ? "#aaa"
                  : "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor:
                creating || !firstName.trim() || !lastName.trim()
                  ? "not-allowed"
                  : "pointer"
            }}
          >
            {creating ? "Adding..." : "Add"}
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

      {/* Filter + Count */}
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
        <div style={{ fontWeight: 600 }}>
          {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""}
          {filterGroup !== "All" && ` in ${filterGroup}`}
        </div>

        {availableGroups.length > 1 && (
          <select
            value={filterGroup}
            onChange={e => setFilterGroup(e.target.value)}
            style={{ padding: "6px 10px" }}
          >
            {availableGroups.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        )}
      </div>

      {/* Student List */}
      {loading ? (
        <div style={{ textAlign: "center", color: "#777", padding: "40px" }}>
          Loading students...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "#777",
            padding: "40px",
            border: "1px dashed #ddd",
            borderRadius: "8px"
          }}
        >
          {students.length === 0
            ? "No students yet. Add your first student above."
            : `No students in ${filterGroup}.`}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filteredStudents
            .sort((a, b) => a.lastName.localeCompare(b.lastName))
            .map(student => (
              <div
                key={student.id}
                style={{
                  background: "white",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{student.fullName}</div>
                  <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "2px" }}>
                    {student.group || (
                      <span style={{ fontStyle: "italic" }}>No group</span>
                    )}
                  </div>
                </div>

                <button
                  onPointerDown={() =>
                    handleDeleteStudent(student.id, student.fullName)
                  }
                  style={{
                    background: "none",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    color: "#c62828",
                    cursor: "pointer",
                    padding: "4px 10px",
                    fontSize: "0.85rem"
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}