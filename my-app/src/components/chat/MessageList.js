import { useEffect, useRef } from "react";

/**
 * Mesaj balonlari.
 *
 * Yeni mesaj geldiginde liste otomatik olarak en alta kayiyor; aksi halde
 * kullanici her mesajdan sonra elle asagi kaydirmak zorunda kalirdi.
 */
function MessageList({ messages, currentUser, peerTyping }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, peerTyping]);

  return (
    <div className="message-list">
      {messages.map((message) => {
        const isMine = message.from_id === currentUser;

        return (
          <div
            key={message.text_id}
            className={isMine ? "bubble bubble--mine" : "bubble bubble--theirs"}
          >
            <p className="bubble__text">{message.message}</p>
            <time className="bubble__time">
              {new Date(message.date).toLocaleTimeString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </div>
        );
      })}

      {peerTyping && (
        <div className="bubble bubble--theirs bubble--typing" aria-live="polite">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      )}

      {/* Kaydirmanin hedefi: listenin en altindaki bos isaretci. */}
      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;
