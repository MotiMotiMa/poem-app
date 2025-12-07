/* C:\Users\PC_User\poem-app\src\components\SearchBar.jsx */

export default function SearchBar({ value, onChange }) {
  return (
    <div style={{ textAlign: "center", margin: "1.5rem 0" }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="詩を検索（タイトル・本文・emotion・コメント）"
        style={{
          width: "80%",
          maxWidth: "420px",
          padding: "0.7rem 1rem",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "1rem",
        }}
      />
    </div>
  );
}
