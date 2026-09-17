import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import AppShell from "../components/layout/AppShell.js";
import ContactList from "../components/chat/ContactList.js";
import MessageList from "../components/chat/MessageList.js";
import MessageComposer from "../components/chat/MessageComposer.js";
import Avatar from "../components/ui/Avatar.js";
import { ErrorMessage, Loading } from "../components/ui/StateMessage.js";
import { useAuth } from "../context/AuthContext.js";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { useChat } from "../hooks/useChat.js";
import * as messagesApi from "../api/messages.js";
import "../styles/chat.css";

/**
 * Adres kontrolu.
 *
 * Home'daki ile ayni gerekce. Sohbet verisi artik zaten adresten degil
 * token'dan belirleniyor (sunucu "peer" disindaki ucu kendisi koyuyor,
 * Socket.IO room'una da dogrulanmis kimlikle katiliyor), yani baskasinin
 * adresini yazmak onun mesajlarini getirmiyor. Bu kontrol, adresin
 * gosterdigi kisi ile ekranda gorunen verinin celismemesi icin.
 */
function Messages() {
  const { username, user: peerFromUrl } = useParams();
  const { username: sessionUsername } = useAuth();

  if (username !== sessionUsername) {
    return <Navigate to={`/messages/${sessionUsername}`} replace />;
  }

  return <MessagesContent username={username} peerFromUrl={peerFromUrl} />;
}

/**
 * Mesajlar sayfasi.
 *
 * Iki adresle de acilabiliyor:
 *   /messages/:username        -> sadece kisi listesi
 *   /messages/:username/:peer  -> belirli bir sohbet acik
 *
 * Ikinci hal, arama sonucundaki "Mesaj" dugmesinden geliyor. Karsi taraf
 * daha once hic yazismadigimiz biri olabilir; o yuzden kisi listesinde
 * yoksa basa ekleniyor.
 */
function MessagesContent({ username, peerFromUrl }) {
  const navigate = useNavigate();

  const [selectedContact, setSelectedContact] = useState(peerFromUrl ?? null);

  const contacts = useAsyncData(() => messagesApi.getContacts(), [username]);

  // Yeni bir kisiden mesaj gelirse kisi listesi guncel kalmali.
  const handleAnyMessage = useCallback(
    (message) => {
      const other = message.from_id === username ? message.to_id : message.from_id;
      const known = (contacts.data ?? []).some((contact) => contact.user_id === other);

      if (!known) contacts.reload();
    },
    [username, contacts]
  );

  const { messages, loading, error, peerTyping, sendMessage, notifyTyping } = useChat(
    username,
    selectedContact,
    handleAnyMessage
  );

  // URL'den gelen kisi, listede olmasa bile secilebilir olmali.
  const contactNames = useMemo(() => {
    const names = (contacts.data ?? []).map((contact) => contact.user_id);

    if (peerFromUrl && !names.includes(peerFromUrl)) {
      return [peerFromUrl, ...names];
    }

    return names;
  }, [contacts.data, peerFromUrl]);

  // Adres cubugundaki kisi degisirse (ornegin geri tusu) secim de degissin.
  useEffect(() => {
    if (peerFromUrl) setSelectedContact(peerFromUrl);
  }, [peerFromUrl]);

  function handleSelect(contact) {
    setSelectedContact(contact);
    // Adresi de guncelliyoruz ki sohbet paylasilabilir ve yenilenebilir olsun.
    navigate(`/messages/${username}/${contact}`, { replace: true });
  }

  return (
    <AppShell>
      <div className="chat">
        <aside className="chat__sidebar">
          <h2 className="chat__sidebar-title">Sohbetler</h2>
          {contacts.loading ? (
            <Loading />
          ) : contacts.error ? (
            <ErrorMessage message={contacts.error} onRetry={contacts.reload} />
          ) : (
            <ContactList
              contacts={contactNames}
              selectedContact={selectedContact}
              onSelect={handleSelect}
            />
          )}
        </aside>

        <section className="chat__main">
          {!selectedContact ? (
            <div className="chat__placeholder">
              <p>Soldan bir kisi secerek sohbete basla.</p>
            </div>
          ) : (
            <>
              <header className="chat__header">
                <Avatar username={selectedContact} size="sm" />
                <span className="chat__peer">{selectedContact}</span>
                {peerTyping && <span className="chat__typing">yaziyor...</span>}
              </header>

              {loading ? (
                <Loading label="Sohbet yukleniyor..." />
              ) : (
                <MessageList
                  messages={messages}
                  currentUser={username}
                  peerTyping={peerTyping}
                />
              )}

              {error && <ErrorMessage message={error} />}

              <MessageComposer
                onSend={sendMessage}
                onTyping={notifyTyping}
                disabled={!selectedContact}
              />
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}

export default Messages;
