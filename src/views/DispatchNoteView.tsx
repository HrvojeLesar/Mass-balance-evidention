import { Grid } from "@mantine/core";
import { DataGroupSelectFlex } from "../components/DataGroupSelect";
import DispatchNoteTable from "../components/tables/DispatchNoteTable";

export default function DispatchNoteView() {
    return (
        <>
            <DataGroupSelectFlex />
            <Grid>
                <Grid.Col>
                    <DispatchNoteTable isInsertable={true} isEditable={true} />
                </Grid.Col>
            </Grid>
        </>
    );
}
