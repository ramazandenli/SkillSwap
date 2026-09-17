import Avatar from "../ui/Avatar.js";

/**
 * Tek bir etkinlik karti.
 *
 * Sunucu etkinligi zaten "bakan kisinin gozunden" gonderiyor
 * (counterpart_id / skill_given / skill_taken / can_respond), bu yuzden burada
 * "ben user1 miyim yoksa user2 mi" sorusu hic sorulmuyor. Eskiden bu kosul
 * dort ayri JSX blogunda tekrar ediyordu.
 */
function EventCard({ event, onAccept, onReject }) {
  const isWaiting = event.status === "waiting";

  return (
    <article className="event-card">
      <header className="event-card__header">
        <Avatar username={event.counterpart_id} size="sm" />
        <span className="event-card__user">{event.counterpart_id}</span>
        <span className={isWaiting ? "badge badge--waiting" : "badge badge--active"}>
          {isWaiting ? "Onay bekliyor" : "Aktif"}
        </span>
      </header>

      <dl className="event-card__skills">
        <div>
          <dt>Verdigim</dt>
          <dd>{event.skill_given}</dd>
        </div>
        <div>
          <dt>Aldigim</dt>
          <dd>{event.skill_taken}</dd>
        </div>
      </dl>

      <p className="event-card__dates">
        {event.start_date} &rarr; {event.end_date}
      </p>

      {/* can_respond sunucudan geliyor: istegi karsi taraf baslattiysa
          ve hala beklemedeyse cevaplama hakki bizde. */}
      {event.can_respond && (
        <div className="event-card__actions">
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => onAccept(event.event_id)}
          >
            Kabul et
          </button>
          <button
            type="button"
            className="btn btn--danger btn--sm"
            onClick={() => onReject(event.event_id)}
          >
            Reddet
          </button>
        </div>
      )}
    </article>
  );
}

export default EventCard;
