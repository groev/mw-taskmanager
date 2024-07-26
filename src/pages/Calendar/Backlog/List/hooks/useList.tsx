import { doc, getDoc } from "firebase/firestore";

import { useNavigate } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import { db } from "@/firebase";

const isNew = false;

export default function useList(id: string) {
  const navigate = useNavigate();
  return useQuery({
    queryKey: ["list", id],
    retry: false,
    queryFn: async () => {
      if (isNew) return null;
      if (!id) return navigate("/lists");
      const docRef = doc(db, "lists", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const items = docSnap.data()?.items || [];
        const fetchedList = {
          id: docSnap.id,
          ...docSnap.data(),
          items: items.map((item: ListItem) => ({
            ...item,
            id: item.id || Math.random().toString(36).substring(2),
          })),
        };

        return fetchedList as List;
      } else {
        return navigate("/lists");
      }
    },
  });
}
