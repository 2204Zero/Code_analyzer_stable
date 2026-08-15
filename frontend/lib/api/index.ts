import { mockApi } from './mock-api';
import { realApi } from './real-api';

const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

console.log("USE_MOCK_API =", process.env.NEXT_PUBLIC_USE_MOCK_API);
console.log("API MODE =", useMockApi ? "mock" : "real");

export const api = useMockApi ? mockApi : realApi;

export * from './types';
