import { create } from "zustand";

import { isoDate } from "./helpers";

interface CalendarStore {
  day: string;
  setDay: (day: string) => void;
  selectedEvent: FullCalendarEvent | null;
  selectedSlot: {
    start: Date;
    end: Date;
  } | null;
  setSelectedSlot: (selectedSlot: { start: Date; end: Date } | null) => void;
  setSelectedEvent: (selectedEvent: FullCalendarEvent | null) => void;
  events: CalendarEvent[];
  setEvents: (events: CalendarEvent[]) => void;
  changeDay: (offset: number) => void;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  day: isoDate(new Date()),
  setDay: (day) => set({ day }),
  selectedEvent: null,
  selectedSlot: null,
  setSelectedSlot: (selectedSlot) => set({ selectedSlot }),
  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),
  events: [],
  setEvents: (events) => set({ events }),
  changeDay: (offset) => {
    const date = new Date(get().day);
    date.setDate(date.getDate() + offset * 7);
    const dayOfWeek = date.getDay();
    // set day to monday
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is sunday
    date.setDate(diff);

    set({ day: isoDate(date) });
  },
}));
