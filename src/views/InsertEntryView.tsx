import { Box, Flex } from "@mantine/core";
import { useContext } from "react";
import { DataGroupSelectFlex } from "../components/DataGroupSelect";
import NotSelectedOverlay from "../components/NotSelectedOverlay";
import EntryTable from "../components/tables/EntryTable";
import { DataGroupContext } from "../DataGroupProvider";

export default function InsertEntryView() {
    const { selectedGroup: dataGroupId } = useContext(DataGroupContext);

    return (
        <Flex direction="column">
            <DataGroupSelectFlex />
            <Box pos="relative">
                <NotSelectedOverlay dataGroupId={dataGroupId} />
                <EntryTable isInsertable={true} isEditable={true} />
            </Box>
        </Flex>
    );
}
