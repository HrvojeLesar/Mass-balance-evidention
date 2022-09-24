import { Exact } from "../../generated/graphql";

export type FormSuccessCallback<InsertMutation, InsertOptions> = {
    onSuccess: (
        data: InsertMutation,
        variables: Exact<{ insertOptions: InsertOptions }>,
        context: unknown
    ) => unknown;
}
