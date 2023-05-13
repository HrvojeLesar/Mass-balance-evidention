import { Grid } from "@mantine/core";
import WeightTypeForm from "./forms/WeightTypeForm";
import WeightTypeTable from "./tables/WeightTypeTable";
import CardUtil from "./util/CardUtil";

export default function WeightTypes() {
    return (
        <Grid>
            <Grid.Col>
                <CardUtil>
                    <WeightTypeForm />
                    <WeightTypeTable />
                </CardUtil>
            </Grid.Col>
        </Grid>
    );
}
