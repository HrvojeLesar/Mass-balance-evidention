import { Grid } from "@mantine/core";
import { DataGroupSelectFlex } from "../components/DataGroupSelect";
import ArticleTable from "../components/tables/ArticleTable";
import WeightTypeTable from "../components/tables/WeightTypeTable";

export default function ArticleMeasureTypeView() {
    return (
        <>
            <DataGroupSelectFlex />
            <Grid>
                <Grid.Col sm={12} md={6} lg={6}>
                    <ArticleTable isInsertable={true} isEditable={true} />
                </Grid.Col>
                <Grid.Col sm={12} md={6} lg={6}>
                    <WeightTypeTable isInsertable={true} isEditable={true} />
                </Grid.Col>
            </Grid>
        </>
    );
}
