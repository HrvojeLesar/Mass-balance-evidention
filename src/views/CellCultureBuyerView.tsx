import { Grid } from "@mantine/core";
import { DataGroupSelectFlex } from "../components/DataGroupSelect";
import BuyerTable from "../components/tables/BuyerTable";
import CellCulturePairTable from "../components/tables/CellCulturePairTable";
import CellTable from "../components/tables/CellTable";
import CultureTable from "../components/tables/CultureTable";

export default function CellCultureBuyerView() {
    return (
        <>
            <DataGroupSelectFlex />
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
        </>
    );
}
