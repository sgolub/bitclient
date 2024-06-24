import { ContentType } from '../types/http';

export function isBadRequest(statusCode?: number) {
  return statusCode && statusCode >= 400 && statusCode < 500;
}

export function isNotFound(statusCode?: number) {
  return statusCode && statusCode === 404;
}

export function isServerError(statusCode?: number) {
  return statusCode && statusCode >= 500;
}

export function toContentType(contentType: ContentType, data: object) {
  switch (contentType) {
    case ContentType.json:
      return JSON.stringify(data);
    case ContentType.x_www_form_urlencoded:
      return new URLSearchParams(Object.entries(data)).toString();
    default:
      throw `Unsupported content type value: ${contentType}`;
  }
}

export function getURL(server: string, path: string) {
  let domain = server;
  const { href } = new URL(path, domain);
  return href;
}

export function parseAccessToken(accessToken: string) {
  const parts = accessToken.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid access token.');
  }
  const data = JSON.parse(atob(parts[1]));
  return data;
}
