import { useEffect, useRef, useState } from "react";

const TYPING_IDLE_MS = 1500;

/**
 * Mesaj yazma alani.
 *
 * "yaziyor..." bilgisi her tus vurusunda gonderilmiyor. Ilk tusta bir kez
 * "yaziyor" deniyor, sonra 1.5 saniye boyunca yeni tus gelmezse "durdu"
 * bilgisi gidiyor. Bu, saniyede onlarca gereksiz olay gondermeyi onluyor.
 */
function MessageComposer({ onSend, onTyping, disabled }) {
  const [text, setText] = useState("");
  const isTypingRef = useRef(false);
  const idleTimerRef = useRef(null);

  function stopTyping() {
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTyping(false);
    }
  }

  function handleChange(event) {
    setText(event.target.value);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTyping(true);
    }

    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(stopTyping, TYPING_IDLE_MS);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!text.trim()) return;

    onSend(text);
    setText("");

    clearTimeout(idleTimerRef.current);
    isTypingRef.current = false;
  }

  // Bilesen ekrandan kalkarsa (baska sohbete gecildi, sayfa degisti) bekleyen
  // zamanlayiciyi temizliyoruz; aksi halde React kaldirilmis bir bilesende
  // state guncellemeye calisirdi.
  useEffect(() => () => clearTimeout(idleTimerRef.current), []);

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <input
        className="input composer__input"
        type="text"
        value={text}
        // Sunucudaki sinirla ayni (utils/validate.js). Buradaki sinir sadece
        // kullaniciyi bilgilendirmek icin; asil kontrol sunucuda.
        maxLength={2000}
        onChange={handleChange}
        placeholder={disabled ? "Once bir kisi sec" : "Mesaj yaz..."}
        disabled={disabled}
        aria-label="Mesaj"
      />
      <button type="submit" className="btn btn--primary" disabled={disabled || !text.trim()}>
        Gonder
      </button>
    </form>
  );
}

export default MessageComposer;
