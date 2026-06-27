# Form Handler (+ Email & Google Sheets)

> Define forms in config; validate submissions and route them to email, Google Sheets, or your own handler.

```javascript
import { FormHandler, EmailHandler, GoogleDocsHandler } from '@uttori/wiki';
```

**configKey:** `uttori-plugin-form-handler`

## What it does

Registers POST endpoints for one or more forms you define entirely in config. It validates required fields and basic types (email, number, URL), runs optional per-field custom validators, then hands the data to a per-form `handler` (or a global `defaultHandler`). Responses come back as JSON with your configured success/error messages. Two handlers ship in the box:

- **EmailHandler** - emails each submission via [Nodemailer](https://nodemailer.com/), with `{field}` placeholders in subject/body.
- **GoogleDocsHandler** - appends each submission as a row to a Google Sheet via a service account.

Both are **factories**, not standalone plugins: you call `.create(...)` and use the result as a form's `handler`.

## What it doesn't do

- **It doesn't render HTML forms** - you build the frontend; this handles the POST.
- **No CSRF / CAPTCHA / spam protection built in** - add [CSRF](csrf.md) and your own middleware.
- **No default `events`** - wire `bindRoutes`.
- **The outer response always reports success** with your `successMessage`; a handler's own `{ success: false }` lands in the `data` field rather than flipping the top-level result.
- The default handler just `console.log`s submissions.

### EmailHandler caveats
- Doesn't validate SMTP credentials at startup; sends HTML only; one `to` address per instance.

### GoogleDocsHandler caveats
- Writes to Google **Sheets** only (the name says "Docs"); needs a service account JSON and a sheet shared with it; doesn't manage column headers for you.

## How to use

```javascript
import { FormHandler, EmailHandler } from '@uttori/wiki';

const config = {
  plugins: [FormHandler],

  [FormHandler.configKey]: {
    baseRoute: '/forms',
    forms: [
      {
        name: 'contact',
        route: '/contact', // full route: /forms/contact
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'email', type: 'email', required: true },
          { name: 'message', type: 'textarea', required: true },
        ],
        handler: EmailHandler.create({
          transportOptions: {
            host: 'smtp.example.com',
            port: 587,
            auth: { user: 'name', pass: 'word' },
          },
          from: 'noreply@example.com',
          to: 'hello@example.com',
          subject: 'Contact from {name}',
        }),
        successMessage: 'Thanks - we got your message.',
        errorMessage: 'Something went wrong. Please try again.',
      },
    ],
    events: {
      bindRoutes: ['bind-routes'],
      validateConfig: ['validate-config'],
    },
  },
};
```

## Configuration

### Plugin

| Option | Default | What it does |
|--------|---------|--------------|
| `baseRoute` | `'/forms'` | Prefix prepended to each form's `route`. |
| `forms` | `[]` | Array of form definitions (see below). |
| `defaultHandler` | logs to console | Fallback when a form has no `handler`. |
| `events` | *(none)* | Hook wiring. |

### Per form

| Option | Required | What it does |
|--------|----------|--------------|
| `name` | yes | Form identifier. |
| `route` | yes | Path segment (full route = `baseRoute` + `route`). |
| `fields` | yes | Field definitions: `name`, `type`, `required`, optional `validation`. |
| `successMessage` | yes | Message on successful validation + handler call. |
| `errorMessage` | yes | Message on validation failure. |
| `handler` | no | `async (formData, formConfig, req, res) => { success, message? }`. |
| `middleware` | no | Extra middleware before the handler. |

### `EmailHandler.create(config)`

| Option | Required | What it does |
|--------|----------|--------------|
| `transportOptions` | yes | Nodemailer transport (host, port, auth, ...). |
| `from` | yes | Sender address. |
| `to` | yes | Recipient address. |
| `subject` | yes | Subject template (supports `{field}`, `{formName}`, `{timestamp}`). |
| `template` | no | HTML body template; an auto field-list is used if omitted. |

### `GoogleDocsHandler.create(config)`

| Option | Required | What it does |
|--------|----------|--------------|
| `credentialsPath` | yes | Path to the service-account JSON. |
| `spreadsheetId` | yes | Target spreadsheet ID. |
| `sheetName` | yes | Tab name to append rows to. |
| `prependTimestamp` | no | Prepend an ISO timestamp as the first column. |

## Good to know

- For Google Sheets: enable the Sheets API, create a service account, download its JSON, and **share the sheet with the service account's email**.
- Dependencies install on demand: `nodemailer` for email, `googleapis` for Sheets.
- Pair public forms with [CSRF Protection](csrf.md) and rate-limiting middleware.
