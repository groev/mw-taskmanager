import { collection, query, getDocs, where } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";

import { db, auth } from "@/firebase";

export default function useLists() {
  return useQuery({
    queryKey: ["lists"],
    queryFn: async () => {
      const lists = collection(db, "lists");
      const q = query(lists, where("user", "==", auth.currentUser?.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            id: doc.id,
          } as List)
      );
      return data;
    },
  });
}
