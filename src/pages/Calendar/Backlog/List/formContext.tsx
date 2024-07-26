import { createFormContext } from "@mantine/form";

// You can give context variables any name
export const [FormProvider, useFormContext, useForm] =
  createFormContext<List>();
