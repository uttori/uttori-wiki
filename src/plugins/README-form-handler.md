# Form Handler Plugin

A flexible form handling plugin for Uttori Wiki that allows you to easily define multiple forms through configuration objects and handle submissions with configurable handlers.

## Features

- **Multiple Form Support**: Define multiple forms with different configurations
- **Flexible Field Types**: Support for text, email, textarea, number, url, and custom validation
- **Configurable Handlers**: Default console logging, email sending, Google Sheets integration
- **JSON and Form Data**: Accepts both JSON and form-encoded data
- **Validation**: Built-in validation with custom regex support
- **Middleware Support**: Add custom middleware for authentication, rate limiting, etc.
- **Error Handling**: Comprehensive error handling and validation

## Installation

The plugin is included with Uttori Wiki. No additional installation required.

## Configuration

Add the plugin to your Uttori Wiki configuration:

```javascript
import FormHandler from './src/plugins/form-handler.js';
import EmailHandler from './src/plugins/form-handlers/email-handler.js';
import GoogleDocsHandler from './src/plugins/form-handlers/google-docs-handler.js';

const config = {
  // ... other config
  plugins: [
    FormHandler,
    // ... other plugins
  ],
  'uttori-plugin-form-handler': {
    baseRoute: '/forms', // Optional: base route for all forms
    forms: [
      {
        name: 'contact',
        route: '/contact',
        fields: [
          {
            name: 'name',
            type: 'text',
            required: true,
            label: 'Full Name',
            placeholder: 'Enter your full name'
          },
          {
            name: 'email',
            type: 'email',
            required: true,
            label: 'Email Address',
            placeholder: 'Enter your email address'
          },
          {
            name: 'message',
            type: 'textarea',
            required: true,
            label: 'Message',
            placeholder: 'Enter your message'
          }
        ],
        handler: EmailHandler.create({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          user: 'your-email@gmail.com',
          pass: 'your-app-password',
          from: 'your-email@gmail.com',
          to: 'contact@yoursite.com',
          subject: 'Contact Form Submission from {name}',
          template: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Message:</strong></p>
            <p>{message}</p>
            <hr>
            <p><em>Submitted at: {timestamp}</em></p>
          `
        }),
        successMessage: 'Thank you for your message! We will get back to you soon.',
        errorMessage: 'There was an error submitting your message. Please try again.'
      }
    ]
  }
};
```

## Form Configuration

### Form Object Properties

- **name** (string, required): Unique identifier for the form
- **route** (string, required): URL route for form submission (relative to baseRoute)
- **fields** (array, required): Array of field configurations
- **handler** (function, optional): Custom handler function for form processing
- **successMessage** (string, optional): Success message to return
- **errorMessage** (string, optional): Error message to return
- **middleware** (array, optional): Custom Express middleware for the form route

### Field Object Properties

- **name** (string, required): Field name (used as form data key)
- **type** (string, required): Field type (text, email, textarea, number, url)
- **required** (boolean, optional): Whether the field is required
- **label** (string, optional): Display label for the field
- **placeholder** (string, optional): Placeholder text for the field
- **validation** (string, optional): Custom regex validation pattern
- **errorMessage** (string, optional): Custom error message for validation

## Built-in Handlers

### Default Handler (Console Logging)

If no custom handler is provided, the form data will be logged to the console:

```javascript
{
  name: 'feedback',
  route: '/feedback',
  fields: [
    { name: 'rating', type: 'number', required: true },
    { name: 'comment', type: 'textarea', required: false }
  ]
  // No handler - uses default console.log
}
```

### Email Handler

Send form submissions via email using nodemailer:

```javascript
import EmailHandler from './src/plugins/form-handlers/email-handler.js';

// In your form configuration
handler: EmailHandler.create({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  user: 'your-email@gmail.com',
  pass: 'your-app-password',
  from: 'your-email@gmail.com',
  to: 'contact@yoursite.com',
  subject: 'Contact Form Submission from {name}',
  template: `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> {name}</p>
    <p><strong>Email:</strong> {email}</p>
    <p><strong>Message:</strong></p>
    <p>{message}</p>
  `
})
```

#### Email Handler Configuration

- **host** (string, required): SMTP host
- **port** (number, required): SMTP port
- **secure** (boolean, optional): Whether to use SSL/TLS
- **user** (string, required): SMTP username
- **pass** (string, required): SMTP password
- **from** (string, required): Email address to send from
- **to** (string, required): Email address to send to
- **subject** (string, required): Email subject template
- **template** (string, optional): Email body HTML template

#### Email Template Variables

- `{formName}`: The form name
- `{timestamp}`: Current timestamp
- `{fieldName}`: Any form field value (replace `fieldName` with actual field name)

### Google Sheets Handler

Write form submissions to Google Sheets:

```javascript
import GoogleDocsHandler from './src/plugins/form-handlers/google-docs-handler.js';

// In your form configuration
handler: GoogleDocsHandler.create({
  credentialsPath: './google-credentials.json',
  spreadsheetId: 'your-spreadsheet-id',
  sheetName: 'Form Submissions',
  headers: ['name', 'email', 'message'],
  appendTimestamp: true
})
```

#### Google Sheets Handler Configuration

- **credentialsPath** (string, required): Path to Google service account credentials JSON file
- **spreadsheetId** (string, required): Google Sheets spreadsheet ID
- **sheetName** (string, required): Name of the sheet to write to
- **headers** (array, optional): Custom headers for the spreadsheet
- **appendTimestamp** (boolean, optional): Whether to append timestamp to each row

#### Setting up Google Sheets

1. Create a Google Cloud Project and enable the Google Sheets API
2. Create a service account and download the credentials JSON file
3. Share your Google Sheet with the service account email
4. Use `GoogleDocsHandler.setupHeaders(config)` to initialize the sheet headers

## Custom Handlers

You can create custom handlers by providing a function that accepts form data, form config, request, and response:

```javascript
{
  name: 'custom-form',
  route: '/custom',
  fields: [
    { name: 'data', type: 'text', required: true }
  ],
  handler: async (formData, formConfig, req, res) => {
    // Custom processing logic
    console.log('Custom handler processing:', formData);
    
    // Save to database, send to API, etc.
    await saveToDatabase(formData);
    
    return {
      message: 'Data processed successfully',
      id: 'some-id'
    };
  }
}
```

## API Endpoints

Forms are accessible at: `{baseRoute}{formRoute}`

For example, with `baseRoute: '/forms'` and form `route: '/contact'`:
- POST `/forms/contact`

## Request/Response Format

### Request

Accepts both JSON and form-encoded data:

```javascript
// JSON
fetch('/forms/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello world!'
  })
});

// Form data
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('email', 'john@example.com');
formData.append('message', 'Hello world!');

fetch('/forms/contact', {
  method: 'POST',
  body: formData
});
```

### Response

```javascript
// Success
{
  "success": true,
  "message": "Thank you for your message! We will get back to you soon.",
  "data": {
    "messageId": "email-message-id",
    "message": "Email sent successfully"
  }
}

// Error
{
  "success": false,
  "message": "There was an error submitting your message. Please try again.",
  "errors": [
    "Field \"email\" must be a valid email address"
  ]
}
```

## Validation

The plugin provides built-in validation for:

- **Required fields**: Checks if required fields are present and not empty
- **Email format**: Validates email addresses using regex
- **Number format**: Validates numeric values
- **URL format**: Validates URLs
- **Custom regex**: Supports custom validation patterns

## Middleware Support

Add custom middleware for authentication, rate limiting, etc.:

```javascript
{
  name: 'admin-form',
  route: '/admin/feedback',
  fields: [
    { name: 'feedback', type: 'textarea', required: true }
  ],
  middleware: [
    // Authentication middleware
    (req, res, next) => {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      next();
    },
    // Rate limiting middleware
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5 // limit each IP to 5 requests per windowMs
    })
  ],
  handler: customHandler
}
```

## Examples

See `form-handler-examples.js` for comprehensive examples including:

- Contact form with email handler
- Newsletter signup with Google Sheets
- Feedback form with console logging
- Multi-form configuration
- Authenticated forms with middleware
- Complete website configuration

## Error Handling

The plugin handles various error scenarios:

- **Validation errors**: Returns 400 with validation details
- **Handler errors**: Returns 500 with error message
- **Configuration errors**: Throws during plugin registration
- **Missing fields**: Validates required fields
- **Invalid data types**: Validates field types and formats

## Dependencies

- **nodemailer**: For email handler (install with `npm install nodemailer`)
- **googleapis**: For Google Sheets handler (install with `npm install googleapis`)

## Security Considerations

- Validate all input data
- Use HTTPS in production
- Implement rate limiting for public forms
- Sanitize email templates to prevent injection
- Secure Google credentials file
- Use environment variables for sensitive configuration

## Troubleshooting

### Common Issues

1. **Form not found**: Check that the form name and route are correctly configured
2. **Validation errors**: Ensure field names match between form and submission data
3. **Email not sending**: Verify SMTP credentials and settings
4. **Google Sheets not updating**: Check credentials file path and spreadsheet permissions
5. **Middleware errors**: Ensure middleware functions are properly defined

### Debug Mode

Enable debug logging by setting the debug environment variable:

```bash
DEBUG=Uttori.Plugin.FormHandler npm start
```

This will provide detailed logging for form processing, validation, and handler execution.
