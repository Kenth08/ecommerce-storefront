# 🛍️ Ecomify

A modern, full-featured e-commerce storefront built with **React 19** and **Vite**, styled with **Tailwind CSS v4**, and backed by a **Django REST Framework** API with JWT authentication.

Ecomify is the customer-facing single-page application: browse a 175+ product catalog, filter and search, manage a cart that follows you across devices, leave verified-purchase reviews, and check out — all with a responsive, dark-mode-aware, accessible UI.

<!-- Add a screenshot or GIF here once you have one:
![Ecomify storefront](docs/screenshot.png)
-->

---

## ✨ Features

### Shopping
- **Product catalog** — 175+ products with category filtering, client-side search, sort, and "show more" pagination.
- **Product detail** — image gallery, size/color variant selection, quantity picker, stock awareness, and **Buy Now**.
- **Quick view** — add to cart from a modal without leaving the listing.
- **Wishlist** — save products for later (requires login).
- **Verified-purchase reviews** — ratings summary, star/photo filters, and a review form available on delivered orders.

### Cart & Checkout
- **Hybrid cart** — guests get a `localStorage` cart; logged-in users get a **JWT-protected server cart** that syncs across devices. Guest items **merge into the server cart on login**.
- **Optimistic updates** — quantity changes apply instantly and sync to the server with debounced writes.
- **Dedicated checkout** — contact + shipping address (with saved-address prefill), delivery options, payment method, and voucher codes.
- **Real server checkout** — creates the order via the backend and supports Stripe hosted checkout, with a graceful local fallback while the payment backend is finalized.
- **Order history & tracking** — "My Orders" list with status filters, an order detail timeline, and a confirmation page.

### Accounts
- Email/password **registration, login, email verification, and password reset**.
- **Sign in with Google** (Google Identity Services).
- **Profile, saved addresses, and settings** management.
- **JWT auth** with automatic silent access-token refresh.

### Experience
- **Dark / light theme** with no flash of the wrong theme on load.
- **Responsive** and **accessible** (skip links, ARIA labels, keyboard-friendly, large tap targets).
- **Code-split routes** (lazy loading) so visitors download only the page they open.
- Toast notifications, skeleton loaders, friendly empty states, and an error boundary.

---

## 🧰 Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | React 19 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Routing | React Router 7 |
| HTTP | Axios (with interceptors for auth + token refresh) |
| Animation | Framer Motion |
| Notifications | react-hot-toast |
| Linting | ESLint 10 |
| Backend | Django REST Framework (separate repo) — JWT auth, deployed on Render |
| Hosting | Vercel (frontend) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** and npm
- A running instance of the Ecomify backend API (or its URL)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ecommerce

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

### Configure environment

Edit `.env` (see [Environment Variables](#-environment-variables)):

```bash
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

### Run the dev server

```bash
npm run dev
```

The app runs at **http://localhost:5173**.

---

## 🔑 Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | ✅ | Base URL of the backend API. The client appends `/api/v1`. Example: `http://localhost:8000` or your Render URL. |
| `VITE_GOOGLE_CLIENT_ID` | Optional | Google OAuth Web client ID for "Sign in with Google". Must match the ID the backend trusts. Public value — safe to ship. |

> `.env` is git-ignored. Never commit secrets. `VITE_`-prefixed values are exposed to the browser by design, so only put public values here.

---

## 📜 Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR. |
| `npm run build` | Production build to `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint over the project. |

---

## 📁 Project Structure

```
src/
├── api/          # Backend API layer (one module per resource)
│   ├── client.js       # Axios instance: base URL, auth header, token refresh, pagination
│   ├── cart.js         # Server cart CRUD + snake_case → camelCase mapping
│   ├── orders.js       # Checkout + order history
│   ├── products.js     # Catalog
│   ├── reviews.js      # Product reviews
│   └── ...
├── components/   # Reusable UI (Navbar, ProductCard, modals, reviews, etc.)
├── context/      # React context providers (Auth, Cart, Wishlist, theme/fly effects)
├── pages/        # Route-level pages (Home, Shop, Cart, Checkout, Orders, ...)
├── hooks/        # Custom hooks
├── utils/        # Helpers (formatting, search, validation, ratings)
├── App.jsx       # Routes + layout chrome
└── main.jsx      # App entry
```

**Design principle:** the `api/` layer is the *only* place that knows the backend's routes and data shape. It maps the server's `snake_case` responses into the `camelCase` shape the UI uses, and it transparently handles JWT refresh and DRF pagination (`fetchAllPages`). The rest of the app stays backend-agnostic.

---

## 🏗️ Architecture Notes

- **Auth:** Access/refresh JWTs are stored client-side. An Axios response interceptor catches `401`s and silently refreshes the access token once (deduplicating concurrent refreshes), retrying the original request. On refresh failure, the user is redirected to login.
- **Pagination:** All list endpoints are DRF-paginated (`{ count, next, previous, results }`, page size 12). `fetchAllPages()` fetches page 1, then the remaining pages in parallel, and tolerates bare-array responses too.
- **Cart sync:** Guests use `localStorage`; authenticated users use the server cart. On login, guest items are merged into the server cart and the local cart is cleared. Quantity edits are optimistic and debounced before syncing.

---

## ☁️ Deployment

The frontend deploys cleanly to **Vercel** (or any static host). `vercel.json` rewrites all routes to `index.html` for client-side routing:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**Steps:**
1. Push the repo to GitHub.
2. Import it in Vercel.
3. Set the environment variables (`VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`) in the Vercel project settings.
4. Deploy — build command `npm run build`, output directory `dist`.

---

## 🗺️ Roadmap

- [x] Server-backed cart with guest → server merge on login
- [x] Product reviews (read + write, verified purchase)
- [x] Checkout page wired to the real order endpoint (with graceful fallback)
- [ ] Finalize the payment flow (confirm Stripe vs. Cash-on-Delivery contract, then remove the demo placeholders and local fallback)
- [ ] Server-side voucher validation
- [ ] Persist shipping address / delivery choice with the order on the backend

---

## 🤝 Contributing

This is a two-person project: a **React/Vite frontend** and a **Django REST backend** (separate repo). The frontend expects the API at `VITE_API_URL/api/v1`. When the backend contract changes, update the corresponding module in `src/api/` — that's the single source of truth for request/response shapes.

---

## 📄 License

This project is private/unlicensed. All rights reserved by the authors.
