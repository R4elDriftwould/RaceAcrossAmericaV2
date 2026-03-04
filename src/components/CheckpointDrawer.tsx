import { useState } from "react";
import { addCheckpointApi, updateCheckpointApi, deleteCheckpointApi } from "../api/races";
import type { Checkpoint } from "../api/races";
import CheckpointPins from "./CheckpointPins";
import CheckpointForm from "./CheckpointForm";

type EditingCheckpoint = {
  id: number;
  name: string;
  distanceFromStart: number;
  description: string;
  mapPositionX: number;
  mapPositionY: number;
};

type Props = {
  open: boolean;
  raceId: number;
  checkpoints: Checkpoint[];
  onClose: () => void;
  onRefresh: () => void; // Reloads race data WITHOUT closing the drawer
};

export default function CheckpointDrawer({
  open,
  raceId,
  checkpoints,
  onClose,
  onRefresh
}: Props) {
  const [editing, setEditing] = useState<EditingCheckpoint | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSave = async () => {
    if (!editing || !editing.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (editing.id === 0) {
        // New checkpoint
        await addCheckpointApi({
          raceId,
          name: editing.name.trim(),
          description: editing.description ?? "",
          distanceFromStart: editing.distanceFromStart,
          mapPositionX: editing.mapPositionX,
          mapPositionY: editing.mapPositionY
        });
      } else {
        // Existing checkpoint — update it
        await updateCheckpointApi(editing.id, {
          raceId,
          name: editing.name.trim(),
          description: editing.description ?? "",
          distanceFromStart: editing.distanceFromStart,
          mapPositionX: editing.mapPositionX,
          mapPositionY: editing.mapPositionY
        });
      }
      setEditing(null);
      onRefresh(); // Reload data but keep drawer open
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save checkpoint.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setSaving(true);
    setError(null);
    try {
      await deleteCheckpointApi(id);
      setEditing(null);
      onRefresh(); // Reload data but keep drawer open
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete checkpoint.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "480px",
        maxWidth: "90vw",
        height: "100%",
        background: "#fff",
        boxShadow: "-2px 0 8px rgba(0,0,0,0.25)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <strong>Checkpoint Manager</strong>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onPointerDown={() =>
              setEditing({
                id: 0,
                name: "",
                distanceFromStart: 0,
                description: "",
                mapPositionX: 50,
                mapPositionY: 50
              })
            }
          >
            + Add
          </button>
          {/* This is the ONLY action that closes the drawer */}
          <button onPointerDown={onClose}>×</button>
        </div>
      </div>

      {/* Map Preview */}
      <div style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            backgroundColor: "#e9ecef",
            border: "1px solid #ccc",
            overflow: "hidden"
          }}
        >
          <img
            src="/us_map.png"
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }}
          />
          <CheckpointPins checkpoints={checkpoints} />
          {editing && (
            <div
              style={{
                position: "absolute",
                left: `${editing.mapPositionX}%`,
                top: `${editing.mapPositionY}%`,
                width: "16px",
                height: "16px",
                backgroundColor: "#00e676",
                border: "2px solid white",
                borderRadius: "50%",
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 8px #00e676",
                zIndex: 10
              }}
            />
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            margin: "8px 12px",
            padding: "8px 12px",
            background: "#fdecea",
            color: "#c62828",
            borderRadius: "4px",
            fontSize: "0.85rem"
          }}
        >
          {error}
        </div>
      )}

      {/* Form */}
      <div style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
        {editing ? (
          <>
            <strong style={{ display: "block", marginBottom: "8px" }}>
              {editing.id === 0 ? "New Checkpoint" : "Edit Checkpoint"}
            </strong>
            <CheckpointForm checkpoint={editing} onChange={setEditing} />
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button
                onPointerDown={handleSave}
                disabled={saving || !editing.name.trim()}
                style={{
                  padding: "6px 16px",
                  backgroundColor: saving ? "#aaa" : "#1976d2",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: saving ? "not-allowed" : "pointer"
                }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button onPointerDown={() => setEditing(null)}>Cancel</button>
              {editing.id !== 0 && (
                <button
                  onPointerDown={() => handleDelete(editing.id)}
                  disabled={saving}
                  style={{ marginLeft: "auto", color: "#c62828" }}
                >
                  Delete
                </button>
              )}
            </div>
          </>
        ) : (
          <div style={{ color: "#777", fontSize: "0.9rem" }}>
            Select a checkpoint to edit or click + Add
          </div>
        )}
      </div>

      {/* Checkpoint List */}
      <div style={{ padding: "12px", flex: 1, overflowY: "auto" }}>
        <strong style={{ display: "block", marginBottom: "8px" }}>
          Checkpoints ({checkpoints.length})
        </strong>
        {checkpoints.length === 0 ? (
          <div style={{ color: "#999", fontSize: "0.85rem" }}>
            No checkpoints yet. Add the Start Line first (0 miles).
          </div>
        ) : (
          [...checkpoints]
            .sort((a, b) => a.distanceFromStart - b.distanceFromStart)
            .map(cp => (
              <div
                key={cp.id}
                onPointerDown={() =>
                  setEditing({
                    id: cp.id,
                    name: cp.name,
                    distanceFromStart: cp.distanceFromStart,
                    description: cp.description ?? "",
                    mapPositionX: cp.mapPositionX,
                    mapPositionY: cp.mapPositionY
                  })
                }
                style={{
                  padding: "8px",
                  marginBottom: "4px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  background: editing?.id === cp.id ? "#fff3cd" : "#fafafa",
                  border: "1px solid #eee"
                }}
              >
                <div style={{ fontWeight: 600, color: "#222" }}>{cp.name}</div>
                <div style={{ fontSize: "0.8rem", color: "#555" }}>
                  {cp.distanceFromStart} mi · ({cp.mapPositionX}%, {cp.mapPositionY}%)
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}