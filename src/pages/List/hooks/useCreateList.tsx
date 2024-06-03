import { addDoc, collection } from "firebase/firestore";

import { useNavigate } from "react-router-dom";

import { useMutation } from "@tanstack/react-query";

import { db, auth } from "@/firebase";

export default function useCreateList() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (values: List) => {
      if (!auth.currentUser?.uid) return;
      const listToInsert = values;
      listToInsert.user = auth.currentUser?.uid;
      const doc = await addDoc(collection(db, "lists"), listToInsert);
      return navigate(`/lists/${doc.id}`);
    },
  });
}
