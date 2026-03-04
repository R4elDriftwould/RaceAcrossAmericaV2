// -------------------------------------------------------
// The base URL of your .NET API.
// During development this points at your local machine.
// When you deploy to Azure you'll swap this for your
// real API URL using an environment variable.
// -------------------------------------------------------
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "https://localhost:7001";

// -------------------------------------------------------
// getToken() reads the stored session so we can attach
// it to every request. We read it fresh each time rather
// than caching it so logout takes effect immediately.
// -------------------------------------------------------
function getToken(): string | null {
  const saved = sessionStorage.getItem("auth");
  if (!saved) return null;
  try {
    return JSON.parse(saved).token ?? null;
  } catch {
    return null;
  }
}

// -------------------------------------------------------
// apiRequest is the single function all API calls use.
// It handles:
//   - Building the full URL
//   - Attaching the JWT token header
//   - Parsing the JSON response
//   - Throwing a readable error if something goes wrong
// -------------------------------------------------------
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // If we have a token, attach it. If not (login/register)
      // this line just adds nothing and that's fine.
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  // 401 means the token expired or is invalid.
  // Clear the session so the app redirects to login.
  if (response.status === 401) {
    sessionStorage.removeItem("auth");
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  // For 204 No Content responses there's no body to parse
  if (response.status === 204) {
    return undefined as T;
  }

  // Check if the response is actually JSON before trying to parse it.
  // If the API crashes it returns HTML, which causes a confusing parse error.
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!response.ok) {
    if (isJson) {
      const data = await response.json();
      throw new Error(data.message ?? `Request failed with status ${response.status}`);
    }
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (!isJson) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}