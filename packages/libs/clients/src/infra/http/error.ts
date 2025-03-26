export class HttpError extends Error {
  constructor(response: Response, responseBody: string) {
    const status = response.status.toString(10);
    const statusText = response.statusText;
    // const body = JSON.stringify(responseBody);
    super(`HTTP error ${status} ${statusText} ${responseBody}`);
  }
}
