import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// shadcn toaster
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <Toaster />
    <Sonner />
  </React.StrictMode>
);
