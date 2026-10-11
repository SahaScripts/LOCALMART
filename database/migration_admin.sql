-- 1. Users account_status
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_users_account_status'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT chk_users_account_status CHECK (account_status IN ('ACTIVE', 'SUSPENDED'));
    END IF;
END $$;
UPDATE users SET account_status = 'ACTIVE' WHERE account_status IS NULL;

-- 2. Businesses verification_status
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'PENDING' NOT NULL;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_businesses_verification_status'
    ) THEN
        ALTER TABLE businesses ADD CONSTRAINT chk_businesses_verification_status CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'));
    END IF;
END $$;
-- Existing businesses must be APPROVED
UPDATE businesses SET verification_status = 'APPROVED';

-- 3. Products listing_status
ALTER TABLE products ADD COLUMN IF NOT EXISTS listing_status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_listing_status'
    ) THEN
        ALTER TABLE products ADD CONSTRAINT chk_products_listing_status CHECK (listing_status IN ('ACTIVE', 'HIDDEN'));
    END IF;
END $$;
UPDATE products SET listing_status = 'ACTIVE';

-- 4. Reviews review_status
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS review_status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_reviews_review_status'
    ) THEN
        ALTER TABLE reviews ADD CONSTRAINT chk_reviews_review_status CHECK (review_status IN ('ACTIVE', 'HIDDEN'));
    END IF;
END $$;
UPDATE reviews SET review_status = 'ACTIVE';

-- 5. Admin audit log table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    audit_id SERIAL PRIMARY KEY,
    admin_user_id INTEGER NOT NULL REFERENCES public.users(user_id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Update views
CREATE OR REPLACE VIEW public.product_availability AS
 SELECT p.product_id,
    p.product_name,
    p.description,
    p.price,
    p.stock_quantity,
    b.business_id,
    b.business_name,
    b.city,
    b.state,
    c.category_id,
    c.category_name,
    COALESCE(round(avg(r.rating), 2), 0.00) AS average_rating,
    count(r.rating) AS review_count,
        CASE
            WHEN (p.stock_quantity = 0) THEN 'OUT_OF_STOCK'::text
            WHEN (p.stock_quantity <= 5) THEN 'LOW_STOCK'::text
            ELSE 'IN_STOCK'::text
        END AS availability_status
   FROM (((public.products p
     JOIN public.businesses b ON ((p.business_id = b.business_id)))
     JOIN public.categories c ON ((p.category_id = c.category_id)))
     LEFT JOIN public.reviews r ON (((p.product_id = r.product_id) AND (r.review_status = 'ACTIVE'))))
  WHERE p.listing_status = 'ACTIVE' AND b.verification_status = 'APPROVED'
  GROUP BY p.product_id, p.product_name, p.description, p.price, p.stock_quantity, b.business_id, b.business_name, b.city, b.state, c.category_id, c.category_name;

CREATE OR REPLACE VIEW public.product_catalog AS
 SELECT p.product_id,
    p.product_name,
    b.business_name,
    c.category_name,
    p.description,
    p.price,
    p.stock_quantity
   FROM ((public.products p
     JOIN public.businesses b ON ((p.business_id = b.business_id)))
     JOIN public.categories c ON ((p.category_id = c.category_id)))
  WHERE p.listing_status = 'ACTIVE' AND b.verification_status = 'APPROVED';

CREATE OR REPLACE VIEW public.product_ratings AS
 SELECT p.product_id,
    p.product_name,
    b.business_name,
    COALESCE(avg(r.rating), (0)::numeric) AS average_rating,
    count(r.review_id) AS review_count
   FROM ((public.products p
     JOIN public.businesses b ON ((p.business_id = b.business_id)))
     LEFT JOIN public.reviews r ON (((p.product_id = r.product_id) AND (r.review_status = 'ACTIVE'))))
  WHERE p.listing_status = 'ACTIVE' AND b.verification_status = 'APPROVED'
  GROUP BY p.product_id, p.product_name, b.business_name;
