import React from "react";
import ReactDOM from "react-dom/client";
import i18n from "i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import DataGroupProvider from "./DataGroupProvider";
import {
    createBrowserRouter,
    Outlet,
    redirect,
    RouterProvider,
} from "react-router-dom";
import AppNavbar from "./AppNavbar";
import EntryView from "./views/EntryView";
import InsertEntryView from "./views/InsertEntryView";
import CellCultureBuyerView from "./views/CellCultureBuyerView";
import DispatchNoteView from "./views/DispatchNoteView";
import DispatchNoteArticleView from "./views/DispatchNoteArticleView";
import OptionsView from "./views/OptionsView";
import Login from "./components/Login";
import LoginCallback from "./components/LoginCallback";
import MbeGroupProvider from "./MbeGroupProvider";
import MbeGroupView from "./views/MbeGroupView";
import NotFound from "./components/NotFound";
import AuthContextProvider from "./AuthProvider";
import ArticleMeasureTypeView from "./views/ArticleMeasureTypeView";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import axios from "axios";

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

export type Me = {
    id: number;
    email: string;
};

export const get_me = axios.get<Me>(import.meta.env.VITE_ME, {
    withCredentials: true,
});

const login_loader = async () => {
    try {
        await get_me;
        return redirect("/");
    } catch (e) {
        console.error(e);
        return null;
    }
};

const auth_check_loader = async () => {
    try {
        await get_me;
        return null;
    } catch (e) {
        console.error(e);
        return redirect("/login");
    }
};

const router = createBrowserRouter([
    { path: "/*", element: <NotFound /> },
    {
        path: "/logout",
        loader: async () => {
            // TODO: Rework auth context provider
            await axios.get("http://localhost:8000/logout", {
                withCredentials: true,
            });
            return redirect("/login");
        },
    },
    {
        path: "/login",
        loader: login_loader,
        element: <Login />,
    },
    {
        path: "/login-callback",
        loader: login_loader,
        element: <LoginCallback />,
    },
    {
        // TODO: Have AuthProvider or some other element that wraps and checks for valid authorization
        element: (
            <AuthContextProvider>
                <AppNavbar
                    children={
                        <MbeGroupProvider>
                            <DataGroupProvider>
                                <Outlet />
                            </DataGroupProvider>
                        </MbeGroupProvider>
                    }
                />
            </AuthContextProvider>
        ),
        loader: auth_check_loader,
        children: [
            { path: "/", element: <EntryView /> },
            { path: "/insert-entry", element: <InsertEntryView /> },
            {
                path: "insert-cell-culture-buyer",
                element: <CellCultureBuyerView />,
            },
            { path: "/article", element: <ArticleMeasureTypeView /> },
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
            { path: "/options-data-groups", element: <OptionsView /> },
            { path: "/options-mbe-groups", element: <MbeGroupView /> },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <MantineProvider>
                <Notifications limit={10} />
                <RouterProvider router={router} />
            </MantineProvider>
        </QueryClientProvider>
    </React.StrictMode>
);
