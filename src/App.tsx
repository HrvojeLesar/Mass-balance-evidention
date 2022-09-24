import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Button } from "react-bootstrap";
import BuyerTable from "./components/tables/BuyerTable";
import CellTable from "./components/tables/CellTable";
import CultureTable from "./components/tables/CultureTable";
import CellCulturePairTable from "./components/tables/CellCulturePairTable";
import EntryTable from "./components/tables/EntryTable";

function App() {
    const [greetMsg, setGreetMsg] = useState("");
    const [name, setName] = useState("");

    async function greet() {
        setGreetMsg(await invoke("greet", { name }));
    }

    return (
        <div className="container">
            <h1>Welcome to Tauri!</h1>

            <p>Click on the Tauri, Vite, and React logos to learn more.</p>

            <div className="row">
                <div>
                    <input
                        id="greet-input"
                        onChange={(e) => setName(e.currentTarget.value)}
                        placeholder="Enter a name..."
                    />
                    <button type="button" onClick={() => greet()}>
                        Greet
                    </button>
                    <Button variant="primary" onClick={() => greet()}>Greet</Button>
                </div>
            </div>
            <p>{greetMsg}</p>
            <BuyerTable />
            <CellTable />
            <CultureTable />
            <CellCulturePairTable />
            <EntryTable />
        </div>
    );
}

export default App;
