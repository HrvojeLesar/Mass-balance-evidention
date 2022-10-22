import { HTMLProps, useEffect, useRef } from "react";
import { Form } from "react-bootstrap";

export default function TableCheckbox({
    indeterminate,
    checked,
    onChange,
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
    const ref = useRef<HTMLInputElement>(null!);

    useEffect(() => {
        if (typeof indeterminate === "boolean") {
            ref.current.indeterminate = !checked && indeterminate;
        }
    }, [ref, indeterminate]);

    return <Form.Check ref={ref} checked={checked} onChange={onChange} />;
}
