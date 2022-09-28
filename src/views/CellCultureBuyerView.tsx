import { Col, Row } from "react-bootstrap";
import BuyerTable from "../components/tables/BuyerTable";
import CellCulturePairTable from "../components/tables/CellCulturePairTable";
import CellTable from "../components/tables/CellTable";
import CultureTable from "../components/tables/CultureTable";

export default function CellCultureBuyerView() {
    return (
        <>
            <CellCulturePairTable />
            <Row className="my-4">
                <Col>
                    <CellTable />
                </Col>
                <Col>
                    <CultureTable />
                </Col>
            </Row>
            <BuyerTable />
        </>
    );
}
