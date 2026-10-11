# Localmart Marketplace

BUILD A COMPLETE PROFESSIONAL FRONTEND FOR MY EXISTING DBMS PROJECT
===============================================================

PROJECT NAME:
LOCALMART

TAGLINE:
"Discover local. Shop nearby. Support small."

IMPORTANT:
I am providing reference screenshots of a professional marketplace
website design.

THE SCREENSHOTS ARE THE PRIMARY VISUAL DESIGN REFERENCE.

DO NOT create a generic AI-generated e-commerce website.

I want the final LOCALMART frontend to closely reproduce the
VISUAL LANGUAGE, STRUCTURE, SPACING, TYPOGRAPHY, SECTION RHYTHM,
NAVIGATION STYLE, PRODUCT CARD STYLE, HERO DESIGN, WHITE-SPACE,
BUTTON STYLE, FOOTER STRUCTURE and overall premium appearance
shown in the reference screenshots.

However, adapt the content and functionality completely to LOCALMART,
which is a local small-business marketplace backed by Spring Boot
and PostgreSQL.

===============================================================
REFERENCE IMAGES
===============================================================

Use the uploaded reference screenshots as the visual source of truth.

The reference website has:

- dark premium navigation bar
- compact logo area
- centered search bar
- navigation links
- large full-width hero image
- centered hero heading
- subtitle
- prominent CTA
- clean white product sections
- large whitespace between sections
- horizontal product cards
- product image + name + description + rating + price
- thin separators
- subtle pastel accent colors
- editorial/organic marketplace feel
- large section headings
- promotional information sections
- standards/feature icons
- popular products section
- visual media/promotion section
- newsletter/community section
- large footer
- very clean desktop layout
- strong visual hierarchy
- restrained animation
- premium typography

REPRODUCE THIS LEVEL OF VISUAL POLISH.

DO NOT simply copy the food/organic content.

LOCALMART must contain marketplace content instead.

===============================================================
CRITICAL PROJECT CONSTRAINT
===============================================================

This is NOT a new standalone mock e-commerce website.

This frontend MUST work with my existing Spring Boot + PostgreSQL
backend.

Architecture:

Frontend
    ↓
HTTP / JSON
    ↓
Spring Boot REST Controllers
    ↓
Services
    ↓
Repositories / JPA
    ↓
PostgreSQL

PostgreSQL is the source of truth.

DO NOT redesign the database.

DO NOT replace the backend.

DO NOT create a fake backend.

DO NOT use permanent mock data.

DO NOT invent APIs.

DO NOT replace PostgreSQL with Firebase, Supabase, MongoDB,
local JSON, or browser-only storage.

DO NOT replace the existing Spring Boot architecture with another
backend.

The frontend must consume the existing backend APIs.

===============================================================
TECHNOLOGY REQUIREMENT
===============================================================

Use:

HTML
CSS
Vanilla JavaScript

DO NOT convert this project to React.

DO NOT use Next.js.

DO NOT create a React/Vite application.

DO NOT introduce unnecessary frameworks.

The existing backend serves the frontend through Spring Boot
static resources.

Final frontend location:

src/main/resources/static/

The frontend must work when the Spring Boot application runs.

Current backend application:

http://localhost:8081/

Use relative API paths such as:

/api/...

instead of hardcoding:

http://localhost:8080/...

This is important because the frontend and backend will be served
by the same Spring Boot application.

===============================================================
EXACT FRONTEND FILE STRUCTURE
===============================================================

CREATE EXACTLY THESE FRONTEND FILES.

DO NOT create unnecessary duplicate HTML/CSS/JS files.

HTML:

src/main/resources/static/

    index.html
    catalog.html
    product.html
    business.html
    cart.html
    checkout.html
    orders.html
    reviews.html
    seller.html
    admin.html


CSS:

src/main/resources/static/css/

    global.css
    components.css
    catalog.css
    dashboard.css
    responsive.css


JavaScript:

src/main/resources/static/js/

    api.js
    state.js
    utils.js
    navbar.js
    catalog.js
    product.js
    business.js
    cart.js
    checkout.js
    orders.js
    reviews.js
    seller.js
    admin.js


TOTAL:

10 HTML
5 CSS
13 JS

28 frontend files.

Do not unnecessarily create:

app.js
main.js
style.css
home.css
products.js
dashboard.js
etc.

Keep the exact structure above.

===============================================================
BRAND
===============================================================

Brand name:

LOCALMART

Tagline:

Discover local. Shop nearby. Support small.

LOCALMART is a marketplace for discovering products from
local businesses.

The design should feel premium, trustworthy, modern and local.

Do NOT make it look like Amazon.

Do NOT make it look like Flipkart.

Do NOT make it look like a generic Bootstrap dashboard.

The visual direction should be closer to the supplied reference:
editorial, premium, clean, spacious and image-focused.

===============================================================
COLOR DIRECTION
===============================================================

Use the reference screenshot as the primary color inspiration.

Main visual direction:

- warm white / off-white backgrounds
- charcoal / near-black navigation
- muted coral/salmon accent
- dark charcoal text
- soft beige/cream secondary sections
- subtle grey borders
- very restrained shadows

Do not use excessive gradients.

Do not use neon colors.

Do not use excessive glassmorphism.

Do not use giant colorful cards.

Do not turn every section into a different color.

The website must feel cohesive.

===============================================================
TYPOGRAPHY
===============================================================

Use a refined combination of:

- elegant serif/display typography for major hero headings
- clean sans-serif typography for navigation, product information
  and interface elements

Match the visual hierarchy of the reference screenshots.

Hero headings should be elegant and editorial.

Navigation and functional text should remain highly readable.

===============================================================
GLOBAL NAVIGATION
===============================================================

The reference navigation should be adapted into LOCALMART.

Desktop navigation:

LEFT:
LOCALMART logo

CENTER:
Search products / businesses

NAVIGATION:
HOME
SHOP
BUSINESSES
CATEGORIES

RIGHT:
ORDERS
CART
PROFILE / ROLE

Use icons where appropriate.

Do not overcrowd the navigation.

On mobile:

Use a clean hamburger menu.

Search should remain easily accessible.

Cart should remain accessible.

===============================================================
HOMEPAGE — index.html
===============================================================

Reproduce the overall structure of the reference homepage.

SECTION 1 — NAVBAR

Dark premium navigation.

LOCALMART branding.

Search bar.

Navigation links.

Cart/profile area.

---------------------------------------------------------------

SECTION 2 — HERO

Full-width visual hero.

Use marketplace/local-business imagery rather than organic-food
imagery.

Example heading:

"Discover the best from local businesses"

Supporting text:

"Find products you love from businesses around your community."

Primary CTA:

"EXPLORE MARKETPLACE"

Secondary CTA if appropriate:

"DISCOVER BUSINESSES"

The hero should have the same visual impact and proportions
as the supplied reference.

Do NOT make the hero unnecessarily tall.

---------------------------------------------------------------

SECTION 3 — CATEGORIES

Heading:

"EXPLORE CATEGORIES"

Show category cards.

Categories must come from the backend when the API supports it.

Do not permanently hard-code fake categories.

Possible visual categories:

Bakery
Groceries
Handmade
Fashion
Electronics
Home
Beauty
Services

But render actual backend data whenever available.

---------------------------------------------------------------

SECTION 4 — FEATURED PRODUCTS

Heading:

"WHAT'S NEW?"

Display premium product cards.

Each card should show:

Product image
Product name
Business name
Category
Short description
Rating
Review count
Price
Stock status
Add to Cart

Product data must come from the backend.

Use a horizontal/featured arrangement inspired by the reference.

---------------------------------------------------------------

SECTION 5 — ABOUT LOCALMART

Inspired by the "WHAT IS MAZI?" section.

Heading:

"WHAT IS LOCALMART?"

Explain:

LOCALMART connects customers with local businesses and their
products through one database-driven marketplace.

Use three simple feature blocks:

DISCOVER LOCAL
Find products from nearby businesses.

SHOP WITH CONFIDENCE
See product, stock and rating information.

SUPPORT SMALL
Help local businesses reach more customers.

---------------------------------------------------------------

SECTION 6 — WHY LOCALMART

Inspired by the "OUR STANDARDS" section.

Create four simple visual feature/icon blocks:

LOCAL BUSINESSES
REAL PRODUCTS
DATABASE DRIVEN
CUSTOMER REVIEWS

Use elegant monochrome icons.

Do not copy the exact icons from the reference.

---------------------------------------------------------------

SECTION 7 — POPULAR PRODUCTS

Heading:

"POPULAR RIGHT NOW"

Display products using the same visual card quality as the
reference.

Use real backend data.

---------------------------------------------------------------

SECTION 8 — PROMOTIONAL MEDIA

Inspired by the media/video section in the reference.

Instead of fake videos, use polished promotional cards such as:

"Meet Local Sellers"
"Discover Nearby Products"
"Shop Local. Support Local."

If no actual media exists in the backend, use static visual
promotional cards.

Do NOT create fake video functionality.

---------------------------------------------------------------

SECTION 9 — COMMUNITY CTA

Heading:

"JOIN THE LOCALMART COMMUNITY"

Supporting text about discovering local businesses.

CTA:

"EXPLORE NOW"

---------------------------------------------------------------

SECTION 10 — NEWSLETTER / LOCAL DISCOVERY

Inspired by the reference's newsletter section.

Heading:

"Stay connected with your local marketplace."

Email input + Subscribe button.

This can be a frontend-only visual feature unless the backend
provides a newsletter API.

Do not pretend that an email was actually stored if no backend
endpoint exists.

---------------------------------------------------------------

SECTION 11 — FOOTER

Large professional footer inspired by the reference.

LOCALMART logo.

Columns:

MARKETPLACE
Home
Shop
Categories
Businesses

CUSTOMER
Cart
Checkout
Orders
Reviews

BUSINESS
Seller Dashboard
Manage Products
Performance

CONNECT
About
Contact
Help

Bottom:

© 2026 LOCALMART
Local marketplace platform

===============================================================
CATALOG — catalog.html
===============================================================

This is the main shopping page.

Maintain the visual language of the reference.

Top:

Page heading:

"SHOP LOCAL"

Supporting text.

Search bar.

Category filters.

Business filters.

Then:

LEFT:
Filter panel

RIGHT:
Product grid

Product cards must be premium and consistent.

Each product card:

Image
Product name
Business
Category
Description
Price
Rating
Review count
Stock
Add to Cart

If stockQuantity = 0:

Show:

OUT OF STOCK

Disable Add to Cart.

Do not allow the UI to pretend an unavailable product is
purchasable.

Backend remains responsible for final stock validation.

===============================================================
PRODUCT DETAILS — product.html
===============================================================

Premium product detail layout.

LEFT:
Large product image.

RIGHT:

Product name
Business
Category
Price
Rating
Review count
Description
Stock
Quantity selector
Add to Cart

Below:

ABOUT THIS PRODUCT

REVIEWS

RELATED PRODUCTS

Business link:

"View Store"

Use real backend data.

If reviewCount = 0:

Display:

"No reviews yet"

Do NOT show zero stars as if the product received zero-star
reviews.

===============================================================
BUSINESS — business.html
===============================================================

Create an individual local-business/store page.

Header:

Business name
Description
Location/contact information if available

Then:

"PRODUCTS FROM THIS BUSINESS"

Display its products using the same product card system.

The page should feel like a premium local storefront.

===============================================================
CART — cart.html
===============================================================

Premium cart layout.

LEFT:

Cart items.

Each item:

Product
Business
Price
Quantity controls
Subtotal
Remove

RIGHT:

ORDER SUMMARY

Subtotal
Total

CTA:

PROCEED TO CHECKOUT

Empty cart state:

"Your cart is empty"

CTA:

"EXPLORE PRODUCTS"

===============================================================
CHECKOUT — checkout.html
===============================================================

Clean checkout page.

Sections:

ORDER REVIEW

Customer information based on available backend fields.

Order items.

Total.

Primary CTA:

PLACE ORDER

No real payment gateway.

This is a DBMS academic project.

Do not add fake payment integration.

After successful order:

Show a professional order confirmation.

===============================================================
ORDERS — orders.html
===============================================================

Customer order history.

Heading:

"MY ORDERS"

Display:

Order ID
Date
Status
Total

Clicking an order should show its items/details if supported by
the backend.

Use clean status badges.

Empty state:

"No orders yet."

===============================================================
REVIEWS — reviews.html
===============================================================

Professional review interface.

Display:

Product
Average rating
Review count
Existing reviews

Submission form:

Rating 1–5
Comment
Submit Review

Validate:

Rating must be between 1 and 5.

Show:

Success message
Error message
Loading state

===============================================================
SELLER DASHBOARD — seller.html
===============================================================

This page should visually shift from marketplace storefront to
professional business dashboard while retaining LOCALMART's
visual language.

Dashboard sections:

OVERVIEW

Total products
Total orders
Performance
Stock alerts

PRODUCT MANAGEMENT

Table/grid:

Product
Category
Price
Stock
Actions

Actions:

Add
Edit
Delete

Only implement actions actually supported by the backend.

Do not invent request formats.

PERFORMANCE

Use backend reporting data.

Charts should be minimal and professional.

Do not fill charts with fake statistics.

===============================================================
ADMIN DASHBOARD — admin.html
===============================================================

Professional database/reporting dashboard.

Do NOT make this look like a generic admin template.

Sections:

PRODUCT CATALOG REPORT

SELLER PERFORMANCE

CUSTOMER ORDER SUMMARY

PRODUCT PERFORMANCE

PRODUCT RATINGS

Use clean cards, tables and simple visual summaries.

===============================================================
CONFIRMED BACKEND REPORT APIs
===============================================================

These are confirmed backend endpoints:

GET /api/reports/product-catalog

GET /api/reports/seller-performance

GET /api/reports/customer-order-summary

GET /api/reports/product-performance

GET /api/reports/product-ratings

Example product catalog response:

[
  {
    "productId": 1,
    "productName": "Chocolate Cake",
    "businessName": "Fresh Bites",
    "categoryName": "Bakery",
    "description": "...",
    "price": 450.00,
    "stockQuantity": 9
  }
]

Example ratings response:

[
  {
    "productId": 1,
    "productName": "Chocolate Cake",
    "businessName": "Fresh Bites",
    "averageRating": 5.00,
    "reviewCount": 1
  }
]

Use these endpoints where appropriate.

===============================================================
OTHER BACKEND RESOURCES
===============================================================

The backend contains functionality for:

Users
Businesses
Categories
Products
Carts
Cart Items
Orders
Order Items
Reviews

There are also CUSTOMER, SELLER and ADMIN roles.

IMPORTANT:

DO NOT GUESS POST/PUT/DELETE request bodies.

Before implementing interactive API calls, inspect the actual
Spring Boot controllers/DTOs from the supplied backend project.

Use the actual:

HTTP method
endpoint
path variables
query parameters
request body
response body

from the backend source.

If a feature cannot be confirmed from the backend:

DO NOT invent an API.

Either:

1. implement only what the backend actually supports, or
2. create the UI but clearly keep unsupported actions disabled.

===============================================================
JAVASCRIPT ARCHITECTURE
===============================================================

api.js

Centralize all API requests here.

Do not scatter fetch() calls across every HTML file.

Example:

async function apiGet(url) { ... }

async function apiPost(url, data) { ... }

etc.

state.js

Maintain:

current user
cart state
selected product
selected business
selected category
role state

Use state only where necessary.

utils.js

Reusable:

formatCurrency()
formatDate()
showToast()
showLoading()
showEmptyState()
showError()
escapeHtml()
etc.

navbar.js

Handle:

navigation
mobile menu
cart count
role-based links

catalog.js

Product catalog loading
search
filters
rendering
pagination if supported

product.js

Product details
ratings
reviews
add-to-cart

business.js

Business details
business products

cart.js

Add
remove
quantity updates
subtotal
cart rendering

checkout.js

Order review
place order
confirmation

orders.js

Order history
order details

reviews.js

Review loading
review submission

seller.js

Seller dashboard
product management
performance

admin.js

Reports
tables
dashboard statistics

===============================================================
COMPONENT SYSTEM
===============================================================

Even though this is vanilla HTML/CSS/JS, create reusable visual
patterns.

Use consistent:

Product cards
Buttons
Badges
Cards
Tables
Forms
Modals
Toast notifications
Empty states
Loading states
Error states
Navigation
Footer

Do not duplicate CSS unnecessarily.

global.css:

Typography
variables
body
base elements
colors
spacing

components.css:

buttons
cards
product cards
badges
forms
tables
modals
toast
navigation components

catalog.css:

catalog
filters
product grid
product detail
business/product browsing

dashboard.css:

seller/admin
stat cards
dashboard tables
report sections
charts

responsive.css:

mobile
tablet
responsive navigation
responsive grids
responsive tables
mobile filters

===============================================================
REFERENCE IMAGE — IMPLEMENTATION RULE
===============================================================

The supplied screenshot is NOT merely inspiration.

Treat it as a strict visual benchmark.

Match:

- navbar height
- hero proportions
- section spacing
- product card proportions
- typography hierarchy
- centered headings
- whitespace
- horizontal alignment
- button proportions
- footer density
- section rhythm
- overall page length
- visual balance

However, do not copy its food-specific content.

Replace:

food marketplace
→
local multi-category marketplace

organic products
→
local products

food categories
→
LOCALMART categories

organic standards
→
LOCALMART marketplace benefits

food newsletter
→
LOCALMART community

===============================================================
RESPONSIVE DESIGN
===============================================================

Must work properly at:

1920px
1440px
1366px
1024px
768px
480px
375px

Desktop should resemble the supplied screenshot closely.

Mobile must be redesigned intelligently rather than simply
shrinking everything.

Product grids:

Desktop:
4 columns where appropriate.

Tablet:
2–3 columns.

Mobile:
1–2 columns depending on screen width.

Navigation becomes a mobile menu.

Filters become a drawer/dropdown.

Tables become horizontally scrollable or mobile cards.

===============================================================
IMAGE HANDLING
===============================================================

Use high-quality marketplace/local-business imagery.

Do NOT use random unrelated stock images.

Use image placeholders where backend image URLs do not exist.

If the backend provides image URLs, use those.

Do not hard-code fake product information just to make the
interface look populated.

===============================================================
LOADING / EMPTY / ERROR STATES
===============================================================

Every API-driven page must have:

Loading state

Empty state

Error state

Success state where appropriate.

Examples:

Loading:
"Loading products..."

Empty:
"No products found."

No reviews:
"No reviews yet."

Out of stock:
"Out of stock"

API failure:
"Unable to load products. Please try again."

Do not leave blank white sections when an API fails.

===============================================================
SECURITY
===============================================================

NEVER put:

PostgreSQL username
PostgreSQL password
database credentials
JWT secrets
GitHub tokens
API secrets

inside frontend code.

The browser must only communicate with Spring Boot REST APIs.

===============================================================
DATA RULES
===============================================================

Do not permanently hard-code:

Product prices
Product stock
Product ratings
Business names
Order totals
Seller performance
Admin statistics

These should come from backend APIs.

Mock data may be temporarily used during development, but the
final frontend must use real API responses.

===============================================================
ROLE EXPERIENCE
===============================================================

CUSTOMER:

Home
Shop
Businesses
Product Details
Cart
Checkout
Orders
Reviews

SELLER:

Seller Dashboard
Products
Product management
Performance
Inventory-related information where backend supports it

ADMIN:

Admin Dashboard
Reports
Product catalog
Seller performance
Customer order summary
Product performance
Product ratings

Do not expose unnecessary admin/seller actions to normal
customers.

===============================================================
IMPORTANT BACKEND INTEGRATION RULE
===============================================================

Before writing API calls:

INSPECT THE EXISTING BACKEND SOURCE.

Do not guess.

Find:

src/main/java/

Inspect:

controllers
services
repositories
DTOs
entities

Determine the actual endpoint contracts.

The frontend must adapt to the backend that already exists.

The backend must NOT be modified just to make the frontend easier.

===============================================================
SPRING BOOT INTEGRATION
===============================================================

Final structure:

local-marketplace/
│
├── database/
│
├── src/
│   └── main/
│       ├── java/
│       │
│       └── resources/
│           ├── application.properties
│           └── static/
│               ├── index.html
│               ├── catalog.html
│               ├── product.html
│               ├── business.html
│               ├── cart.html
│               ├── checkout.html
│               ├── orders.html
│               ├── reviews.html
│               ├── seller.html
│               ├── admin.html
│               │
│               ├── css/
│               │   ├── global.css
│               │   ├── components.css
│               │   ├── catalog.css
│               │   ├── dashboard.css
│               │   └── responsive.css
│               │
│               └── js/
│                   ├── api.js
│                   ├── state.js
│                   ├── utils.js
│                   ├── navbar.js
│                   ├── catalog.js
│                   ├── product.js
│                   ├── business.js
│                   ├── cart.js
│                   ├── checkout.js
│                   ├── orders.js
│                   ├── reviews.js
│                   ├── seller.js
│                   └── admin.js
│
└── pom.xml

===============================================================
FINAL QUALITY REQUIREMENT
===============================================================

Do not stop after generating static-looking HTML.

The final result must be a FUNCTIONAL frontend.

Test:

1. Homepage loads
2. Products load from API
3. Search works
4. Filters work
5. Product details load
6. Business page works
7. Add to cart works
8. Cart quantity works
9. Remove from cart works
10. Checkout works
11. Order is placed through backend
12. Order history loads
13. Reviews load
14. Review submission works if supported
15. Seller dashboard loads
16. Seller product management works where supported
17. Seller reports load
18. Admin reports load
19. Out-of-stock products cannot be added
20. API errors are displayed cleanly
21. Mobile layout works
22. No browser console errors
23. No broken links
24. No hard-coded database credentials
25. No fake statistics in final UI

===============================================================
MOST IMPORTANT FINAL INSTRUCTION
===============================================================

The visual reference screenshots define the DESIGN.

The existing Spring Boot backend defines the FUNCTIONALITY.

The PostgreSQL database defines the DATA.

Do not mix these responsibilities.

FINAL RESULT:

A polished, premium LOCALMART marketplace that LOOKS like the
supplied reference website but FUNCTIONS as our actual
database-driven local marketplace.

It should look professional enough for a college DBMS project
demonstration and clearly demonstrate:

PostgreSQL
+
Spring Boot
+
REST APIs
+
HTML/CSS/JavaScript
+
Database reporting
+
Customer workflow
+
Seller workflow
+
Admin/reporting workflow.

Do not declare the task complete until the frontend is actually
integrated and tested against the existing Spring Boot backend.

chk the image for reference

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/54d95b54-6be6-4c5f-a6b8-464b3a7da318).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
