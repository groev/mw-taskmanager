import { doc, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { db } from "@/firebase";

export default function useDeleteList(id: string) {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async () => {
      if (!id) return;
      const docRef = doc(db, "lists", id);
      return await deleteDoc(docRef);
    },
    onSuccess: () => {
      navigate("/lists");
    },
  });
}
