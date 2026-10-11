-- ============================================================================
-- LOCALMART ENHANCEMENTS MIGRATION
-- 1. Supported Service Areas
-- 2. Extended Business Verification & Locality Metadata
-- 3. Seller-to-Seller Collaborations & Collaboration Products
-- 4. Order Fulfillment (Seller Delivery vs Self Pickup)
-- ============================================================================

-- 1. SERVICE AREAS TABLE
CREATE TABLE IF NOT EXISTS public.service_areas (
    area_id SERIAL PRIMARY KEY,
    area_name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_service_areas_status CHECK (status IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT uq_service_areas_name_city_pin UNIQUE (area_name, city, pincode)
);

CREATE INDEX IF NOT EXISTS idx_service_areas_pincode ON public.service_areas(pincode);
CREATE INDEX IF NOT EXISTS idx_service_areas_city ON public.service_areas(city);

-- Seed Initial Supported Local Areas (Vellore Locality)
INSERT INTO public.service_areas (area_name, city, state, pincode, status)
VALUES
    ('Vellore Town', 'Vellore', 'Tamil Nadu', '632001', 'ACTIVE'),
    ('Katpadi', 'Vellore', 'Tamil Nadu', '632006', 'ACTIVE'),
    ('Gandhi Nagar', 'Vellore', 'Tamil Nadu', '632006', 'ACTIVE'),
    ('Sathuvachari', 'Vellore', 'Tamil Nadu', '632009', 'ACTIVE')
ON CONFLICT (area_name, city, pincode) DO NOTHING;

-- 2. EXTEND BUSINESSES TABLE WITH VERIFICATION & LOCALITY METADATA
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'businesses' AND column_name = 'service_area_id'
    ) THEN
        ALTER TABLE public.businesses
        ADD COLUMN service_area_id INTEGER REFERENCES public.service_areas(area_id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'businesses' AND column_name = 'verification_document'
    ) THEN
        ALTER TABLE public.businesses
        ADD COLUMN verification_document VARCHAR(255);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'businesses' AND column_name = 'verification_submitted_at'
    ) THEN
        ALTER TABLE public.businesses
        ADD COLUMN verification_submitted_at TIMESTAMP WITHOUT TIME ZONE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'businesses' AND column_name = 'verified_at'
    ) THEN
        ALTER TABLE public.businesses
        ADD COLUMN verified_at TIMESTAMP WITHOUT TIME ZONE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'businesses' AND column_name = 'verified_by'
    ) THEN
        ALTER TABLE public.businesses
        ADD COLUMN verified_by INTEGER REFERENCES public.users(user_id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'businesses' AND column_name = 'verification_reason'
    ) THEN
        ALTER TABLE public.businesses
        ADD COLUMN verification_reason TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'businesses' AND column_name = 'latitude'
    ) THEN
        ALTER TABLE public.businesses
        ADD COLUMN latitude NUMERIC(10, 7);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'businesses' AND column_name = 'longitude'
    ) THEN
        ALTER TABLE public.businesses
        ADD COLUMN longitude NUMERIC(10, 7);
    END IF;
END $$;

-- Link existing businesses to default local service area (Vellore Town = 1) and backfill verification proof
UPDATE public.businesses
SET service_area_id = 1,
    verification_document = 'FreshBites_FSSAI_TradeLicense.pdf',
    verification_submitted_at = CURRENT_TIMESTAMP - INTERVAL '15 days',
    verified_at = CURRENT_TIMESTAMP - INTERVAL '14 days',
    verified_by = 5,
    verification_reason = 'Verified physical establishment at Gandhi Road, Vellore and valid FSSAI trade license.'
WHERE business_id = 1 AND verification_document IS NULL;

UPDATE public.businesses
SET service_area_id = 1,
    verification_document = 'CraftCorner_Shop_Establishment.pdf',
    verification_submitted_at = CURRENT_TIMESTAMP - INTERVAL '12 days',
    verified_at = CURRENT_TIMESTAMP - INTERVAL '10 days',
    verified_by = 5,
    verification_reason = 'Verified artisanal workshop at Katpadi Road, Vellore and active business registration.'
WHERE business_id = 2 AND verification_document IS NULL;

UPDATE public.businesses
SET service_area_id = 1,
    verification_status = 'PENDING',
    verification_document = 'TestStore_GST_Certificate.pdf',
    verification_submitted_at = CURRENT_TIMESTAMP - INTERVAL '1 day',
    verified_at = NULL,
    verified_by = NULL,
    verification_reason = NULL
WHERE business_id = 3;

UPDATE public.businesses
SET service_area_id = 1,
    verification_status = 'APPROVED',
    verification_document = 'TestStore2_TradeLicense.pdf',
    verification_submitted_at = CURRENT_TIMESTAMP - INTERVAL '3 days',
    verified_at = CURRENT_TIMESTAMP - INTERVAL '2 days',
    verified_by = 5,
    verification_reason = 'Physical location verified in Vellore Main Road.'
WHERE business_id = 4 AND verification_document IS NULL;

-- 3. COLLABORATIONS TABLE
CREATE TABLE IF NOT EXISTS public.collaborations (
    collaboration_id SERIAL PRIMARY KEY,
    initiator_business_id INTEGER NOT NULL REFERENCES public.businesses(business_id) ON DELETE RESTRICT,
    partner_business_id INTEGER NOT NULL REFERENCES public.businesses(business_id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    collaboration_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_collaborations_status CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED')),
    CONSTRAINT chk_collaborations_different_businesses CHECK (initiator_business_id <> partner_business_id)
);

CREATE INDEX IF NOT EXISTS idx_collab_initiator ON public.collaborations(initiator_business_id);
CREATE INDEX IF NOT EXISTS idx_collab_partner ON public.collaborations(partner_business_id);
CREATE INDEX IF NOT EXISTS idx_collab_status ON public.collaborations(status);

-- 4. COLLABORATION PRODUCTS LINK TABLE
CREATE TABLE IF NOT EXISTS public.collaboration_products (
    collaboration_id INTEGER NOT NULL REFERENCES public.collaborations(collaboration_id) ON DELETE CASCADE,
    business_id INTEGER NOT NULL REFERENCES public.businesses(business_id) ON DELETE RESTRICT,
    product_id INTEGER NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
    PRIMARY KEY (collaboration_id, product_id)
);

-- 5. EXTEND PRODUCTS TABLE FOR COLLABORATIVE PRODUCTS
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'is_collaborative'
    ) THEN
        ALTER TABLE public.products
        ADD COLUMN is_collaborative BOOLEAN DEFAULT FALSE NOT NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'collaboration_id'
    ) THEN
        ALTER TABLE public.products
        ADD COLUMN collaboration_id INTEGER REFERENCES public.collaborations(collaboration_id) ON DELETE SET NULL;
    END IF;
END $$;

-- 6. ORDER FULFILLMENT TABLE
CREATE TABLE IF NOT EXISTS public.order_fulfillment (
    fulfillment_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES public.orders(order_id) ON DELETE CASCADE,
    business_id INTEGER NOT NULL REFERENCES public.businesses(business_id) ON DELETE RESTRICT,
    delivery_method VARCHAR(30) NOT NULL,
    pickup_location TEXT,
    delivery_address TEXT,
    status VARCHAR(30) DEFAULT 'PENDING' NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_fulfillment_delivery_method CHECK (delivery_method IN ('SELLER_DELIVERY', 'SELF_PICKUP'))
);

CREATE INDEX IF NOT EXISTS idx_fulfillment_order ON public.order_fulfillment(order_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_business ON public.order_fulfillment(business_id);

-- Backfill fulfillment for existing historical orders (Defaulting to SELLER_DELIVERY with order shipping address)
INSERT INTO public.order_fulfillment (order_id, business_id, delivery_method, delivery_address, status)
SELECT DISTINCT oi.order_id, p.business_id, 'SELLER_DELIVERY', o.shipping_address, 'FULFILLED'
FROM public.order_items oi
JOIN public.products p ON oi.product_id = p.product_id
JOIN public.orders o ON oi.order_id = o.order_id
WHERE NOT EXISTS (
    SELECT 1 FROM public.order_fulfillment oful
    WHERE oful.order_id = oi.order_id AND oful.business_id = p.business_id
);

-- 7. SEED AN INITIAL REALISTIC ACTIVE COLLABORATION (Fresh Bites x Craft Corner)
INSERT INTO public.collaborations (collaboration_id, initiator_business_id, partner_business_id, title, description, collaboration_type, status, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
    1,
    1,
    2,
    'Bakery & Artisan Hamper Combo',
    'Special pairing of Fresh Bites signature chocolate baked goods with Craft Corner handmade aromatics and decor.',
    'Combo / Bundle',
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    CURRENT_TIMESTAMP - INTERVAL '4 days'
)
ON CONFLICT (collaboration_id) DO NOTHING;

-- Link participating products into collaboration_products
INSERT INTO public.collaboration_products (collaboration_id, business_id, product_id)
VALUES
    (1, 1, 4), -- Chocolate Brownie
    (1, 2, 5)  -- Handmade Candle
ON CONFLICT (collaboration_id, product_id) DO NOTHING;

-- Seed Collaborative Combo Product (Fresh Bites x Craft Corner)
INSERT INTO public.products (product_id, business_id, category_id, product_name, description, price, stock_quantity, listing_status, is_collaborative, collaboration_id)
OVERRIDING SYSTEM VALUE
VALUES (
    11,
    1,
    4, -- Gifts category
    'Bakery & Candle Celebration Combo',
    'A joint gift experience created through collaboration between Fresh Bites (Bakery) and Craft Corner (Artisan Crafts). Includes artisan fudge brownie and handmade aromatic candle.',
    299.00,
    15,
    'ACTIVE',
    TRUE,
    1
)
ON CONFLICT (product_id) DO NOTHING;

-- Adjust sequence values
SELECT setval('public.service_areas_area_id_seq', (SELECT COALESCE(MAX(area_id), 1) FROM public.service_areas));
SELECT setval('public.collaborations_collaboration_id_seq', (SELECT COALESCE(MAX(collaboration_id), 1) FROM public.collaborations));
SELECT setval('public.products_product_id_seq', (SELECT COALESCE(MAX(product_id), 1) FROM public.products));
