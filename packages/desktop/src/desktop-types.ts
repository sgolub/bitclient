export type HttpRequestIPC = {
  url: string;
  method: string;
  headers: Record<string, string | string[]>;
  data?: string;
};

export type HttpResponseIPC = {
  ok: boolean;
  statusCode: number;
  body?: string | object;
};
