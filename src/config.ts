// Note: If using SSR, must distinguish between connections to other docker container and front -> backend

export const BACKEND_HOST = ENV.BACKEND_HOST
export const BACKEND_HOST_TESTNET = ENV.BACKEND_HOST_TESTNET
export const GRAPHQL_HOST = ENV.GRAPHQL_HOST + "/v1/graphql"
export const GRAPHQL_HOST_TESTNET = ENV.GRAPHQL_HOST_TESTNET + "/v1/graphql"
