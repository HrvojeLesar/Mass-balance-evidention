import { Box, Flex, Grid } from "@mantine/core";
import { useContext } from "react";
import NotSelectedOverlay from "../components/NotSelectedOverlay";
import { DataGroupSelectFlex } from "../components/DataGroupSelect";
import ArticleTable from "../components/tables/ArticleTable";
import WeightTypeTable from "../components/tables/WeightTypeTable";
import { DataGroupContext } from "../DataGroupProvider";

export default function ArticleMeasureTypeView() {
    const { selectedGroup: dataGroupId } = useContext(DataGroupContext);

    return (
        <Flex direction="column">
            <DataGroupSelectFlex />
            <Box pos="relative">
                <NotSelectedOverlay dataGroupId={dataGroupId} />
                <Grid>
                    <Grid.Col sm={12} md={6} lg={6}>
                        <ArticleTable isInsertable={true} isEditable={true} />
                    </Grid.Col>
                    <Grid.Col sm={12} md={6} lg={6}>
                        <WeightTypeTable
                            isInsertable={true}
                            isEditable={true}
                        />
                    </Grid.Col>
                </Grid>
            </Box>
        </Flex>
    );
}
