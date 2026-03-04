import { apiRequest } from "./client";

export type LoginResponse = {
  token: string;
  email: string;
  schoolId: number | null;
};

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export async function registerApi(
  email: string,
  password: string,
  schoolName: string
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, schoolName })
  });
}