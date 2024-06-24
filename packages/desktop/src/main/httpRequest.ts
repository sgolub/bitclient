import { net } from 'electron';
import HttpProvider from '@bitclient/common/types/HttpProvider';
import { HttpRequestIPC, HttpResponseIPC } from '@desktop/desktop-types';

const httpRequest: HttpProvider = async function ({
  url,
  headers = {},
  method = 'GET',
  data,
}: HttpRequestIPC): Promise<HttpResponseIPC> {
  return new Promise((resolve, reject) => {
    const request = net.request({
      url,
      method,
      headers,
    });

    request.on('response', (response) => {
      const jsonBody =
        response.headers['content-type'] !== undefined &&
        response.headers['content-type'].includes('application/json');
      const hasBody =
        jsonBody ||
        (response.headers['content-length'] !== undefined &&
          Number(response.headers['content-length']) > 0);
      if (hasBody) {
        let responseBody = '';
        response.on('data', function (chunk) {
          responseBody += chunk;
        });
        response.on('end', function () {
          resolve({
            ok: !!response.statusCode && response.statusCode >= 200 && response.statusCode < 300,
            statusCode: response.statusCode,
            body: jsonBody ? JSON.parse(responseBody) : responseBody,
          });
        });
      } else {
        resolve({
          ok: !!response.statusCode && response.statusCode >= 200 && response.statusCode < 300,
          statusCode: response.statusCode,
        });
      }
    });

    request.on('error', (e: Error) => reject(e));

    if (data) {
      request.write(data);
    }

    request.end();
  });
};

export default httpRequest;
