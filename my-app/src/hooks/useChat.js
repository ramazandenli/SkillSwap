import { useCallback, useEffect, useRef, useState } from "react";
import { connectSocket, getSocket } from "../lib/socket.js";
import * as messagesApi from "../api/messages.js";

/**
 * Sohbet mantiginin tamami burada; Messages sayfasi sadece cizim yapiyor.
 *
 * Iki kaynak birlestiriliyor:
 *   - Gecmis mesajlar HTTP ile bir kere cekiliyor (soket, baglanmadan onceki
 *     mesajlari bilmez).
 *   - Yeni mesajlar Socket.IO olayi olarak geliyor.
 *
 * Gonderilen mesaji ekrana kendimiz eklemiyoruz: sunucu mesaji kaydettikten
 * sonra gonderene de yayinliyor. Boylece ekranda gorunen satir ile
 * veritabanindaki satir birebir ayni (ayni text_id, ayni tarih).
 */
export function useChat(username, peer, onAnyMessage) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [peerTyping, setPeerTyping] = useState(false);

  // Callback'i ref'te tutuyoruz ki her render'da degismesi, olay
  // dinleyicilerini bosuna sokup cikarmasin.
  const onAnyMessageRef = useRef(onAnyMessage);
  onAnyMessageRef.current = onAnyMessage;

  /* 1) Baglanti: kullanici degismedikce bir kere kuruluyor.
        Kimlik token'dan dogrulandigi icin connectSocket'e ad vermiyoruz. */
  useEffect(() => {
    if (!username) return;
    connectSocket();
  }, [username]);

  /* 2) Gecmis: secili kisi degistiginde yeniden cekiliyor. */
  useEffect(() => {
    if (!peer) {
      setMessages([]);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setPeerTyping(false);

    messagesApi
      .getConversation(peer)
      .then((history) => {
        if (!cancelled) setMessages(history);
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username, peer]);

  /* 3) Canli olaylar. */
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    function handleMessage(message) {
      // Her mesaj bize ulasiyor olabilir; ekranda sadece acik olan sohbete
      // ait olanlari gosteriyoruz.
      const belongsToOpenChat =
        (message.from_id === username && message.to_id === peer) ||
        (message.from_id === peer && message.to_id === username);

      if (belongsToOpenChat) {
        setMessages((previous) =>
          // Ayni mesajin iki kez eklenmesini text_id ile engelliyoruz
          // (ornegin yeniden baglanma sirasinda olay tekrar gelebilir).
          previous.some((existing) => existing.text_id === message.text_id)
            ? previous
            : [...previous, message]
        );
        setPeerTyping(false);
      }

      // Sohbet listesinin guncellenmesi icin sayfaya haber veriyoruz:
      // hic yazismadigimiz biri mesaj atmissa kisi listesine eklenmeli.
      onAnyMessageRef.current?.(message);
    }

    function handleTyping({ from, isTyping }) {
      if (from === peer) setPeerTyping(isTyping);
    }

    function handleError({ message }) {
      setError(message);
    }

    socket.on("chat:message", handleMessage);
    socket.on("chat:typing", handleTyping);
    socket.on("chat:error", handleError);

    return () => {
      socket.off("chat:message", handleMessage);
      socket.off("chat:typing", handleTyping);
      socket.off("chat:error", handleError);
    };
  }, [username, peer]);

  const sendMessage = useCallback(
    (text) => {
      const socket = getSocket();
      const trimmed = text.trim();

      if (!socket || !peer || !trimmed) return;

      socket.emit("chat:send", { to: peer, message: trimmed });
      socket.emit("chat:typing", { to: peer, isTyping: false });
    },
    [peer]
  );

  const notifyTyping = useCallback(
    (isTyping) => {
      const socket = getSocket();
      if (!socket || !peer) return;

      socket.emit("chat:typing", { to: peer, isTyping });
    },
    [peer]
  );

  return { messages, loading, error, peerTyping, sendMessage, notifyTyping };
}
