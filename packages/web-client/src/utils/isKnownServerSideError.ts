const isKnownServerSideError = (
  error: unknown,
): error is { data: { error: string } } =>
  typeof error === "object" &&
  error !== null &&
  "data" in error &&
  typeof error.data === "object" &&
  error.data !== null &&
  "error" in error.data;

export default isKnownServerSideError;
