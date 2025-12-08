// components/PoemEvaluationCard.jsx
export default function PoemEvaluationCard({ poem }) {
  if (!poem) return null;

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "20px",
        marginTop: "24px",
        background: "#fafafa",
        lineHeight: 1.8,
      }}
    >
      <h2 style={{ margin: "0 0 10px 0", fontWeight: "600" }}>
        📘 詩：{poem.title}
      </h2>

      <div style={{ marginBottom: "16px" }}>
        <span style={{ fontWeight: "600" }}>emotion：</span>
        <span>{poem.emotion}</span>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ marginBottom: "6px" }}>📚 タイトル候補</h3>
        {poem.titleCandidates?.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: "18px" }}>
            {poem.titleCandidates.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        ) : (
          <div style={{ opacity: 0.6 }}>候補なし</div>
        )}
      </div>

      <div>
        <h3 style={{ marginBottom: "6px" }}>🏷 タグ</h3>
        {poem.tags?.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {poem.tags.map((tag, i) => (
              <div
                key={i}
                style={{
                  padding: "4px 10px",
                  background: "#eaeaea",
                  borderRadius: "20px",
                  fontSize: "14px",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ opacity: 0.6 }}>タグなし</div>
        )}
      </div>
    </div>
  );
}
