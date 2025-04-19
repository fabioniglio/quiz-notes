import { Toaster } from "@/components/ui/sonner";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { Analytics } from "@vercel/analytics/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.tsx";
import "./index.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                "group border bg-card text-card-foreground shadow-lg rounded-md p-4 flex gap-3 items-start",
              title: "text-sm font-semibold",
              description: "text-sm",
              actionButton:
                "bg-primary text-primary-foreground hover:bg-primary/90 text-xs px-2 py-1 rounded-md",
              cancelButton:
                "bg-muted text-muted-foreground hover:bg-muted/90 text-xs px-2 py-1 rounded-md",
              success:
                "border-green-600/20 bg-green-50 dark:bg-green-950/50 [&_div]:text-green-800 dark:[&_div]:text-green-300",
              error:
                "border-destructive/20 bg-destructive/10 [&_div]:text-destructive dark:[&_div]:text-destructive-foreground",
              info: "border-primary/20 bg-primary/10 [&_div]:text-primary dark:[&_div]:text-primary-foreground",
              warning:
                "border-yellow-600/20 bg-yellow-50 dark:bg-yellow-950/50 [&_div]:text-yellow-800 dark:[&_div]:text-yellow-300",
            },
          }}
        />
        <Analytics />
      </BrowserRouter>
    </ConvexAuthProvider>
  </StrictMode>,
);
