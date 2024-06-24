import { HttpMethod, GET, ContentType, HttpProviderResponse } from '../types/http';
import HttpProvider from '../types/HttpProvider';
import { toContentType, isBadRequest, isServerError } from '../utils/http';

export async function request<TResponse, TErrorResponse>(
  httpProvider: HttpProvider,
  url: string,
  headers: Record<string, string | string[]> = {},
  method: HttpMethod = GET,
  data?: object,
  contentType: ContentType = ContentType.json,
): Promise<HttpProviderResponse<TResponse, TErrorResponse>> {
  const { ok, statusCode, body } = await httpProvider({
    url,
    method,
    headers: !contentType
      ? headers
      : {
          ...headers,
          Accept: ContentType.json,
          'Content-Type': contentType as string,
        },
    data: contentType && data ? toContentType(contentType, data) : undefined,
  });

  if (!ok) {
    if (isBadRequest(statusCode)) {
      return {
        ok: false,
        statusCode,
        body: !body ? undefined : (body as TErrorResponse),
      };
    }

    if (isServerError(statusCode)) {
      throw 'Server error.';
    }

    throw new Error('Unknown response.');
  }

  return {
    ok: true,
    statusCode,
    body: body as TResponse,
  };
}
