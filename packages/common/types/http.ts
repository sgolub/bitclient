export const POST = 'POST';
export const GET = 'GET';
export const PUT = 'PUT';
export const DELETE = 'DELETE';

export type HttpMethod = typeof POST | typeof GET | typeof PUT | typeof DELETE;

export enum ContentType {
  json = 'application/json; charset=utf-8',
  x_www_form_urlencoded = 'application/x-www-form-urlencoded; charset=utf-8',
}

export type HttpProviderResponse<TSuccessResponse, TErrorResponse> =
  | {
      ok: true;
      statusCode: number;
      body: TSuccessResponse;
    }
  | {
      ok: false;
      statusCode: number;
      body?: TErrorResponse;
    };
