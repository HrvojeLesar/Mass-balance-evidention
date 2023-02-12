import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import i18n from "i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import DataGroupProvider from "./DataGroupProvider";

const queryClient = new QueryClient();

export const LANGUAGES = ["hr", "en"];

i18n.use(Backend)
    .use(initReactI18next)
    .init({
        lng: "hr",
        debug: true,
        fallbackLng: false,
        interpolation: {
            escapeValue: false,
        },
    });

declare global {
    interface Window {
        __TAURI__?: any;
    }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <DataGroupProvider>
                <App />
            </DataGroupProvider>
        </QueryClientProvider>
    </React.StrictMode>
);
