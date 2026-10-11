# LOCALMART | Local Marketplace Platform

**LOCALMART** is a full-stack marketplace application designed to connect customers with local businesses through a unified digital platform. It enables product discovery, shopping cart management, order processing, and customer reviews, with dedicated functionality for sellers and administrators.

Developed as a Database Management Systems (DBMS) project, LOCALMART combines a modern web interface, a Java-based backend, and a PostgreSQL relational database to demonstrate the practical application of database design, transaction management, and data-driven application development.

## Key Features

- **Product Discovery:** Browse products, explore local businesses, and view product details, availability, and ratings.
- **Shopping Cart & Orders:** Manage cart items, proceed through checkout, and access order information.
- **Business Management:** Support seller-oriented product and business operations.
- **Reviews & Ratings:** Enable customer feedback on products.
- **Role-Based Functionality:** Separate customer, seller, and administrator experiences.
- **Database-Driven Operations:** Manage marketplace data through a relational database and backend APIs.
- **Performance Insights:** SQL views support product, seller, and customer-order reporting.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, TypeScript, TanStack Router, TanStack Query |
| UI | Tailwind CSS, Radix UI, Lucide |
| Backend | Java, Spring Boot |
| Database | PostgreSQL |
| Persistence | Spring Data JPA, Hibernate |
| Build Tool | Maven |
| Version Control | Git, GitHub |

## System Architecture

```text
┌─────────────────────────────┐
│       Web Application       │
│      React + TypeScript     │
└──────────────┬──────────────┘
               │ REST API
               │ HTTP / JSON
┌──────────────▼──────────────┐
│       Spring Boot API       │
│   Business Logic & Services │
└──────────────┬──────────────┘
               │ JPA / Hibernate
┌──────────────▼──────────────┐
│         PostgreSQL          │
│ Relational Data & SQL Logic │
└─────────────────────────────┘
```

The frontend communicates with the Spring Boot backend through REST APIs. The backend handles application logic and database access, while PostgreSQL maintains persistent marketplace data and enforces relational integrity.

## Database Design

The database is organized around the following core entities:

| Entity | Responsibility |
|---|---|
| `users` | User accounts and information |
| `businesses` | Local business details |
| `categories` | Product classification |
| `products` | Product details, pricing, and availability |
| `carts` & `cart_items` | Shopping cart management |
| `orders` & `order_items` | Order records and associated products |
| `reviews` | Customer feedback and ratings |

### Advanced Database Components

The project includes SQL views for product catalogues, availability, ratings, product performance, seller performance, and customer order summaries.

It also includes a `place_order(p_cart_id)` stored procedure that uses row-level product locking to help coordinate concurrent inventory operations during order placement.

These components demonstrate the use of relational queries, database abstractions, stored procedures, and concurrency control in an application-oriented database system.

## Project Structure

```text
LOCALMART/
├── backend/       # Spring Boot application
├── database/      # SQL schemas, views, and migrations
├── public/        # Static assets and product images
├── src/           # Frontend application
├── package.json   # Frontend dependencies and scripts
└── README.md
```

## Running the Application

**Prerequisites:** Node.js, npm, JDK 21, Maven, and PostgreSQL.

Configure the PostgreSQL connection through environment variables in the backend configuration, and initialize the database using the appropriate SQL scripts in `database/`.

Start the backend from `backend/`:

```bash
mvn spring-boot:run
```

Start the frontend from the project root:

```bash
npm install
npm run dev
```

The backend is configured for port `8081`. Open the frontend development URL reported by the development server.

## Database Concepts Demonstrated

- Relational schema design and entity relationships
- Primary keys, foreign keys, and integrity constraints
- SQL queries, views, and aggregations
- Stored procedures and transactional operations
- Concurrency control for inventory-related operations
- Integration of a relational database with a full-stack application

## Future Scope

- Payment gateway integration
- Delivery tracking and order notifications
- Enhanced inventory analytics
- Expanded automated testing
- Production deployment and monitoring

## Project Information

**Project:** LOCALMART — Local Marketplace Platform  
**Category:** Full-Stack DBMS Project  
**Repository:** [SahaScripts/LOCALMART](https://github.com/SahaScripts/LOCALMART)

