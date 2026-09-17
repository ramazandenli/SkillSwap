/**
 * Yetenek etiketi. onRemove verilirse yaninda kaldirma dugmesi cikiyor;
 * verilmezse sadece etiket olarak gosteriliyor (baskasinin profilinde).
 */
function SkillTag({ name, tone = "neutral", onRemove }) {
  return (
    <span className={`tag tag--${tone}`}>
      {name}
      {onRemove && (
        <button
          type="button"
          className="tag__remove"
          onClick={onRemove}
          aria-label={`${name} yetenegini kaldir`}
        >
          ×
        </button>
      )}
    </span>
  );
}

export default SkillTag;
