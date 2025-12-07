// Toast.jsx

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        background: "rgba(40, 167, 69, 0.9)",
        color: "#fff",
        padding: "0.8rem 1.2rem",
        borderRadius: "8px",
        fontSize: "0.95rem",
        fontWeight: "600",
        boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
        zIndex: 9999,
        transition: "all 0.3s ease-in-out",
      }}
    >
      {message}
    </div>
  );
}
