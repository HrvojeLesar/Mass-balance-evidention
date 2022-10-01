import { Col, Row } from "react-bootstrap";
import BuyerTable from "../components/tables/BuyerTable";
import CellCulturePairTable from "../components/tables/CellCulturePairTable";
import CellTable from "../components/tables/CellTable";
import CultureTable from "../components/tables/CultureTable";

export default function CellCultureBuyerView() {
    return (
        <>
            <CellCulturePairTable isInsertable={true} isEditable={true} />
            <Row className="my-4">
                <Col>
                    <CellTable isInsertable={true} isEditable={true} />
                </Col>
                <Col>
                    <CultureTable isInsertable={true} isEditable={true} />
                </Col>
            </Row>
            <BuyerTable isInsertable={true} isEditable={true} />
        </>
    );
}
