/** Validates a login request and returns session data, or null for invalid credentials. */
export type AuthSimpleValidateLogin = (request: import('express').Request) => Promise<Record<string, unknown> | null>;

export interface AuthSimpleConfig {
  /** An object whose keys correspond to methods, and contents are events to listen for. */
  events?: Record<string, string[]>;
  /** The path to the login endpoint. */
  loginPath?: string;
  /** The path to the logout endpoint. */
  logoutPath?: string;
  /** The path to redirect to after logging in. */
  loginRedirectPath?: string;
  /** The path to redirect to after logging out. */
  logoutRedirectPath?: string;
  /** The middleware to use on the login route. */
  loginMiddleware?: import('express').RequestHandler[];
  /** The middleware to use on the logout route. */
  logoutMiddleware?: import('express').RequestHandler[];
  /** Validation function for the login request. */
  validateLogin: AuthSimpleValidateLogin;
}
