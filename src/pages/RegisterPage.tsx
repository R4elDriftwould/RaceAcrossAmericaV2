import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerApi } from "../api/auth";

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (!email || !password || !schoolName) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await registerApi(email, password, schoolName);

      // Auto-login after registering, same as login page
      login({
        token: response.token,
        email: response.email,
        schoolId: response.schoolId
      });

      navigate("/races");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5"
      }}
    >
      <div
        style={{
          background: "white",
          padding: "32px",
          borderRadius: "8px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px"
        }}
      >
        <h2 style={{ marginBottom: "8px", textAlign: "center" }}>
          Create Your School Account
        </h2>
        <p style={{ textAlign: "center", color: "#777", marginBottom: "24px", fontSize: "0.9rem" }}>
          This creates an admin account for your school.
          You can add other staff from the Team page after signing in.
        </p>

        {error && (
          <div
            style={{
              background: "#fdecea",
              color: "#c62828",
              padding: "10px 14px",
              borderRadius: "4px",
              marginBottom: "16px",
              fontSize: "0.9rem"
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem" }}>
              School Name
            </label>
            <input
              value={schoolName}
              onChange={e => setSchoolName(e.target.value)}
              placeholder="Lincoln Elementary"
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem" }}>
              Your Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@school.com"
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
          </div>

          <button
            onPointerDown={handleSubmit}
            disabled={loading}
            style={{
              padding: "10px",
              backgroundColor: loading ? "#aaa" : "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1rem",
              marginTop: "8px"
            }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "0.9rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#1976d2" }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}