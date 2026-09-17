import Avatar from "../ui/Avatar.js";
import { Empty } from "../ui/StateMessage.js";

/**
 * Sol taraftaki kisi listesi.
 *
 * Liste get_contacted_users fonksiyonundan geliyor: kullanicinin yazistigi
 * herkes (hem yazdiklari hem yazanlar, UNION ile tekillestirilmis).
 */
function ContactList({ contacts, selectedContact, onSelect }) {
  if (contacts.length === 0) {
    return (
      <div className="contact-list">
        <Empty>Henuz kimseyle yazismadin.</Empty>
      </div>
    );
  }

  return (
    <ul className="contact-list">
      {contacts.map((contact) => (
        <li key={contact}>
          <button
            type="button"
            className={contact === selectedContact ? "contact contact--active" : "contact"}
            onClick={() => onSelect(contact)}
            aria-current={contact === selectedContact}
          >
            <Avatar username={contact} size="sm" />
            <span className="contact__name">{contact}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default ContactList;
