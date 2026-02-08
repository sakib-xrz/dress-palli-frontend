export type ApiErrorResponse = {
  success: false;
  statusCode: number;
  message: string;
  errors: unknown[];
  timestamp: string;
};
