type Participant = {
  studentId: number;
  name: string;
  lapsCompleted: number;
};

type Props = {
  participants: Participant[];
  milesPerLap: number;
  selectedStudentId: number | null;
  onStudentClick: (id: number | null) => void;
};

export default function Leaderboard({
  participants,
  milesPerLap,
  selectedStudentId,
  onStudentClick
}: Props) {
  const sorted = [...participants].sort(
    (a, b) => b.lapsCompleted - a.lapsCompleted
  );

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "6px",
        padding: "8px",
        background: "#fff",
        maxHeight: "100%",
        overflowY: "auto"
      }}
    >
      <strong style={{ display: "block", marginBottom: "6px", color: "#222" }}>
        Leaderboard
      </strong>

      {sorted.map(p => {
        const isSelected = p.studentId === selectedStudentId;

        return (
          <div
            key={p.studentId}
            onPointerDown={() => onStudentClick(p.studentId)}
            style={{
              padding: "6px",
              marginBottom: "4px",
              borderRadius: "4px",
              cursor: "pointer",
              background: isSelected ? "#fff3cd" : "transparent",
              border: isSelected ? "1px solid #ffc107" : "1px solid transparent",
                color: isSelected ? "#856404" : "#222"
            }}
          >
            <div style={{ fontWeight: 600 }}>{p.name}</div>
            <div style={{ fontSize: "0.8rem", color: "#555" }}>
                {p.lapsCompleted} laps · {(p.lapsCompleted * milesPerLap).toFixed(1)} mi
            </div>
          </div>
        );
      })}
    </div>
  );
}
