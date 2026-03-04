import { apiRequest } from "./client";

export type Student = {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  group: string;
  schoolId: number;
};

export async function getStudentsApi(): Promise<Student[]> {
  return apiRequest<Student[]>("/api/students");
}

export async function createStudentApi(
  firstName: string,
  lastName: string,
  group: string
): Promise<void> {
  return apiRequest<void>("/api/students", {
    method: "POST",
    body: JSON.stringify({ firstName, lastName, group })
  });
}

export async function deleteStudentApi(studentId: number): Promise<void> {
  return apiRequest<void>(`/api/students/${studentId}`, {
    method: "DELETE"
  });
}
