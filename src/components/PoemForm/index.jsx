import TitleInput from "./TitleInput";
import TitleCandidates from "./TitleCandidates";
import PoemTextarea from "./PoemTextarea";
import EmotionSelect from "./EmotionSelect";
import SubmitButton from "./SubmitButton";
import usePoemFormState from "./usePoemFormState";

export default function PoemForm({ onSave, editingPoem, titleCandidates }) {
  const {
    title,
    poemText,
    emotion,
    setTitle,
    setPoemText,
    setEmotion,
    handleSubmit,
    isDark,
    colors,
  } = usePoemFormState({ onSave, editingPoem });

  return (
    <form
      onSubmit={(e) => handleSubmit(e, title, poemText, emotion)}
      style={{
        background: colors.card,
        padding: "1.3rem",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "380px",
        margin: "1.5rem auto",
        boxShadow: isDark
          ? "0 4px 14px rgba(0,0,0,0.6)"
          : "0 4px 14px rgba(0,0,0,0.12)",
        fontFamily: "'YuMincho', serif",
        color: colors.text,
      }}
    >
      <TitleInput
        value={title}
        onChange={(v) => setTitle(v)}
        colors={colors}
      />

      {!editingPoem && (
        <TitleCandidates
          titleCandidates={titleCandidates}
          onPick={(v) => setTitle(v)}
          colors={colors}
        />
      )}

      <PoemTextarea
        value={poemText}
        onChange={(v) => setPoemText(v)}
        colors={colors}
      />

      <EmotionSelect
        value={emotion}
        onChange={(v) => setEmotion(v)}
        colors={colors}
      />

      <SubmitButton editingPoem={editingPoem} colors={colors} />
    </form>
  );
}
