# LocalMarket Frontend

A dependency-free frontend for the existing Spring Boot + PostgreSQL Local Marketplace backend.

## What is included

- Home page with categories and featured products
- Product search, category filtering and city filtering
- Business directory
- Product details and reviews
- Persistent demo-user selection using browser localStorage
- Cart creation, add/remove/update quantities
- Checkout using the existing `/api/orders/place/{cartId}` endpoint
- Order history and order details
- Product reviews after an order
- Seller center with:
  - Product create/edit/delete
  - Stock overview
  - Inventory recommendations from the existing backend
  - Business information
- Admin center for ADMIN users:
  - User deletion
  - Category creation/deletion
  - Business deletion
  - Order status updates/deletion

## Run

1. Start PostgreSQL and make sure the database configured in `application.properties` is available.
2. Start the Spring Boot backend normally.
3. Open `http://localhost:8080/`.

The frontend is served directly by Spring Boot from `src/main/resources/static`, so there is no Node/npm setup.

## Important backend limitation

The current backend does not expose authentication/login endpoints. The frontend therefore lets you select an existing database user as a demo session. This is intentionally visible rather than pretending that real authentication exists.

## Frontend files

- `src/main/resources/static/index.html`
- `src/main/resources/static/styles.css`
- `src/main/resources/static/app.js`
