/** Validates a single form field value. */
export type FormFieldValidationFunction = (value: string) => boolean;

export interface FormField {
  /** The field name. */
  name: string;
  /** The field type (text, email, textarea, etc.). */
  type: string;
  /** Whether the field is required. */
  required: boolean;
  /** The field label for display. */
  label?: string;
  /** The field placeholder text. */
  placeholder?: string;
  /** Custom validation function. */
  validation?: FormFieldValidationFunction;
  /** Custom error message for validation. */
  errorMessage?: string;
}

export interface FormConfig {
  /** The form name/identifier. */
  name: string;
  /** The route path for the form submission. */
  route: string;
  /** The form fields configuration. */
  fields: FormField[];
  /** Custom handler function for form submission. */
  handler?: FormHandlerFunction;
  /** Success message to return. */
  successMessage: string;
  /** Error message to return. */
  errorMessage: string;
  /** Custom middleware for the form route. */
  middleware?: import('express').RequestHandler[];
}

export interface FormHandlerConfig {
  /** Events to bind to. */
  events?: Record<string, string[]>;
  /** Array of form configurations. */
  forms: FormConfig[];
  /** Base route prefix for all forms. */
  baseRoute?: string;
  /** Default handler function for forms without custom handlers. */
  defaultHandler?: FormHandlerFunction;
}

/** Handles a validated form submission. */
export type FormHandlerFunction = (formData: Record<string, unknown>, formConfig: FormConfig, req: import('express').Request, res: import('express').Response) => Promise<FormHandlerResult>;

export interface FormHandlerResult {
  /** Whether the form submission was successful. */
  success: boolean;
  /** The result message. */
  message?: string;
}

export interface FormHandlerValidationResult {
  /** Whether the form data is valid. */
  valid: boolean;
  /** The validation errors. */
  errors: string[];
}
