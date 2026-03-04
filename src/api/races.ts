import { apiRequest } from "./client";

// These types mirror what your .NET API returns.
// They match the EF Core models in your Data/ folder.

export type Checkpoint = {
  id: number;
  name: string;
  description: string;
  distanceFromStart: number;
  mapPositionX: number;
  mapPositionY: number;
  raceId: number;
};

export type RaceParticipant = {
  studentId: number;
  raceId: number;
  lapsCompleted: number;
  student: {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    group: string;
  };
};

export type Race = {
  id: number;
  title: string;
  totalDistanceMiles: number;
  milesPerLap: number; 
  isActive: boolean;
  checkpoints: Checkpoint[];
  raceParticipants: RaceParticipant[];
};

// --- Races ---

export async function getRacesApi(): Promise<Race[]> {
  return apiRequest<Race[]>("/api/races");
}

export async function getRaceApi(raceId: number): Promise<Race> {
  return apiRequest<Race>(`/api/races/${raceId}`);
}

export async function createRaceApi(title: string, totalDistanceMiles: number, milesPerLap: number): Promise<Race> {
  return apiRequest<Race>("/api/races", {
    method: "POST",
    body: JSON.stringify({ title, totalDistanceMiles, milesPerLap })
  });
}

export async function updateRaceApi(
  raceId: number,
  title: string,
  totalDistanceMiles: number, 
  milesPerLap: number
): Promise<void> {
  return apiRequest<void>(`/api/races/${raceId}`, {
    method: "PUT",
    body: JSON.stringify({ title, totalDistanceMiles, milesPerLap })
  });
}

// --- Participants ---

export async function addParticipantApi(raceId: number, studentId: number): Promise<void> {
  return apiRequest<void>(`/api/races/${raceId}/participants`, {
    method: "POST",
    body: JSON.stringify({ studentId })
  });
}

export async function addLapApi(raceId: number, studentId: number): Promise<void> {
  return apiRequest<void>(`/api/races/${raceId}/participants/${studentId}/addlap`, {
    method: "POST"
  });
}

export async function removeLapApi(raceId: number, studentId: number): Promise<void> {
  return apiRequest<void>(`/api/races/${raceId}/participants/${studentId}/removelap`, {
    method: "POST"
  });
}

// --- Checkpoints ---

export async function addCheckpointApi(checkpoint: {
  raceId: number;
  name: string;
  description: string;
  distanceFromStart: number;
  mapPositionX: number;
  mapPositionY: number;
}): Promise<void> {
  return apiRequest<void>("/api/checkpoints", {
    method: "POST",
    body: JSON.stringify(checkpoint)
  });
}

export async function updateCheckpointApi(
  checkpointId: number,
  checkpoint: {
    raceId: number;
    name: string;
    description: string;
    distanceFromStart: number;
    mapPositionX: number;
    mapPositionY: number;
  }
): Promise<void> {
  return apiRequest<void>(`/api/checkpoints/${checkpointId}`, {
    method: "PUT",
    body: JSON.stringify(checkpoint)
  });
}

export async function deleteCheckpointApi(checkpointId: number): Promise<void> {
  return apiRequest<void>(`/api/checkpoints/${checkpointId}`, {
    method: "DELETE"
  });
}