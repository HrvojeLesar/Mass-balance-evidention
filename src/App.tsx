import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import AppNavbar from "./AppNavbar";
import CellCultureBuyerView from "./views/CellCultureBuyerView";
import EntryView from "./views/EntryView";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppNavbar children={<Outlet />} />}>
                    <Route path="/" element={<EntryView />} />
                    <Route path="/insert-entry" element={<EntryView />} />
                    <Route path="/insert-cell-culture-buyer" element={<CellCultureBuyerView />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
