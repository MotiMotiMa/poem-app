export default function PoemBody({ poem }) {
  return (
    <pre
      style={{
        whiteSpace: "pre-wrap",
        textAlign: "center",
        fontSize: "1.3rem",
        lineHeight: "2.2rem",
      }}
    >
      {poem.poem}
    </pre>
  );
}