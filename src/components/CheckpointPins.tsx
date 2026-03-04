import type { Checkpoint } from "../api/races";

type Props = {
  checkpoints: Checkpoint[];
};

export default function CheckpointPins({ checkpoints }: Props) {
  return (
    <>
      {checkpoints.map(cp => (
        <div
          key={cp.id}
          style={{
            position: "absolute",
            left: `${cp.mapPositionX}%`,
            top: `${cp.mapPositionY}%`,
            width: "12px",
            height: "12px",
            backgroundColor: "#1976d2",
            border: "2px solid white",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            zIndex: 5
          }}
          title={`${cp.name} (${cp.distanceFromStart} mi)`}
        />
      ))}
    </>
  );
}
