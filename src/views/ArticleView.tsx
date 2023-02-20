import { Grid } from "@mantine/core";
import { DataGroupSelectFlex } from "../components/DataGroupSelect";
import ArticleTable from "../components/tables/ArticleTable";

export default function ArticleView() {
    return (
        <>
            <DataGroupSelectFlex />
            <Grid>
                <Grid.Col>
                    <ArticleTable isInsertable={true} isEditable={true} />
                </Grid.Col>
            </Grid>
        </>
    );
}
