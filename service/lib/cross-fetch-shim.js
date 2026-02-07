// Cloudflare Workers has native fetch/Headers/Request.
// Replace cross-fetch polyfill to avoid bundling issues.
export const fetch = globalThis.fetch;
export const Request = globalThis.Request;
export const Headers = globalThis.Headers;
export default globalThis.fetch;
