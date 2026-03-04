import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginApi } from "../api/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await loginApi(email, password);

      // Store the token and user info in the auth context
      login({
        token: response.token,
        email: response.email,
        schoolId: response.schoolId
      });

      // Send them to the races list after login
      navigate("/races");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed.");
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
        <h2 style={{ marginBottom: "24px", textAlign: "center" }}>
          Race Across America
        </h2>

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
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
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
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="••••••••"
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
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "0.9rem" }}>
          New school?{" "}
          <Link to="/register" style={{ color: "#1976d2" }}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}