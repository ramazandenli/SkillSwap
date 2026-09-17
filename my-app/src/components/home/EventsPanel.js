import Panel from "../ui/Panel.js";
import EventCard from "./EventCard.js";
import { AsyncBoundary, Empty } from "../ui/StateMessage.js";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import * as eventsApi from "../../api/events.js";

/**
 * Takas ve ogretme etkinlikleri.
 *
 * Kabul edildiginde iki tarafa da 10 puan ekleniyor; bu kural uygulamada
 * degil veritabanindaki trigger_update_points_on_accept trigger'inda.
 * Bu yuzden kabul isteginden sonra profil karti degil, sadece liste
 * yenileniyor -- puanlar bir sonraki profil yuklemesinde guncelleniyor.
 */
function EventsPanel({ username, onEventResolved }) {
  const { data, loading, error, reload } = useAsyncData(
    () => eventsApi.getEvents(username),
    [username]
  );

  async function handleAccept(eventId) {
    await eventsApi.acceptEvent(eventId);
    reload();
    onEventResolved?.();
  }

  async function handleReject(eventId) {
    await eventsApi.rejectEvent(eventId);
    reload();
  }

  const exchanges = data?.exchanges ?? [];
  const teaches = data?.teaches ?? [];

  return (
    <Panel title="Etkinliklerim" className="events-panel">
      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        <EventGroup
          heading="Takaslar"
          description="Karsilikli yetenek degisimi"
          events={exchanges}
          onAccept={handleAccept}
          onReject={handleReject}
        />
        <EventGroup
          heading="Ogretmeler"
          description="Tek yonlu ogretme"
          events={teaches}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      </AsyncBoundary>
    </Panel>
  );
}

function EventGroup({ heading, description, events, onAccept, onReject }) {
  return (
    <div className="event-group">
      <div className="event-group__header">
        <h3>{heading}</h3>
        <span>{description}</span>
      </div>

      {events.length === 0 ? (
        <Empty>Bu turde etkinligin yok.</Empty>
      ) : (
        <div className="event-group__list">
          {events.map((event) => (
            <EventCard
              key={event.event_id}
              event={event}
              onAccept={onAccept}
              onReject={onReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default EventsPanel;
