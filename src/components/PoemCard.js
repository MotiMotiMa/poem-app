import { useNavigate } from "react-router-dom";

export default function PoemCard({ poem, onEdit, onDelete, theme }) {
  const navigate = useNavigate();

  const bg = theme === "dark" ? "#2c2c2c" : "#dff5ff";
  const text = theme === "dark" ? "#f1f1f1" : "#111";

  return (
    <div
      style={{
        width: "260px",
        padding: "1rem",
        borderRadius: "14px",
        background: bg,
        color: text,
        boxShadow:
          theme === "dark"
            ? "0 4px 10px rgba(0,0,0,0.5)"
            : "0 4px 10px rgba(0,0,0,0.1)",
        cursor: "pointer",
      }}
      onClick={() => navigate(`/poem/${poem.id}`)}
    >
      <div style={{ marginBottom: "0.5rem", fontWeight: "700" }}>
        {poem.emotion}
      </div>

      <p style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem" }}>{poem.poem}</p>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
        <button onClick={(e) => { e.stopPropagation(); onEdit(poem); }}>編集</button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(poem.id); }}>削除</button>
      </div>
    </div>
  );
}
