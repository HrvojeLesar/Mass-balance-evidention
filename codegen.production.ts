import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    schema: "./schema.gql",
    documents: ["gql/*{gql,graphql}"],
    generates: {
        "src/generated/graphql.ts": {
            plugins: [
                "typescript",
                "typescript-operations",
                "typescript-react-query",
            ],
            config: {
                dedupeFragments: true,
                fetcher: {
                    endpoint: "https://mbe-api.hrveklesarov.com/graphiql",
                    fetchParams: {
                        credentials: "include",
                    },
                },
            },
        },
    },
};

export default config;
