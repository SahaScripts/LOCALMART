--
-- PostgreSQL database dump
--

\restrict e5oG9ejrOooNKTqBVgGfbo8KYCBGCMIprF2b1EKDiDlcPkmY80Ek4gVpt1LRtsp

-- Dumped from database version 18.6 (Postgres.app)
-- Dumped by pg_dump version 18.6 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: calculate_order_total(integer); Type: FUNCTION; Schema: public; Owner: sidharthjain
--

CREATE FUNCTION public.calculate_order_total(p_order_id integer) RETURNS numeric
    LANGUAGE sql
    AS $$
    SELECT COALESCE(SUM(quantity * unit_price), 0)
    FROM order_items
    WHERE order_id = p_order_id;
$$;


ALTER FUNCTION public.calculate_order_total(p_order_id integer) OWNER TO sidharthjain;

--
-- Name: check_cart_stock(integer); Type: FUNCTION; Schema: public; Owner: sidharthjain
--

CREATE FUNCTION public.check_cart_stock(p_cart_id integer) RETURNS boolean
    LANGUAGE sql
    AS $$
    SELECT NOT EXISTS (
        SELECT 1
        FROM cart_items ci
        JOIN products p
            ON ci.product_id = p.product_id
        WHERE ci.cart_id = p_cart_id
          AND p.stock_quantity < ci.quantity
    );
$$;


ALTER FUNCTION public.check_cart_stock(p_cart_id integer) OWNER TO sidharthjain;

--
-- Name: check_product_stock(integer, integer); Type: FUNCTION; Schema: public; Owner: sidharthjain
--

CREATE FUNCTION public.check_product_stock(p_product_id integer, p_requested_quantity integer) RETURNS boolean
    LANGUAGE sql
    AS $$
    SELECT stock_quantity >= p_requested_quantity
    FROM products
    WHERE product_id = p_product_id;
$$;


ALTER FUNCTION public.check_product_stock(p_product_id integer, p_requested_quantity integer) OWNER TO sidharthjain;

--
-- Name: place_order(integer); Type: PROCEDURE; Schema: public; Owner: sidharthjain
--

CREATE PROCEDURE public.place_order(IN p_cart_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_user_id INT;
    v_order_id INT;
BEGIN

    -- Get the user who owns the cart
    SELECT user_id
    INTO v_user_id
    FROM carts
    WHERE cart_id = p_cart_id;

    -- Make sure the cart exists
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Cart % does not exist.', p_cart_id;
    END IF;

    -- Make sure the cart is not empty
    IF NOT EXISTS (
        SELECT 1
        FROM cart_items
        WHERE cart_id = p_cart_id
    ) THEN
        RAISE EXCEPTION 'Cart % is empty.', p_cart_id;
    END IF;

    -- Lock the products in this cart
    PERFORM 1
    FROM products p
    JOIN cart_items ci
        ON p.product_id = ci.product_id
    WHERE ci.cart_id = p_cart_id
    FOR UPDATE;

    -- Check stock
    IF NOT check_cart_stock(p_cart_id) THEN
        RAISE EXCEPTION 'Insufficient stock for cart %.', p_cart_id;
    END IF;

    -- Create the order
    INSERT INTO orders (user_id, shipping_address)
    SELECT user_id, address
    FROM users
    WHERE user_id = v_user_id
    RETURNING order_id INTO v_order_id;

    -- Copy cart items into order_items
    INSERT INTO order_items
        (order_id, product_id, quantity, unit_price)
    SELECT
        v_order_id,
        ci.product_id,
        ci.quantity,
        p.price
    FROM cart_items ci
    JOIN products p
        ON ci.product_id = p.product_id
    WHERE ci.cart_id = p_cart_id;

    -- Reduce stock
    UPDATE products p
    SET stock_quantity = p.stock_quantity - ci.quantity
    FROM cart_items ci
    WHERE p.product_id = ci.product_id
      AND ci.cart_id = p_cart_id;

    -- Empty the cart
    DELETE FROM cart_items
    WHERE cart_id = p_cart_id;

    RAISE NOTICE 'Order % successfully created.', v_order_id;

END;
$$;


ALTER PROCEDURE public.place_order(IN p_cart_id integer) OWNER TO sidharthjain;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: businesses; Type: TABLE; Schema: public; Owner: sidharthjain
--

CREATE TABLE public.businesses (
    business_id integer NOT NULL,
    user_id integer NOT NULL,
    business_name character varying(150) NOT NULL,
    description text,
    address character varying(255) NOT NULL,
    city character varying(100) NOT NULL,
    state character varying(100) NOT NULL,
    postal_code character varying(20) NOT NULL,
    phone character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.businesses OWNER TO sidharthjain;

--
-- Name: businesses_business_id_seq; Type: SEQUENCE; Schema: public; Owner: sidharthjain
--

CREATE SEQUENCE public.businesses_business_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.businesses_business_id_seq OWNER TO sidharthjain;

--
-- Name: businesses_business_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sidharthjain
--

ALTER SEQUENCE public.businesses_business_id_seq OWNED BY public.businesses.business_id;


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: sidharthjain
--

CREATE TABLE public.cart_items (
    cart_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_cart_items_quantity CHECK ((quantity > 0))
);


ALTER TABLE public.cart_items OWNER TO sidharthjain;

--
-- Name: carts; Type: TABLE; Schema: public; Owner: sidharthjain
--

CREATE TABLE public.carts (
    cart_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.carts OWNER TO sidharthjain;

--
-- Name: carts_cart_id_seq; Type: SEQUENCE; Schema: public; Owner: sidharthjain
--

CREATE SEQUENCE public.carts_cart_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carts_cart_id_seq OWNER TO sidharthjain;

--
-- Name: carts_cart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sidharthjain
--

ALTER SEQUENCE public.carts_cart_id_seq OWNED BY public.carts.cart_id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: sidharthjain
--

CREATE TABLE public.categories (
    category_id integer NOT NULL,
    category_name character varying(100) NOT NULL,
    description text
);


ALTER TABLE public.categories OWNER TO sidharthjain;

--
-- Name: categories_category_id_seq; Type: SEQUENCE; Schema: public; Owner: sidharthjain
--

CREATE SEQUENCE public.categories_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_category_id_seq OWNER TO sidharthjain;

--
-- Name: categories_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sidharthjain
--

ALTER SEQUENCE public.categories_category_id_seq OWNED BY public.categories.category_id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: sidharthjain
--

CREATE TABLE public.order_items (
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    CONSTRAINT chk_order_items_quantity CHECK ((quantity > 0)),
    CONSTRAINT chk_order_items_unit_price CHECK ((unit_price >= 0.00))
);


ALTER TABLE public.order_items OWNER TO sidharthjain;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: sidharthjain
--

CREATE TABLE public.orders (
    order_id integer NOT NULL,
    user_id integer NOT NULL,
    order_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    order_status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    shipping_address text NOT NULL,
    CONSTRAINT chk_orders_status CHECK (((order_status)::text = ANY ((ARRAY['PENDING'::character varying, 'PROCESSING'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying])::text[])))
);


ALTER TABLE public.orders OWNER TO sidharthjain;

--
-- Name: users; Type: TABLE; Schema: public; Owner: sidharthjain
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'CUSTOMER'::character varying NOT NULL,
    full_name character varying(100) NOT NULL,
    phone character varying(20),
    address text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_users_role CHECK (((role)::text = ANY ((ARRAY['CUSTOMER'::character varying, 'SELLER'::character varying, 'ADMIN'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO sidharthjain;

--
-- Name: customer_order_summary; Type: VIEW; Schema: public; Owner: sidharthjain
--

CREATE VIEW public.customer_order_summary AS
 SELECT u.user_id,
    u.full_name,
    count(DISTINCT o.order_id) AS total_orders,
    COALESCE(sum(oi.quantity), (0)::bigint) AS items_purchased,
    COALESCE(sum(((oi.quantity)::numeric * oi.unit_price)), (0)::numeric) AS total_spent
   FROM ((public.users u
     LEFT JOIN public.orders o ON ((u.user_id = o.user_id)))
     LEFT JOIN public.order_items oi ON ((o.order_id = oi.order_id)))
  WHERE ((u.role)::text = 'CUSTOMER'::text)
  GROUP BY u.user_id, u.full_name;


ALTER VIEW public.customer_order_summary OWNER TO sidharthjain;

--
-- Name: orders_order_id_seq; Type: SEQUENCE; Schema: public; Owner: sidharthjain
--

CREATE SEQUENCE public.orders_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_order_id_seq OWNER TO sidharthjain;

--
-- Name: orders_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sidharthjain
--

ALTER SEQUENCE public.orders_order_id_seq OWNED BY public.orders.order_id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: sidharthjain
--

CREATE TABLE public.products (
    product_id integer NOT NULL,
    business_id integer NOT NULL,
    category_id integer NOT NULL,
    product_name character varying(200) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    stock_quantity integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_products_price CHECK ((price >= 0.00)),
    CONSTRAINT chk_products_stock CHECK ((stock_quantity >= 0))
);


ALTER TABLE public.products OWNER TO sidharthjain;

--
-- Name: product_catalog; Type: VIEW; Schema: public; Owner: sidharthjain
--

CREATE VIEW public.product_catalog AS
 SELECT p.product_id,
    p.product_name,
    b.business_name,
    c.category_name,
    p.description,
    p.price,
    p.stock_quantity
   FROM ((public.products p
     JOIN public.businesses b ON ((p.business_id = b.business_id)))
     JOIN public.categories c ON ((p.category_id = c.category_id)));


ALTER VIEW public.product_catalog OWNER TO sidharthjain;

--
-- Name: product_performance; Type: VIEW; Schema: public; Owner: sidharthjain
--

CREATE VIEW public.product_performance AS
 SELECT p.product_id,
    p.product_name,
    b.business_name,
    c.category_name,
    COALESCE(sum(oi.quantity), (0)::bigint) AS units_sold,
    COALESCE(sum(((oi.quantity)::numeric * oi.unit_price)), (0)::numeric) AS revenue
   FROM (((public.products p
     JOIN public.businesses b ON ((p.business_id = b.business_id)))
     JOIN public.categories c ON ((p.category_id = c.category_id)))
     LEFT JOIN public.order_items oi ON ((p.product_id = oi.product_id)))
  GROUP BY p.product_id, p.product_name, b.business_name, c.category_name;


ALTER VIEW public.product_performance OWNER TO sidharthjain;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: sidharthjain
--

CREATE TABLE public.reviews (
    review_id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    review_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_reviews_rating CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO sidharthjain;

--
-- Name: product_ratings; Type: VIEW; Schema: public; Owner: sidharthjain
--

CREATE VIEW public.product_ratings AS
 SELECT p.product_id,
    p.product_name,
    b.business_name,
    COALESCE(avg(r.rating), (0)::numeric) AS average_rating,
    count(r.review_id) AS review_count
   FROM ((public.products p
     JOIN public.businesses b ON ((p.business_id = b.business_id)))
     LEFT JOIN public.reviews r ON ((p.product_id = r.product_id)))
  GROUP BY p.product_id, p.product_name, b.business_name;


ALTER VIEW public.product_ratings OWNER TO sidharthjain;

--
-- Name: products_product_id_seq; Type: SEQUENCE; Schema: public; Owner: sidharthjain
--

CREATE SEQUENCE public.products_product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_product_id_seq OWNER TO sidharthjain;

--
-- Name: products_product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sidharthjain
--

ALTER SEQUENCE public.products_product_id_seq OWNED BY public.products.product_id;


--
-- Name: reviews_review_id_seq; Type: SEQUENCE; Schema: public; Owner: sidharthjain
--

CREATE SEQUENCE public.reviews_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_review_id_seq OWNER TO sidharthjain;

--
-- Name: reviews_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sidharthjain
--

ALTER SEQUENCE public.reviews_review_id_seq OWNED BY public.reviews.review_id;


--
-- Name: seller_performance; Type: VIEW; Schema: public; Owner: sidharthjain
--

CREATE VIEW public.seller_performance AS
 SELECT b.business_id,
    b.business_name,
    count(DISTINCT o.order_id) AS total_orders,
    sum(oi.quantity) AS items_sold,
    sum(((oi.quantity)::numeric * oi.unit_price)) AS total_revenue
   FROM (((public.businesses b
     JOIN public.products p ON ((b.business_id = p.business_id)))
     JOIN public.order_items oi ON ((p.product_id = oi.product_id)))
     JOIN public.orders o ON ((oi.order_id = o.order_id)))
  GROUP BY b.business_id, b.business_name;


ALTER VIEW public.seller_performance OWNER TO sidharthjain;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: sidharthjain
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO sidharthjain;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sidharthjain
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: businesses business_id; Type: DEFAULT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.businesses ALTER COLUMN business_id SET DEFAULT nextval('public.businesses_business_id_seq'::regclass);


--
-- Name: carts cart_id; Type: DEFAULT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.carts ALTER COLUMN cart_id SET DEFAULT nextval('public.carts_cart_id_seq'::regclass);


--
-- Name: categories category_id; Type: DEFAULT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.categories ALTER COLUMN category_id SET DEFAULT nextval('public.categories_category_id_seq'::regclass);


--
-- Name: orders order_id; Type: DEFAULT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.orders ALTER COLUMN order_id SET DEFAULT nextval('public.orders_order_id_seq'::regclass);


--
-- Name: products product_id; Type: DEFAULT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.products ALTER COLUMN product_id SET DEFAULT nextval('public.products_product_id_seq'::regclass);


--
-- Name: reviews review_id; Type: DEFAULT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.reviews ALTER COLUMN review_id SET DEFAULT nextval('public.reviews_review_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: businesses; Type: TABLE DATA; Schema: public; Owner: sidharthjain
--

COPY public.businesses (business_id, user_id, business_name, description, address, city, state, postal_code, phone, created_at) FROM stdin;
1	3	Fresh Bites	Local bakery offering fresh breads, cakes and snacks.	12 Gandhi Road	Vellore	Tamil Nadu	632004	9876543212	2026-08-25 13:31:18.013867
2	4	Craft Corner	Local handmade business offering unique gifts and crafts.	25 Anna Salai	Chennai	Tamil Nadu	600002	9876543213	2026-08-25 13:31:18.013867
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: sidharthjain
--

COPY public.cart_items (cart_id, product_id, quantity, added_at) FROM stdin;
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: sidharthjain
--

COPY public.carts (cart_id, user_id, created_at) FROM stdin;
1	1	2026-08-25 13:40:47.559083
2	2	2026-08-25 13:40:47.559083
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: sidharthjain
--

COPY public.categories (category_id, category_name, description) FROM stdin;
1	Bakery	Fresh breads, cakes, pastries and baked snacks
2	Beverages	Tea, coffee, juices and other drinks
3	Handicrafts	Locally made handmade crafts and decorative items
4	Gifts	Unique gifts and personalized products
5	Snacks	Local snacks and packaged food items
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: sidharthjain
--

COPY public.order_items (order_id, product_id, quantity, unit_price) FROM stdin;
1	1	1	450.00
1	2	2	120.00
1	5	1	250.00
2	3	3	40.00
2	7	1	650.00
2	6	2	120.00
3	1	1	450.00
3	2	2	120.00
3	5	1	250.00
4	3	3	40.00
4	6	2	120.00
4	7	1	650.00
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: sidharthjain
--

COPY public.orders (order_id, user_id, order_date, order_status, shipping_address) FROM stdin;
1	1	2026-08-25 13:45:23.129774	PENDING	Vellore, Tamil Nadu
2	2	2026-08-25 13:45:34.641169	PENDING	Chennai, Tamil Nadu
3	1	2026-08-25 14:14:56.380189	PENDING	Vellore, Tamil Nadu
4	2	2026-08-25 16:19:46.105505	PENDING	Chennai, Tamil Nadu
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: sidharthjain
--

COPY public.products (product_id, business_id, category_id, product_name, description, price, stock_quantity, created_at) FROM stdin;
4	1	1	Chocolate Brownie	Soft and rich chocolate brownie	80.00	20	2026-08-25 13:35:56.047562
8	2	3	Handmade Wall Decor	Decorative handmade wall hanging	500.00	10	2026-08-25 13:35:56.047562
1	1	1	Chocolate Cake	Freshly baked chocolate cake	450.00	9	2026-08-25 13:35:56.047562
2	1	1	Garlic Bread	Fresh garlic bread with herbs	120.00	23	2026-08-25 13:35:56.047562
5	2	3	Handmade Candle	Decorative handmade scented candle	250.00	14	2026-08-25 13:35:56.047562
3	1	5	Veg Puff	Crispy puff filled with seasoned vegetables	40.00	27	2026-08-25 13:35:56.047562
6	2	3	Wooden Keychain	Handcrafted wooden keychain	120.00	23	2026-08-25 13:35:56.047562
7	2	4	Gift Hamper	Handcrafted gift hamper for special occasions	650.00	7	2026-08-25 13:35:56.047562
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: sidharthjain
--

COPY public.reviews (review_id, order_id, product_id, rating, comment, review_date) FROM stdin;
1	1	1	5	The chocolate cake was fresh and delicious.	2026-08-25 13:48:16.877757
2	1	5	4	Beautiful handmade candle and good quality.	2026-08-25 13:48:16.877757
3	2	7	5	The gift hamper was beautifully made.	2026-08-25 13:48:17.849209
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: sidharthjain
--

COPY public.users (user_id, email, password_hash, role, full_name, phone, address, created_at) FROM stdin;
1	arjun@gmail.com	hashed_password_1	CUSTOMER	Arjun Sharma	9876543210	Vellore, Tamil Nadu	2026-08-25 13:29:03.183346
2	priya@gmail.com	hashed_password_2	CUSTOMER	Priya Kumar	9876543211	Chennai, Tamil Nadu	2026-08-25 13:29:03.183346
3	rahul@freshbites.com	hashed_password_3	SELLER	Rahul Verma	9876543212	Vellore, Tamil Nadu	2026-08-25 13:29:03.183346
4	neha@craftcorner.com	hashed_password_4	SELLER	Neha Singh	9876543213	Chennai, Tamil Nadu	2026-08-25 13:29:03.183346
5	admin@marketplace.com	hashed_password_5	ADMIN	Marketplace Admin	9876543214	Vellore, Tamil Nadu	2026-08-25 13:29:03.183346
\.


--
-- Name: businesses_business_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sidharthjain
--

SELECT pg_catalog.setval('public.businesses_business_id_seq', 2, true);


--
-- Name: carts_cart_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sidharthjain
--

SELECT pg_catalog.setval('public.carts_cart_id_seq', 2, true);


--
-- Name: categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sidharthjain
--

SELECT pg_catalog.setval('public.categories_category_id_seq', 5, true);


--
-- Name: orders_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sidharthjain
--

SELECT pg_catalog.setval('public.orders_order_id_seq', 4, true);


--
-- Name: products_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sidharthjain
--

SELECT pg_catalog.setval('public.products_product_id_seq', 8, true);


--
-- Name: reviews_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sidharthjain
--

SELECT pg_catalog.setval('public.reviews_review_id_seq', 3, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sidharthjain
--

SELECT pg_catalog.setval('public.users_user_id_seq', 5, true);


--
-- Name: businesses businesses_pkey; Type: CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_pkey PRIMARY KEY (business_id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (cart_id, product_id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (cart_id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (order_id, product_id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);


--
-- Name: businesses uq_businesses_user; Type: CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT uq_businesses_user UNIQUE (user_id);


--
-- Name: carts uq_carts_user; Type: CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT uq_carts_user UNIQUE (user_id);


--
-- Name: categories uq_categories_name; Type: CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT uq_categories_name UNIQUE (category_name);


--
-- Name: products uq_products_business_name; Type: CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT uq_products_business_name UNIQUE (business_id, product_name);


--
-- Name: reviews uq_reviews_order_product; Type: CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT uq_reviews_order_product UNIQUE (order_id, product_id);


--
-- Name: users uq_users_email; Type: CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uq_users_email UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: businesses fk_businesses_user; Type: FK CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT fk_businesses_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE RESTRICT;


--
-- Name: cart_items fk_cart_items_cart; Type: FK CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES public.carts(cart_id) ON DELETE CASCADE;


--
-- Name: cart_items fk_cart_items_product; Type: FK CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: carts fk_carts_user; Type: FK CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: order_items fk_order_items_order; Type: FK CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- Name: order_items fk_order_items_product; Type: FK CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE RESTRICT;


--
-- Name: orders fk_orders_user; Type: FK CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE RESTRICT;


--
-- Name: products fk_products_business; Type: FK CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_products_business FOREIGN KEY (business_id) REFERENCES public.businesses(business_id) ON DELETE RESTRICT;


--
-- Name: products fk_products_category; Type: FK CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES public.categories(category_id) ON DELETE RESTRICT;


--
-- Name: reviews fk_reviews_order_item; Type: FK CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fk_reviews_order_item FOREIGN KEY (order_id, product_id) REFERENCES public.order_items(order_id, product_id) ON DELETE CASCADE;


--
-- Name: reviews fk_reviews_product; Type: FK CONSTRAINT; Schema: public; Owner: sidharthjain
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict e5oG9ejrOooNKTqBVgGfbo8KYCBGCMIprF2b1EKDiDlcPkmY80Ek4gVpt1LRtsp

