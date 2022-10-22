import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import AppNavbar from "./AppNavbar";
import CellCultureBuyerView from "./views/CellCultureBuyerView";
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
                    <Route path="/insert-cell-culture-buyer" element={<CellCultureBuyerView />} />
                    <Route path="/options" element={<OptionsView />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
