import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

function getColorByScore(score) {
  if (score >= 80) return "green";
  if (score >= 50) return "orange";
  return "red";
}

function PoemCard({ poem, onEdit, onDelete }) {
  const scoreNum = Number(poem.score);

  return (
    <div
      style={{
        background: "#f1f2f6",
        borderRadius: "16px",
        padding: "1rem",
        width: "280px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        textAlign: "center",
      }}
    >
      

      <h3>✒️ 詩</h3>
      <p style={{ whiteSpace: 'pre-wrap' }}>{poem.poem}</p>

      {/* 円ゲージ */}
      <div style={{ width: "100px", height: "100px", margin: "auto" }}>
        <CircularProgressbar
          value={scoreNum}
          maxValue={100}
          text={`${scoreNum}`}
          styles={buildStyles({
            pathColor: getColorByScore(scoreNum),
            textColor: "#2d3436",
            trailColor: "#dfe6e9",
            textSize: "20px",
          })}
        />
      </div>

      <p>
        <strong>💬 コメント:</strong> {poem.comment}
      </p>

      {/* 👇 評価ラベル */}
      {poem.status && (
        <p style={{ fontStyle: "italic", color: "#636e72" }}>{poem.status}</p>
      )}

      <small>{new Date(poem.created_at).toLocaleString()}</small>

      <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
        <button style={{ flex: 1 }} onClick={() => onEdit(poem)}>
          編集
        </button>
        <button
          style={{ flex: 1, background: "red", color: "#fff" }}
          onClick={() => onDelete(poem.id)}
        >
          削除
        </button>
      </div>
    </div>
  );
}

export default PoemCard;
