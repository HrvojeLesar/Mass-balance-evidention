import { DataGroupSelectFlex } from "../components/DataGroupSelect";
import EntryTable from "../components/tables/EntryTable";

export default function InsertEntryView() {
    return (
        <>
            <DataGroupSelectFlex />
            <EntryTable isInsertable={true} isEditable={true} />
        </>
    );
}
