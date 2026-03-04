import { apiRequest } from "./client";

export type TeamMember = {
  id: string;
  email: string;
};

export async function getTeamMembersApi(): Promise<TeamMember[]> {
  return apiRequest<TeamMember[]>("/api/team");
}

export async function addTeamMemberApi(
  email: string,
  password: string
): Promise<void> {
  return apiRequest<void>("/api/team", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}