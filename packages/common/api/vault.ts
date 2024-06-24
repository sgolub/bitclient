import { SyncResponse } from '../types/vault';
import { ErrorResponse } from '../types/auth';
import { GET } from '../types/http';
import HttpProvider from '../types/HttpProvider';
import { getURL } from '../utils/http';
import { request } from './request';

async function sync(
  http: HttpProvider,
  { baseUrl, headers = {} }: { baseUrl: string; headers: Record<string, string | string[]> },
  { bearerToken }: { bearerToken: string },
): Promise<SyncResponse> {
  const response = await request<SyncResponse, ErrorResponse>(
    http,
    getURL(baseUrl, '/api/sync?excludeDomains=true'),
    {
      Authorization: `Bearer ${bearerToken}`,
      ...headers,
    },
    GET,
  );

  if (response.ok) {
    return response.body;
  } else if (response.statusCode && response.statusCode >= 400) {
    throw response.body?.ErrorModel.Message;
  } else {
    throw 'Request error.';
  }
}

export default { sync };
