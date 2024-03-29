import { MantineTheme } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
import { ActionMeta, MultiValue, SingleValue } from "react-select";
import {
    Article,
    Buyer,
    Cell,
    Culture,
    Exact,
    WeightType,
} from "../../generated/graphql";

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

export const makeOptions = <T extends Cell | Culture | Buyer | Article>(
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

// WARN: very dirty way of doing this
// TODO: REMOVE THIS garbage
export const makeOptionsDirty = <T extends WeightType>(
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
                    label: `${res.unit} (${res.unitShort})`,
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
export const selectStyle = (error: any, theme: MantineTheme) => {
    return {
        control: (provided: any, state: any) => {
            return {
                ...provided,
                borderStyle: "solid",
                borderWidth: "1px",
                borderColor: error
                    ? state.isFocused
                        ? theme.colors.blue[6]
                        : theme.colors.red[5]
                    : state.isFocused
                    ? theme.colors.blue[6]
                    : theme.colors.gray[4],
                boxShadow: "none",
                outline: 0,
                "&:hover": {},
            };
        },
        placeholder: (provided: any) => {
            return {
                ...provided,
                color: error ? theme.colors.red[5] : theme.colors.gray[5],
            };
        },
        menuPortal: (provided: any) => {
            return {
                ...provided,
                zIndex: 9999,
                fontFamily:
                    "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji",
            };
        },
    };
};
