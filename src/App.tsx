import {
    BrowserRouter,
    Outlet,
    redirect,
    Route,
    Routes,
} from "react-router-dom";
import AppNavbar from "./AppNavbar";
import ArticleView from "./views/ArticleView";
import CellCultureBuyerView from "./views/CellCultureBuyerView";
import DispatchNoteArticleView from "./views/DispatchNoteArticleView";
import DispatchNoteView from "./views/DispatchNoteView";
import EntryView from "./views/EntryView";
import InsertEntryView from "./views/InsertEntryView";
import OptionsView from "./views/OptionsView";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppNavbar children={<Outlet />} />}>
                    <Route path="/" element={<EntryView />} />
                    <Route path="/insert-entry" element={<InsertEntryView />} />
                    <Route
                        path="/insert-cell-culture-buyer"
                        element={<CellCultureBuyerView />}
                    />
                    <Route path="/article" element={<ArticleView />} />
                    <Route
                        path="/dispatch-note"
                        element={<DispatchNoteView />}
                    />
                    <Route
                        path="/dispatch-note/:dispatchNoteId"
                        element={<DispatchNoteArticleView />}
                    />
                    <Route path="/options" element={<OptionsView />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
