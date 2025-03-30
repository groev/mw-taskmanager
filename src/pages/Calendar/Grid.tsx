import { useRef, useEffect } from "react";
import { QuerySnapshot, onSnapshot } from "firebase/firestore";
import { EventInput } from "@fullcalendar/core/index.js";
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Box, SimpleGrid } from "@mantine/core";

import { useViewportSize } from "@mantine/hooks";

import { useQuery } from "@tanstack/react-query";

import { useAuthContext } from "@/context/AuthContext";

import Event from "./Event";
import {
  fetchEventsFromMicrosoft,
  mapEvents,
  handleMove,
  getDays,
  getQuery,
} from "./helpers";
import { useCalendarStore } from "./store";
import Summary from "./Summary";

export default function Daygrid() {
  const day = useCalendarStore((state) => state.day);
  const events = useCalendarStore((state) => state.events);
  const setEvents = useCalendarStore((state) => state.setEvents);
  const { width } = useViewportSize();

  const { msToken } = useAuthContext();
  const setSelectedSlot = useCalendarStore((state) => state.setSelectedSlot);
  const days = getDays(day);

  useEffect(() => {
    if (!day) return;
    const unsubscribe = onSnapshot(getQuery(day), (snapshot: QuerySnapshot) => {
      const data = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as CalendarEvent)
      );
      setEvents(data);
    });
    return () => unsubscribe();
  }, [day, setEvents]);

  const { data: msEvents = [] } = useQuery({
    queryKey: ["msEvents", day, msToken],
    enabled: !!msToken,
    queryFn: async () => await fetchEventsFromMicrosoft(day, msToken),
  });

  const calRef = useRef<FullCalendar>(null);

  useEffect(() => {
    if (!calRef.current) return;
    if (width > 768) {
      calRef.current.getApi().changeView("timeGridWeek");
    } else {
      calRef.current.getApi().changeView("timeGridDay");
    }
  }, [width, calRef]);

  useEffect(() => {
    const date = new Date(day);
    if (calRef.current) {
      const api = calRef.current?.getApi();
      api.gotoDate(date);
    }
  }, [day, calRef]);

  return (
    <>
      <SimpleGrid cols={7} spacing={0} ml={45}>
        {days.map((day) => (
          <Summary
            key={day}
            day={day}
            tasks={mapEvents([...events, ...msEvents]).filter(
              (t) => t.day === day
            )}
          />
        ))}
      </SimpleGrid>
      <FullCalendar
        dayHeaderFormat={{
          weekday: "short",
          month: "numeric",
          day: "numeric",
          omitCommas: true,
        }}
        eventContent={(data: { event: FullCalendarEvent }) => (
          <Event data={data.event} />
        )}
        allDaySlot={false}
        slotMinTime={"06:00:00"}
        slotMaxTime={"23:00:00"}
        expandRows={true}
        timeZone="Europe/Berlin"
        height="1500px"
        contentHeight={15000}
        aspectRatio={5}
        editable={true}
        initialDate={day}
        eventDrop={async (arg: unknown) =>
          await handleMove(arg as { event: FullCalendarEvent })
        }
        selectable
        eventResize={async (arg: unknown) =>
          await handleMove(arg as { event: FullCalendarEvent })
        }
        ref={calRef}
        select={(info) => setSelectedSlot(info)}
        unselect={() => setSelectedSlot(null)}
        unselectAuto={false}
        unselectCancel={".form"}
        headerToolbar={{ center: "", left: "", right: "" }}
        plugins={[timeGridPlugin, interactionPlugin]}
        firstDay={1}
        slotLabelFormat={{
          hour: "numeric",
          omitZeroMinute: true,
        }}
        events={mapEvents([...events, ...msEvents]) as EventInput}
      />
    </>
  );
}
