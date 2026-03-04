type Participant = {
  id: number;
  name: string;
  lapsCompleted: number;
};

type Props = {
  participants: Participant[];
  milesPerLap: number;
  onAddLap: (id: number) => void;
  onRemoveLap: (id: number) => void;
};

export default function RaceParticipantManager({
  participants,
  milesPerLap,
  onAddLap,
  onRemoveLap
}: Props) {
  return (
    <div style={{ marginTop: "16px" }}>
      <h3>Race Participants</h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          maxHeight: "70vh",
          overflowY: "auto"
        }}
      >
        {participants.map(p => (
          <div
            key={p.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "6px"
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: "0.85rem", color: "#555" }}>
                {p.lapsCompleted} laps · {p.lapsCompleted * milesPerLap} mi
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => onRemoveLap(p.id)}>-</button>
              <button onClick={() => onAddLap(p.id)}>+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
