import { useContext, useMemo } from "react";
import { Form } from "react-bootstrap";
import { DataGroupContext } from "../DataGroupProvider";

export default function DataGroupSelect() {
    const value = useContext(DataGroupContext);
    const isGroupsEmpty = useMemo(() => value.groups.length === 0, [value]);
    return (
        <Form.Select
            value={value.selectedGroup}
            disabled={value.isLoading || isGroupsEmpty}
            onChange={(e) => {
                if (value.selectGroup) {
                    value.selectGroup(Number(e.target.value));
                }
            }}
        >
            {value.isLoading ? (
                <option>Loading</option>
            ) : isGroupsEmpty ? (
                <option>No Groups</option>
            ) : (
                value.groups.map((group) => {
                    return (
                        <option key={group.id} value={group.id}>
                            {group.name}
                        </option>
                    );
                })
            )}
        </Form.Select>
    );
}
