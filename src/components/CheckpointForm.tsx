type EditingCheckpoint = {
  id: number;
  name: string;
  distanceFromStart: number;
  description: string;
  mapPositionX: number;
  mapPositionY: number;
};

type Props = {
  checkpoint: EditingCheckpoint;
  onChange: (cp: EditingCheckpoint) => void;
};

export default function CheckpointForm({ checkpoint, onChange }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <input
        placeholder="Checkpoint Name"
        value={checkpoint.name}
        onChange={e => onChange({ ...checkpoint, name: e.target.value })}
      />
      <input
        type="number"
        placeholder="Miles from start"
        value={checkpoint.distanceFromStart || ""}
        onChange={e =>
          onChange({ ...checkpoint, distanceFromStart: Number(e.target.value) })
        }
      />
      <textarea
        placeholder="Description (shown in popup)"
        value={checkpoint.description}
        onChange={e => onChange({ ...checkpoint, description: e.target.value })}
        rows={2}
      />
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="number"
          placeholder="Map X %"
          value={checkpoint.mapPositionX || ""}
          onChange={e =>
            onChange({ ...checkpoint, mapPositionX: Number(e.target.value) })
          }
          style={{ flex: 1 }}
        />
        <input
          type="number"
          placeholder="Map Y %"
          value={checkpoint.mapPositionY || ""}
          onChange={e =>
            onChange({ ...checkpoint, mapPositionY: Number(e.target.value) })
          }
          style={{ flex: 1 }}
        />
      </div>
    </div>
  );
}