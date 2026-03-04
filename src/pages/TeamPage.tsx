import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTeamMembersApi, addTeamMemberApi } from "../api/team.ts";
import type { TeamMember } from "../api/team.ts";

export default function TeamPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adding, setAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTeamMembersApi();
      setMembers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load team members.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setAdding(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await addTeamMemberApi(email.trim(), password);
      setEmail("");
      setPassword("");
      setSuccessMessage(`Account created for ${email.trim()}.`);
      await loadMembers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add team member.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "24px" }}>

      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
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
        <h2 style={{ margin: 0 }}>Team Members</h2>
        <div style={{ color: "#666", fontSize: "0.85rem", marginTop: "4px" }}>
          All staff accounts that can log in and manage races for your school.
        </div>
      </div>

      {/* Add Member Form */}
      <div
        style={{
          background: "white",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "24px"
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "4px" }}>Add Staff Member</h3>
        <div
          style={{
            fontSize: "0.85rem",
            color: "#666",
            marginBottom: "12px"
          }}
        >
          Creates a new login for someone at your school. They can log in
          immediately with the password you set here.
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="email"
            placeholder="Staff email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAddMember()}
            style={{ flex: 2, minWidth: "180px", padding: "8px" }}
          />
          <input
            type="password"
            placeholder="Temporary password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAddMember()}
            style={{ flex: 1, minWidth: "140px", padding: "8px" }}
          />
          <button
            onPointerDown={handleAddMember}
            disabled={adding || !email.trim() || !password.trim()}
            style={{
              padding: "8px 20px",
              backgroundColor:
                adding || !email.trim() || !password.trim() ? "#aaa" : "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor:
                adding || !email.trim() || !password.trim()
                  ? "not-allowed"
                  : "pointer"
            }}
          >
            {adding ? "Adding..." : "Add"}
          </button>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div
          style={{
            background: "#e8f5e9",
            color: "#2e7d32",
            padding: "10px 14px",
            borderRadius: "4px",
            marginBottom: "16px",
            fontSize: "0.9rem"
          }}
        >
          {successMessage}
        </div>
      )}

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

      {/* Team List */}
      {loading ? (
        <div style={{ textAlign: "center", color: "#777", padding: "40px" }}>
          Loading team...
        </div>
      ) : (
        <div
          style={{
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "8px",
            overflow: "hidden"
          }}
        >
          {members.map((member, index) => {
            const isYou = member.email === user?.email;
            return (
              <div
                key={member.id}
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom:
                    index < members.length - 1 ? "1px solid #eee" : "none",
                  backgroundColor: isYou ? "#f0f4ff" : "white"
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{member.email}</div>
                  {isYou && (
                    <div style={{ fontSize: "0.8rem", color: "#1976d2" }}>
                      This is you
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}