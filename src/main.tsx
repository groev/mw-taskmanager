import ReactDOM from "react-dom/client";
import { createTheme, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import App from "./App.tsx";
import { AuthContextProvider } from "./context/AuthContext.tsx";

const theme = createTheme({
  fontFamily: "'Inter', sans-serif",
  primaryColor: "dark",
  primaryShade: 9,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <MantineProvider theme={theme}>
      <AuthContextProvider>
        <App />
      </AuthContextProvider>
    </MantineProvider>
  </QueryClientProvider>
);
