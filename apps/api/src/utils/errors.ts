export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const Errors = {
  badRequest: (message = "Requête invalide") => new AppError(400, "BAD_REQUEST", message),
  unauthorized: (message = "Non authentifié") => new AppError(401, "UNAUTHORIZED", message),
  forbidden: (message = "Non autorisé pour cette ressource") => new AppError(403, "FORBIDDEN", message),
  notFound: (message = "Ressource introuvable") => new AppError(404, "NOT_FOUND", message),
  conflict: (message = "Conflit") => new AppError(409, "CONFLICT", message),
  tooManyRequests: (message = "Trop de requêtes") => new AppError(429, "TOO_MANY_REQUESTS", message),
};
