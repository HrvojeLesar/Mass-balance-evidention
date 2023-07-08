import { Box, Flex, Grid } from "@mantine/core";
import { useContext } from "react";
import { DataGroupSelectFlex } from "../components/DataGroupSelect";
import NotSelectedOverlay from "../components/NotSelectedOverlay";
import DispatchNoteTable from "../components/tables/DispatchNoteTable";
import { DataGroupContext } from "../DataGroupProvider";

export default function DispatchNoteView() {
    const { selectedGroup: dataGroupId } = useContext(DataGroupContext);

    return (
        <Flex direction="column">
            <DataGroupSelectFlex />
            <Box pos="relative">
                <NotSelectedOverlay dataGroupId={dataGroupId} />
                <Grid>
                    <Grid.Col>
                        <DispatchNoteTable
                            isInsertable={true}
                            isEditable={true}
                        />
                    </Grid.Col>
                </Grid>
            </Box>
        </Flex>
    );
}
