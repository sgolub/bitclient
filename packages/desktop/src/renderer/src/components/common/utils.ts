export function toErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return normalizeErrorMessage(error);
  } else if (error instanceof Error) {
    return normalizeErrorMessage(error.message);
  } else {
    return 'An unknown error occurred';
  }
}

function normalizeErrorMessage(message: string): string {
  return message.replace(/^.*Error:\s/, '');
}
