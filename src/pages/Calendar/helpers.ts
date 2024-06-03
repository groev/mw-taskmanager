import {
  QuerySnapshot,
  addDoc,
  collection,
  deleteDoc,
  doc,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "@/firebase";

async function updateEvent(id: string, data: CalendarEvent) {
  return await updateDoc(doc(db, "events", id), data);
}

async function deleteEvent(id: string) {
  return await deleteDoc(doc(db, "events", id));
}

async function addEvent(event: CalendarEvent) {
  const user = auth.currentUser?.uid;
  if (!user) return;
  event.user = user;
  return await addDoc(collection(db, "events"), event);
}

async function fetchEventsFromMicrosoft(day: string, msToken: string | null) {
  if (!msToken) return [];

  const mondayOfThisWeek = getMondayOfWeek(new Date(day));
  const sundayOfThisWeek = getSundayOfWeek(new Date(day));

  const url = `https://graph.microsoft.com/v1.0/me/calendarview?startdatetime=${new Date(
    mondayOfThisWeek
  ).toISOString()}&enddatetime=${new Date(
    sundayOfThisWeek
  ).toISOString()}&top=100`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + msToken,
      },
    });

    const data = await res.json();
    const msEvents = data.value;

    const events = [];
    for (const event of msEvents) {
      const start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);
      // check difference based on time zone (4 or 5)

      const startSlot = Math.floor(
        (start.getHours() - 2 + start.getTimezoneOffset() / 60) * 4 +
          start.getMinutes() / 15
      );
      const endSlot = Math.floor(
        (end.getHours() - 2 + start.getTimezoneOffset() / 60) * 4 +
          end.getMinutes() / 15
      );
      events.push({
        title: event.subject,
        day: isoDate(start),
        startSlot: startSlot,
        endSlot: endSlot,
        id: event.id,
        startEditable: false,
        durationEditable: false,
        checked: false,
        type: "ms",
        joinUrl: event?.onlineMeeting?.joinUrl,
      } as CalendarEvent);
    }
    return events;
  } catch (err) {
    return [];
  }
}

function isoDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function mapEvents(events: CalendarEvent[]) {
  return events?.map((event) => {
    // check if event.startSlot and endSlot is a positive number or zero and if day exists
    if (
      typeof event.startSlot !== "number" ||
      typeof event.endSlot !== "number" ||
      !event.day
    )
      return;

    return {
      color: "transparent",
      id: event.id,
      start: createTimeString(event.day, event.startSlot),
      end: createTimeString(event.day, event.endSlot),
      ...event,
    };
  });
}

function mapFirestore(snapshot: QuerySnapshot) {
  if (!Array.isArray(snapshot)) return [];
  return snapshot.docs?.map((docSnapshot) => {
    const data = docSnapshot.data();
    return { ...data, id: docSnapshot.id };
  });
}

function getQuery(day: string) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const monday = getMondayOfWeek(new Date(day));

    monday.setDate(monday.getDate() + i);
    return monday;
  }).map((date) => isoDate(date));

  return query(
    collection(db, "events"),
    where("day", "in", days),
    where("user", "==", auth.currentUser?.uid)
  );
}

function createTimeString(day: string, slot: number) {
  const date = new Date(day);
  date.setHours(6 + Math.floor(slot / 4));
  date.setMinutes((slot % 4) * 15);
  return date;
}

const handleMove = ({ event }: { event: FullCalendarEvent }) => {
  const startSlot = Math.floor(
    (event.start.getHours() - 6) * 4 + event.start.getMinutes() / 15
  );
  const endSlot = Math.floor(
    (event.end.getHours() - 6) * 4 + event.end.getMinutes() / 15
  );
  const day = event.start.toISOString().substring(0, 10);
  return updateEvent(event.id, { startSlot, endSlot, day } as CalendarEvent);
};

function getMondayOfWeek(date: Date) {
  const today = new Date(date);
  const dayOfWeek = today.getDay();
  const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  today.setHours(0, 0, 0, 0);

  const monday = new Date(today.setDate(today.getDate() + offsetToMonday));
  const timezoneOffsetMinutes = monday.getTimezoneOffset();

  monday.setMinutes(monday.getMinutes() - timezoneOffsetMinutes);

  return monday;
}

function getSundayOfWeek(today: Date) {
  const date = new Date(today);

  const dayOfWeek = date.getDay();

  const offsetToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

  const sunday = new Date(date);
  sunday.setDate(sunday.getDate() + offsetToSunday);
  sunday.setHours(23, 59, 59, 999);
  const timezoneOffsetMinutes = sunday.getTimezoneOffset();

  sunday.setMinutes(sunday.getMinutes() - timezoneOffsetMinutes);

  return sunday;
}

export {
  updateEvent,
  deleteEvent,
  addEvent,
  isoDate,
  mapEvents,
  handleMove,
  fetchEventsFromMicrosoft,
  mapFirestore,
  getQuery,
};
