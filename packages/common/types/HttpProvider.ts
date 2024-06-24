import { HttpMethod } from './http.js';
import Provider from './Provider.js';

interface HttpProvider extends Provider {
  (params: {
    url: string;
    method: HttpMethod;
    headers: Record<string, string | string[]>;
    data?: string;
  }):
    | { ok: boolean; statusCode: number; body?: string | object }
    | PromiseLike<{ ok: boolean; statusCode: number; body?: string | object }>;
}

export default HttpProvider;
