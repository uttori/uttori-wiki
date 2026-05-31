# Auth (Simple)

> Minimal login/logout routes - you supply the brains, it manages the session profile.

```javascript
import { AuthSimple } from '@uttori/wiki';
```

**configKey:** `uttori-plugin-auth-simple`

## What it does

Adds POST login and logout routes. You provide a `validateLogin(request)` function that inspects the request (usually credentials in the body) and returns a profile object on success or `null` on failure. On success, the profile is stored on `request.session.profile` and the client gets a JSON response or a redirect. Logout destroys the session. Optional middleware arrays let you bolt on rate limiting, body parsing, etc.

It's intentionally unopinionated - the "simple" is a promise, not an apology.

## What it doesn't do

- **It doesn't set up sessions or cookies** - configure `express-session` (or similar) yourself.
- **No login UI, password hashing, OAuth, JWT, or roles** - you bring the auth logic.
- **The default `validateLogin` rejects everyone** - replace it.
- **It doesn't guard your wiki routes** - it only exposes login/logout endpoints. Protect routes with `routeMiddleware` or per-plugin middleware that checks `request.session.profile`.

## How to use

```javascript
import { AuthSimple } from '@uttori/wiki';

const config = {
  plugins: [AuthSimple],

  [AuthSimple.configKey]: {
    ...AuthSimple.defaultConfig(),
    loginPath: '/login',
    logoutPath: '/logout',
    loginRedirectPath: '/',
    logoutRedirectPath: '/',
    validateLogin: async (request) => {
      const { username, password } = request.body;
      if (username === 'admin' && password === process.env.ADMIN_PASSWORD) {
        return { username, role: 'admin' };
      }
      return null; // reject
    },
  },
};
```

You'll also need session middleware on your Express app, e.g.:

```javascript
import session from 'express-session';
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
```

## Configuration

| Option | Default | What it does |
|--------|---------|--------------|
| `loginPath` | `'/login'` | POST route for login. |
| `logoutPath` | `'/logout'` | POST route for logout. |
| `loginRedirectPath` | `'/'` | Where browsers go after a successful login. |
| `logoutRedirectPath` | `'/'` | Where browsers go after logout. |
| `loginMiddleware` | `[]` | Middleware before the login handler. |
| `logoutMiddleware` | `[]` | Middleware before the logout handler. |
| `validateLogin` | `() => null` | **Your** auth logic; return a profile or `null`. |
| `events` | `bindRoutes`, `validateConfig` | Hook wiring. |

## Good to know

- Pair with [CSRF Protection](csrf.md) so login posts can't be forged.
- Store as little as you need in the session profile - it's serialized with every request.
