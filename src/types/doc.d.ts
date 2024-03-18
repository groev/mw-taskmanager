import { Timestamp } from "firebase/firestore";

type Doc = {
  id?: string;
  title: string;
  content: string;
  user: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
};

export type { Doc };
