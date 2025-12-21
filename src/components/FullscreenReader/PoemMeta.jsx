import TagPill from "../TagPill";

export default function PoemMeta({ poem, theme }) {
  if (!poem) return null;

  return (
    <div className="poem-meta">
      <h1 className="poem-title">
        {poem.title || "(無題)"}
      </h1>

      <div className="poem-score">
        評価 {poem.score ?? "-"}
      </div>

      <div className="poem-tags">
        {(poem.tags || []).map((t) => (
          <TagPill key={t} label={t} theme={theme} />
        ))}
      </div>
    </div>
  );
}
