export interface EmailHandlerConfig {
  /** Nodemailer transport options. */
  transportOptions: import('nodemailer').TransportOptions;
  /** Email address to send from. */
  from: string;
  /** Email address to send to. */
  to: string;
  /** Email subject template. */
  subject: string;
  /** Email body template (optional). */
  template?: string;
}
