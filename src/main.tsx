import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import i18n from "i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import DataGroupProvider from "./DataGroupProvider";
import { createBrowserRouter, Outlet, redirect, RouterProvider } from "react-router-dom";
import AppNavbar from "./AppNavbar";
import EntryView from "./views/EntryView";
import InsertEntryView from "./views/InsertEntryView";
import CellCultureBuyerView from "./views/CellCultureBuyerView";
import ArticleView from "./views/ArticleView";
import DispatchNoteView from "./views/DispatchNoteView";
import DispatchNoteArticleView from "./views/DispatchNoteArticleView";
import OptionsView from "./views/OptionsView";

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

const router = createBrowserRouter([
    {
        element: <AppNavbar children={<Outlet />} />,
        children: [
            { path: "/", element: <EntryView /> },
            { path: "/insert-entry", element: <InsertEntryView /> },
            {
                path: "insert-cell-culture-buyer",
                element: <CellCultureBuyerView />,
            },
            { path: "/article", element: <ArticleView /> },
            { path: "/dispatch-note", element: <DispatchNoteView /> },
            {
                path: "/dispatch-note/:dispatchNoteId",
                loader: ({ params }) => {
                    const unparsedDispatchNoteId = params.dispatchNoteId;

                    if (unparsedDispatchNoteId === undefined) {
                        return redirect("/");
                    }

                    const dispatchNoteId = Number(unparsedDispatchNoteId);

                    if (Number.isNaN(dispatchNoteId)) {
                        return redirect("/");
                    }

                    return dispatchNoteId;
                },
                element: <DispatchNoteArticleView />,
            },
            { path: "/options", element: <OptionsView /> },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <DataGroupProvider>
                <RouterProvider router={router} />
            </DataGroupProvider>
        </QueryClientProvider>
    </React.StrictMode>
);
