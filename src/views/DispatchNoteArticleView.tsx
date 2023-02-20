import { Grid } from "@mantine/core";
import { useLoaderData } from "react-router-dom";
import { DataGroupSelectFlex } from "../components/DataGroupSelect";
import DispatchNoteArticleTable from "../components/tables/DispatchNoteArticleTable";

export default function DispatchNoteArticleView() {
    const dispatchNoteId = useLoaderData() as number;

    return (
        <>
            <DataGroupSelectFlex />
            <Grid>
                <Grid.Col>
                    <DispatchNoteArticleTable
                        dispatchNoteId={dispatchNoteId}
                        isInsertable={true}
                        isEditable={true}
                    />
                </Grid.Col>
            </Grid>
        </>
    );
}
