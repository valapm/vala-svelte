// Note: If using SSR, must distinguish between connections to other docker container and front -> backend

export const BACKEND_HOST = ENV.BACKEND_HOST
export const BACKEND_HOST_TESTNET = ENV.BACKEND_HOST_TESTNET
export const GRAPHQL_HOST = ENV.GRAPHQL_HOST + "/v1/graphql"
export const GRAPHQL_HOST_TESTNET = ENV.GRAPHQL_HOST_TESTNET + "/v1/graphql"
export const AUTH_HOST = ENV.AUTH_HOST
export const MAUTIC_HOST = ENV.MAUTIC_HOST

export const testnet =
  window.location.host.split(".")[0] === "test" || window.location.pathname.split("/")[1] === "test"
export const backendHost = testnet ? BACKEND_HOST_TESTNET : BACKEND_HOST
export const graphqlHost = testnet ? GRAPHQL_HOST_TESTNET : GRAPHQL_HOST

export const feeb = testnet ? 1 : 0.5
