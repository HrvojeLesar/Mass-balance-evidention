import { Box, Flex, Grid } from "@mantine/core";
import { useContext } from "react";
import { DataGroupSelectFlex } from "../components/DataGroupSelect";
import NotSelectedOverlay from "../components/NotSelectedOverlay";
import BuyerTable from "../components/tables/BuyerTable";
import CellCulturePairTable from "../components/tables/CellCulturePairTable";
import CellTable from "../components/tables/CellTable";
import CultureTable from "../components/tables/CultureTable";
import { DataGroupContext } from "../DataGroupProvider";

export default function CellCultureBuyerView() {
    const { selectedGroup: dataGroupId } = useContext(DataGroupContext);

    return (
        <Flex direction="column">
            <DataGroupSelectFlex />
            <Box pos="relative">
                <NotSelectedOverlay dataGroupId={dataGroupId} />
                <Grid>
                    <Grid.Col>
                        <CellCulturePairTable
                            isInsertable={true}
                            isEditable={true}
                        />
                    </Grid.Col>
                    <Grid.Col sm={12} md={6} lg={6}>
                        <CellTable isInsertable={true} isEditable={true} />
                    </Grid.Col>
                    <Grid.Col sm={12} md={6} lg={6}>
                        <CultureTable isInsertable={true} isEditable={true} />
                    </Grid.Col>
                    <Grid.Col>
                        <BuyerTable isInsertable={true} isEditable={true} />
                    </Grid.Col>
                </Grid>
            </Box>
        </Flex>
    );
}
