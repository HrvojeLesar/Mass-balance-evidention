import { Button, ButtonGroup } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";

type ActionButtonsProps = {
    editFn?: () => void;
    deleteFn?: () => void;
};

export default function ActionButtons({
    editFn,
    deleteFn,
}: ActionButtonsProps) {
    return (
        <ButtonGroup>
            <Button
                onClick={editFn}
                variant="warning"
                className="actions-button"
            >
                <FaEdit />
            </Button>
            <Button
                onClick={deleteFn}
                variant="danger"
                className="actions-button"
            >
                <FaTrash />
            </Button>
        </ButtonGroup>
    );
}
