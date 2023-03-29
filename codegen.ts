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
                    endpoint: "http://localhost:8000/graphiql",
                    fetchParams: {
                        credentials: "include",
                    },
                },
            },
        },
    },
};

export default config;
