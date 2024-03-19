import {
  updateDoc,
  doc,
  deleteDoc,
  addDoc,
  collection,
  where,
  query,
  QuerySnapshot,
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
  ).toISOString()}&enddatetime=${new Date(sundayOfThisWeek).toISOString()}`;

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
        (start.getHours() - 4 + start.getTimezoneOffset() / 60) * 4 +
          start.getMinutes() / 15
      );
      const endSlot = Math.floor(
        (end.getHours() - 4 + start.getTimezoneOffset() / 60) * 4 +
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
      });
    }
    return events;
  } catch (err) {
    console.log(err);
  }
}

function isoDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function mapEvents(events: CalendarEvent[]) {
  return events?.map((event) => {
    if (!event.day || !event.startSlot || !event.endSlot) return null;
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
  const day = date.getDay();
  const diff = date.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  return new Date(date.setDate(diff));
}

function getSundayOfWeek(date: Date) {
  const day = date.getDay();
  const diff = date.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  return new Date(date.setDate(diff + 6));
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
