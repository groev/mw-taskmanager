import { doc, setDoc } from "firebase/firestore";

import { useMutation } from "@tanstack/react-query";

import { db, auth } from "@/firebase";

export default function useUpdateList(id: string) {
  return useMutation({
    mutationFn: async (values: List) => {
      if (!auth.currentUser?.uid) return;
      const listToUpdate = values;
      listToUpdate.user = auth.currentUser.uid;
      if (!id) return;
      const docRef = doc(db, "lists", id);
      delete listToUpdate?.id;
      await setDoc(docRef, listToUpdate);
    },
  });
}
