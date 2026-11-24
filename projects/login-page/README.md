# Login page

A small, accessible sign-in page in plain HTML, CSS and JavaScript. No framework, no dependencies, no build step.

**Live:** https://bizaza-devs.github.io/projects/login-page/

## What it does
- Client-side validation with inline error messages (email format, minimum password length)
- Show / hide password toggle
- Keyboard and screen-reader friendly: labels, `aria-invalid`, `role="alert"`, visible focus rings
- Dark and light theme (follows the system), respects `prefers-reduced-motion`
- Responsive down to 320 px

## Not included
This is a **front-end demo**. It has no backend: nothing is sent, stored or checked against a server, and the password field is cleared after submit.
A real sign-in needs server-side authentication (hashed passwords, HTTPS, rate limiting, CSRF protection).

## Run locally
```bash
python -m http.server 5173
# open http://localhost:5173/projects/login-page/
```
