type CalendarEvent = {
  id?: string;
  title?: string;
  day?: string;
  text?: string;
  startSlot?: number;
  endSlot?: number;
  startEditable?: boolean;
  durationEditable?: boolean;
  checked?: boolean;
  type?: string;
  user?: string;
  msid?: string;
};

type FullCalendarEvent = {
  color: string;
  id: string;
  title: string;
  start: Date;
  end: Date;
  day: string;
  startSlot: number;
  endSlot: number;
  startEditable?: boolean;
  durationEditable?: boolean;
  checked: boolean;
  type: string;
  user?: string;
  text?: string;
  extendedProps: {
    id: string;
    text?: string;
    title?: string;
    day: string;
    startSlot: number;
    endSlot: number;
    startEditable: boolean;
    durationEditable: boolean;
    checked: boolean;
    type: string;
    user?: string;
    msid?: string;
    joinUrl?: string;
  };
};
