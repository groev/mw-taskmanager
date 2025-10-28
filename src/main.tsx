import { ContextMenuProvider } from "mantine-contextmenu";

import ReactDOM from "react-dom/client";
import {
  createTheme,
  MantineColorsTuple,
  MantineProvider,
} from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/core/styles.layer.css";
import "mantine-contextmenu/styles.layer.css";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import App from "./App.tsx";
import { AuthContextProvider } from "./context/AuthContext.tsx";

import "./global.css";

const slate: MantineColorsTuple = [
  "#f1f5f9",
  "#e2e8f0",
  "#cbd5e1",
  "#94a3b8",
  "#64748b",
  "#475569",
  "#334155",
  "#1e293b",
  "#0f172a",
  "#020617",
];

const theme = createTheme({
  fontFamily: "'Inter', sans-serif",
  primaryColor: "dark",
  primaryShade: 6,
  colors: {
    dark: slate,
  },
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
      <ContextMenuProvider>
        <AuthContextProvider>
          <App />
        </AuthContextProvider>
      </ContextMenuProvider>
    </MantineProvider>
  </QueryClientProvider>
);
