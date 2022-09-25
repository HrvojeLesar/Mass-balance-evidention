import { Dispatch, SetStateAction } from "react";
import { ActionMeta, SingleValue } from "react-select";
import { Buyer, Cell, Culture, Exact } from "../../generated/graphql";

export const DEBOUNCE_TIME = 350;

export type FormSuccessCallback<InsertMutation, InsertOptions> = {
    onSuccess: (
        data: InsertMutation,
        variables: Exact<{ insertOptions: InsertOptions }>,
        context: unknown
    ) => unknown;
}

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

export const makeOptions =
    <T extends Cell | Culture | Buyer>(
        currentPage: number,
        pages: Record<number, T[]>
    ) => {
        const options: SelectOption<T>[] = [];
        for (let i = 0; i <= currentPage; i++) {
            const results: T[] | undefined = pages[i];
            if (results) {
                results.map((res) => {
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
    value: SingleValue<SO>,
    actionMeta: ActionMeta<SO>,
    setSelectState: Dispatch<SetStateAction<SS>>
) => {
    if (actionMeta.action === "select-option" || actionMeta.action === "clear") {
        setSelectState((old: SS) => ({
            ...old,
            filter: "",
            selected: value ?? undefined,
        }));
    }
};

