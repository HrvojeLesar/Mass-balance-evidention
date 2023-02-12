import { Dispatch, SetStateAction } from "react";
import {
    ActionMeta,
    ControlProps,
    CSSObjectWithLabel,
    GroupBase,
    MultiValue,
    SingleValue,
} from "react-select";
import { Buyer, Cell, Culture, Exact } from "../../generated/graphql";

export const DEBOUNCE_TIME = 350;

export type FormProps<
    T,
    InsertMutation,
    InsertOptions,
    UpdateMutation extends unknown,
    UpdateOptions extends unknown
> = {
    edit?: T | undefined;
    onInsertSuccess?: (
        data: InsertMutation,
        variables: Exact<{ insertOptions: InsertOptions }>,
        context: unknown
    ) => unknown;
    onUpdateSuccess?: (
        data: UpdateMutation,
        variables: Exact<{ updateOptions: UpdateOptions }>,
        context: unknown
    ) => unknown;
};

export type SelectOption<T> = {
    value: T;
    label: string;
};

export type SelectState<T> = {
    selected: SelectOption<T> | undefined | null;
    limit: number;
    page: number;
    maxPage: number;
    pages: Record<number, T[]>;
    filter: string;
};

export const makeOptions = <T extends Cell | Culture | Buyer>(
    currentPage: number,
    pages: Record<number, T[]>
) => {
    const options: SelectOption<T>[] = [];
    for (let i = 0; i <= currentPage; i++) {
        const results: T[] | undefined = pages[i];
        if (results) {
            results.forEach((res) => {
                options.push({
                    value: res,
                    label: res.name ?? "",
                });
            });
        }
    }
    return options;
};

export const onChange = <
    T extends unknown,
    SO extends SelectOption<T>,
    SS extends SelectState<T>
>(
    value: SingleValue<SO> | MultiValue<SO>,
    actionMeta: ActionMeta<SO>,
    setSelectState: Dispatch<SetStateAction<SS>>
) => {
    if (
        actionMeta.action === "select-option" ||
        actionMeta.action === "clear"
    ) {
        setSelectState((old: SS) => ({
            ...old,
            filter: "",
            selected: value ?? undefined,
        }));
    }
};
export const selectStyle = (error: any) => {
    return {
        control: <T, TT extends boolean, TTT extends GroupBase<T>>(
            provided: CSSObjectWithLabel,
            state: ControlProps<T, TT, TTT>
        ) => {
            return {
                ...provided,
                border: error
                    ? state.isFocused
                        ? "1px solid #dc3545" // red
                        : "1px solid #dc3545" // red
                    : state.isFocused
                    ? "1px solid #86b7fe" // blue
                    : "1px solid #ced4da", // gray
                boxShadow: error
                    ? state.isFocused
                        ? "0 0 0 0.25rem rgb(220 53 69 / 25%)"
                        : "none"
                    : state.isFocused
                    ? "0 0 0 0.25rem rgb(13 110 253 / 25%)"
                    : "none",
                color: "#212529",
                backgroundColor: "#fff",
                borderColor: "#86b7fe",
                outline: 0,
                "&:hover": {},
            };
        },
    };
};
