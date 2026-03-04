type Checkpoint = {
  id: number;
  name: string;
  distanceFromStart: number;
  mapPositionX: number;
  mapPositionY: number;
  description?: string;
};

type Participant = { 
  studentId: number; 
  name: string; 
  lapsCompleted: number; 
};

type Props = {
  checkpoints: Checkpoint[];
  participants: Participant[];
  milesPerLap: number;
  selectedCheckpointId: number | null;
  selectedStudentId: number | null;
  onCheckpointClick: (id: number | null) => void;
  onStudentClick: (id: number | null) => void;
};



function calculateStudentPosition(
  laps: number,
  milesPerLap: number,
  checkpoints: Checkpoint[]
): { x: number; y: number } {
  const currentMiles = laps * milesPerLap;

  if (checkpoints.length === 0) return { x: 50, y: 50 };

  // Sort first — the API doesn't guarantee order
  const sorted = [...checkpoints].sort(
    (a, b) => a.distanceFromStart - b.distanceFromStart
  );

  if (currentMiles <= sorted[0].distanceFromStart) {
    return { x: sorted[0].mapPositionX, y: sorted[0].mapPositionY };
  }

  if (currentMiles >= sorted[sorted.length - 1].distanceFromStart) {
    const last = sorted[sorted.length - 1];
    return { x: last.mapPositionX, y: last.mapPositionY };
  }

  const prev = [...sorted].reverse().find(c => c.distanceFromStart <= currentMiles);
  const next = sorted.find(c => c.distanceFromStart > currentMiles);

  if (!prev || !next) return { x: 50, y: 50 };

  const ratio =
    (currentMiles - prev.distanceFromStart) /
    (next.distanceFromStart - prev.distanceFromStart);

  return {
    x: prev.mapPositionX + (next.mapPositionX - prev.mapPositionX) * ratio,
    y: prev.mapPositionY + (next.mapPositionY - prev.mapPositionY) * ratio
  };
}

function calculateStudentPath(
  laps: number,
  milesPerLap: number,
  checkpoints: Checkpoint[]
): { x: number; y: number }[] {
  const path: { x: number; y: number }[] = [];

  if (checkpoints.length === 0) return path;

  const sorted = [...checkpoints].sort(
    (a, b) => a.distanceFromStart - b.distanceFromStart
  );

  const currentMiles = laps * milesPerLap;

  // Always start at the first checkpoint
  path.push({
    x: sorted[0].mapPositionX,
    y: sorted[0].mapPositionY
  });

  // Add each checkpoint the student has passed
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].distanceFromStart <= currentMiles) {
      path.push({
        x: sorted[i].mapPositionX,
        y: sorted[i].mapPositionY
      });
    } else {
      break;
    }
  }

  // Add the student's current interpolated position
  const currentPos = calculateStudentPosition(laps, milesPerLap, checkpoints);
  path.push(currentPos);

  return path;
}

function getPopupStyle(cp: Checkpoint) {
  let left = cp.mapPositionX;
  let top = cp.mapPositionY;

  // Horizontal positioning
  let translateX = "-50%";
  if (left < 30) translateX = "0%";
  else if (left > 70) translateX = "-100%";

  // Vertical positioning
  let translateY = "-105%";
  if (top < 40) translateY = "25px"; // push below the pin

  return {
    position: "absolute" as const,
    left: `${left}%`,
    top: `${top}%`,
    transform: `translate(${translateX}, ${translateY})`,
    background: "white",
    padding: "8px 12px",
    borderRadius: "6px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
    zIndex: 50,
    width: "180px",
    fontSize: "0.85rem"
  };
}


function getStudentsAtCheckpoint(
  checkpoint: Checkpoint,
  milesPerLap: number,
  checkpoints: Checkpoint[],
  participants: Participant[]
): Participant[] {
  const sorted = [...checkpoints].sort(
    (a, b) => a.distanceFromStart - b.distanceFromStart
  );

  const index = sorted.findIndex(c => c.id === checkpoint.id);
  if (index === -1) return [];

  const currentDistance = sorted[index].distanceFromStart;
  const nextDistance =
    index < sorted.length - 1
      ? sorted[index + 1].distanceFromStart
      : Infinity;

  return participants.filter(p => {
    const miles = p.lapsCompleted * milesPerLap;
    return miles >= currentDistance && miles < nextDistance;
  });
}



export default function RaceMap({
  checkpoints,
  participants,
  milesPerLap,
  selectedCheckpointId,
  selectedStudentId,
  onCheckpointClick,
  onStudentClick
}: Props) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 9",
        border: "1px solid #ddd",
        backgroundColor: "#e9ecef"
      }}
    >
      <img
        src="/us_map.png"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.8
        }}
      />

      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 5
        }}
      >
        {checkpoints.length > 1 &&
          checkpoints
            .slice()
            .sort((a, b) => a.distanceFromStart - b.distanceFromStart)
            .map((cp, index, arr) => {
              if (index === arr.length - 1) return null;

              const next = arr[index + 1];

              return (
                <line
                  key={`${cp.id}-${next.id}`}
                  x1={`${cp.mapPositionX}%`}
                  y1={`${cp.mapPositionY}%`}
                  x2={`${next.mapPositionX}%`}
                  y2={`${next.mapPositionY}%`}
                  stroke="#d13438"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  opacity={0.6}
                />
              );
            })}
      </svg>

      {selectedStudentId !== null && (
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 7
          }}
        >
          {(() => {
            const student = participants.find(p => p.studentId === selectedStudentId);
            if (!student) return null;

            const path = calculateStudentPath(student.lapsCompleted, milesPerLap, checkpoints);

            return path.map((p1, index) => {
              if (index === path.length - 1) return null;
              const p2 = path[index + 1];

              return (
                <line
                  key={index}
                  x1={`${p1.x}%`}
                  y1={`${p1.y}%`}
                  x2={`${p2.x}%`}
                  y2={`${p2.y}%`}
                  stroke="#1976d2"
                  strokeWidth={3}
                  strokeLinecap="round"
                  opacity={0.9}
                />
              );
            });
          })()}
        </svg>
      )}



      {checkpoints.map(cp => {
        const isSelected = cp.id === selectedCheckpointId;

        return (
          <div
            key={cp.id}
            onPointerDown={() => onCheckpointClick(cp.id)}
            style={{
              position: "absolute",
              left: `${cp.mapPositionX}%`,
              top: `${cp.mapPositionY}%`,
              width: isSelected ? 16 : 12,
              height: isSelected ? 16 : 12,
              backgroundColor: isSelected ? "#ffc107" : "#1976d2",
              border: "2px solid white",
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              boxShadow: isSelected
                ? "0 0 8px #ffc107"
                : "0 2px 4px rgba(0,0,0,0.3)",
              cursor: "pointer",
              touchAction: "manipulation",
              zIndex: 10
            }}
          />
        );
      })}

      {participants.map(p => {
        const pos = calculateStudentPosition(p.lapsCompleted, milesPerLap, checkpoints);
        const isSelected = p.studentId === selectedStudentId;

        return (
          <div
            key={p.studentId}
            onPointerDown={() => onStudentClick(p.studentId)}
            style={{
              position: "absolute",
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: isSelected ? 14 : 10,
              height: isSelected ? 14 : 10,
              backgroundColor: isSelected ? "#ffc107" : "#1976d2",
              border: "2px solid white",
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              boxShadow: isSelected
                ? "0 0 8px #ffc107"
                : "0 2px 4px rgba(0,0,0,0.3)",
              cursor: "pointer",
              zIndex: isSelected ? 30 : 20,
              touchAction: "manipulation"
            }}
            title={`${p.name} (${p.lapsCompleted * milesPerLap} mi)`}
          />
        );
      })}

      {selectedCheckpointId !== null && (() => {
        const cp = checkpoints.find(c => c.id === selectedCheckpointId);
        if (!cp) return null;

        const studentsHere = getStudentsAtCheckpoint(cp, milesPerLap,checkpoints, participants);

        return (
          <div style={getPopupStyle(cp)}>
            <div style={{ 
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "4px"
              }}
            >
              <div style={{ display: "flex", gap: "6px", alignItems: "baseline" }}>
                <strong style={{ color: "#222", fontSize: "0.9rem" }}>
                  {cp.name}
                </strong>
                <span style={{ color: "#555", fontSize: "0.8rem" }}>
                  {cp.distanceFromStart} mi
                </span>
              </div>

              <button
                onPointerDown={() => onCheckpointClick(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#555",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "0.9rem"
                }}
              >
                ×
              </button>
            </div>



            {cp.description && (
              <div style={{ fontStyle: "italic", color: "#777", marginBottom: "6px" }}>
                {cp.description}
              </div>
            )}

            <div style={{ fontSize: "0.8rem", marginTop: "6px" }}>
              <strong style={{ color: "#222"}}>Students here:</strong>
              {studentsHere.length > 0 ? (
                <ul style={{ paddingLeft: "16px", margin: "4px 0" }}>
                  {studentsHere.map(s => (
                    <li 
                      key={s.studentId} 
                      onPointerDown={() => {
                        onStudentClick(s.studentId);
                        onCheckpointClick(null);
                      }}
                      style={{
                        cursor: "pointer",
                        padding: "2px 0",
                        color: "#222"
                      }}
                    >
                      {s.name} ({s.lapsCompleted * milesPerLap} mi)
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ color: "#999" }}>None</div>
              )}
            </div>
          </div>
        );
      })()}


    </div>
  );

  
}


