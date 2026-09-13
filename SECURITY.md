# Security notes — AI Invoice & Billing Manager (white-label)

This fork of `time-to-program/ai-invoice-and-billing-manager-ui-boilerplate-code`
has been security-reviewed and hardened. Use this as the checklist before exposing
it to a white-label client.

## 1. Prompt-injection: none in the boilerplate (yet)

The shipped boilerplate makes **no LLM call**. Every AI endpoint
(`receiptParse`, `businessSummary`, `paymentReminder`, `writeNote`) returns a
**fixed canned response** from `src/mock/api.js`. So there is zero prompt-injection
risk in the boilerplate as-is.

The risk **moves to your backend** the moment you wire a real AI provider
(commented out in `src/api/ai.js`). When you do:

- Treat **all user-uploaded content** (receipt images/PDFs, invoice notes) as untrusted:
  run it through a prompt-injection guard (e.g. guard/rAG safety layer) before it reaches the model.
- Use an **isolated system prompt** that the user content cannot override; never let model
  output drive privileged actions (e.g. auto-sending payments) without human confirmation.
- Sanitize/parse structured output; **never execute** instructions found in model output.

## 2. Hardening already applied in this fork

- **Dependency vulnerabilities:** `npm audit fix` applied — `0 vulnerabilities`
  (was 10 high/moderate across `axios`, `nanoid`, `postcss`, `react-router`, `vite`, `form-data`).
- **XSS via logo:** added `sanitizeImageSrc()` (`src/lib/utils.js`) and applied it to
  the logo preview (`src/pages/Settings.jsx`) and the generated PDF (`src/components/invoice/InvoiceDocument.jsx`).
  Only `data:image/*` raster URIs, clean SVG data URIs (no `<script>`/`<foreignobject>`/`onerror`),
  and `https://` image URLs are allowed; everything else (incl. `javascript:`) is rejected.
- No `dangerouslySetInnerHTML`, `eval`, or `new Function` anywhere in the source.

## 3. Backend wiring checklist (do this before going live)

When you switch mock → real API (see `README.md`), ensure your backend:

1. **Auth:** session cookies are `HttpOnly` + `SameSite=Strict/Lax`; never store tokens in `localStorage`.
2. **CSRF:** protect state-changing requests (POST/PATCH/DELETE) with a double-submit cookie
   token or `SameSite` + origin check. The commented axios block sets `withCredentials: true`.
3. **Authorization:** server-side ownership checks on every invoice/client/payment/expense call
   (multi-tenant isolation per white-label client).
4. **File upload** (`/ai/receipt-parse`): enforce server-side size + MIME/extension validation;
   store on a CDN/object storage and serve with a cache-busting, per-session URL.
5. **Input validation & output encoding** on the server; enforce a Content-Security-Policy
   (default-src 'self'; block inline scripts) on the deployed app.
6. **Secrets:** keep provider API keys server-side only; the frontend must ship with none.

## 4. White-label rebranding steps

- Rename in `package.json` (`name`) and the git remote.
- Branding lives in the mock + assets: company name / demo email
  (`src/mock/store.js`), colors via Tailwind CSS variables in `src/index.css`,
  logo (`src/assets/`), and the SVG icon set (`public/icons.svg`).
- Swap the mock AI responses in `src/mock/api.js` (`ai:` block) for your provider once wired.
