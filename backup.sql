--
-- PostgreSQL database dump
--

\restrict LWJVpRe0s1lKl6fOJ2UtegUQTebw2KjXw0PmTYVf2g6MHg4UAqTzjXsaErOxyJq

-- Dumped from database version 18.1 (Debian 18.1-1.pgdg13+2)
-- Dumped by pg_dump version 18.1 (Debian 18.1-1.pgdg13+2)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    full_name text NOT NULL,
    phone text,
    role_id character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.admin_users OWNER TO postgres;

--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campaigns (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    product_owner_id character varying NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    product_type text NOT NULL,
    product_url text,
    services text[] NOT NULL,
    package text NOT NULL,
    budget numeric(10,2) NOT NULL,
    testers_needed integer NOT NULL,
    testers_assigned integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.campaigns OWNER TO postgres;

--
-- Name: conversation_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversation_messages (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    conversation_id character varying NOT NULL,
    sender_id character varying NOT NULL,
    sender_type text NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.conversation_messages OWNER TO postgres;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    product_owner_id character varying NOT NULL,
    group_id character varying NOT NULL,
    leader_id character varying NOT NULL,
    last_message_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.conversations OWNER TO postgres;

--
-- Name: direct_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.direct_messages (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    sender_id character varying NOT NULL,
    sender_type text NOT NULL,
    receiver_id character varying NOT NULL,
    receiver_type text NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.direct_messages OWNER TO postgres;

--
-- Name: freelancers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.freelancers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    full_name text NOT NULL,
    username text NOT NULL,
    phone text NOT NULL,
    country_code text DEFAULT '+966'::text NOT NULL,
    job_title text,
    team_size integer DEFAULT 1,
    services text[] DEFAULT ARRAY[]::text[],
    bio text,
    about_me text,
    profile_image text,
    id_verification text,
    payment_method text,
    account_number text,
    is_verified boolean DEFAULT false,
    accepted_instructions boolean DEFAULT false,
    last_seen timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.freelancers OWNER TO postgres;

--
-- Name: group_join_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_join_requests (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    group_id character varying NOT NULL,
    freelancer_id character varying NOT NULL,
    message text,
    status text DEFAULT 'pending'::text NOT NULL,
    reviewed_at timestamp without time zone,
    review_notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.group_join_requests OWNER TO postgres;

--
-- Name: group_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_members (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    group_id character varying NOT NULL,
    freelancer_id character varying NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    joined_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.group_members OWNER TO postgres;

--
-- Name: group_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_posts (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    group_id character varying NOT NULL,
    author_id character varying NOT NULL,
    content text NOT NULL,
    image_url text,
    likes_count integer DEFAULT 0 NOT NULL,
    comments_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.group_posts OWNER TO postgres;

--
-- Name: group_spectators; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_spectators (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    group_id character varying NOT NULL,
    product_owner_id character varying NOT NULL,
    role text DEFAULT 'spectator'::text NOT NULL,
    joined_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.group_spectators OWNER TO postgres;

--
-- Name: groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groups (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    group_image text,
    portfolio_images text[] DEFAULT ARRAY[]::text[],
    leader_id character varying NOT NULL,
    max_members integer DEFAULT 700 NOT NULL,
    current_members integer DEFAULT 1 NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    average_rating numeric(3,2) DEFAULT 0.00,
    total_ratings integer DEFAULT 0,
    privacy text DEFAULT 'public'::text NOT NULL
);


ALTER TABLE public.groups OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    group_id character varying NOT NULL,
    sender_id character varying NOT NULL,
    content text NOT NULL,
    type text DEFAULT 'text'::text NOT NULL,
    related_project_id character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    user_type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    product_owner_id character varying NOT NULL,
    group_id character varying NOT NULL,
    service_type text NOT NULL,
    quantity integer NOT NULL,
    price_per_unit numeric(10,2) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    platform_fee numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    net_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    leader_commission numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    member_distribution numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    group_members_count integer DEFAULT 1 NOT NULL,
    per_member_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    payment_method text NOT NULL,
    payment_details text,
    status text DEFAULT 'pending'::text NOT NULL,
    paid_at timestamp without time zone,
    completed_at timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    campaign_id character varying NOT NULL,
    product_owner_id character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_method text NOT NULL,
    payment_intent_id text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    name_ar text NOT NULL,
    resource text NOT NULL,
    action text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: post_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_comments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    post_id character varying NOT NULL,
    author_id character varying NOT NULL,
    content text NOT NULL,
    image_url text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.post_comments OWNER TO postgres;

--
-- Name: post_reactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_reactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    post_id character varying NOT NULL,
    user_id character varying NOT NULL,
    type text DEFAULT 'like'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.post_reactions OWNER TO postgres;

--
-- Name: product_owners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_owners (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    full_name text NOT NULL,
    company_name text,
    phone text,
    product_name text,
    product_type text,
    product_description text,
    product_url text,
    services text[] DEFAULT ARRAY[]::text[],
    package text,
    budget text,
    duration text,
    accepted_instructions boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.product_owners OWNER TO postgres;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    product_owner_id character varying NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    target_country text NOT NULL,
    tasks_count integer NOT NULL,
    budget numeric(10,2) NOT NULL,
    deadline timestamp without time zone,
    status text DEFAULT 'pending'::text NOT NULL,
    accepted_by_group_id character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    group_rating numeric(3,2),
    rated_at timestamp without time zone
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    role_id character varying NOT NULL,
    permission_id character varying NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    name_ar text NOT NULL,
    description text,
    is_system_role boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    campaign_id character varying,
    project_id character varying,
    group_id character varying,
    freelancer_id character varying,
    title text NOT NULL,
    description text NOT NULL,
    service_type text NOT NULL,
    reward numeric(10,2) NOT NULL,
    platform_fee numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    net_reward numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    status text DEFAULT 'available'::text NOT NULL,
    assigned_at timestamp without time zone,
    submitted_at timestamp without time zone,
    completed_at timestamp without time zone,
    submission text,
    proof_image text,
    task_url text,
    feedback text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    wallet_id character varying NOT NULL,
    task_id character varying,
    type text NOT NULL,
    amount numeric(10,2) NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    password text NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: wallets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallets (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    freelancer_id character varying NOT NULL,
    balance numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    pending_balance numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    total_earned numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    total_withdrawn numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.wallets OWNER TO postgres;

--
-- Name: withdrawals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.withdrawals (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    freelancer_id character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_method text NOT NULL,
    account_number text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    processed_at timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.withdrawals OWNER TO postgres;

--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_users (id, email, password, full_name, phone, role_id, is_active, last_login, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.campaigns (id, product_owner_id, title, description, product_type, product_url, services, package, budget, testers_needed, testers_assigned, status, start_date, end_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: conversation_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversation_messages (id, conversation_id, sender_id, sender_type, content, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversations (id, product_owner_id, group_id, leader_id, last_message_at, created_at) FROM stdin;
\.


--
-- Data for Name: direct_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.direct_messages (id, sender_id, sender_type, receiver_id, receiver_type, content, is_read, created_at) FROM stdin;
1a1a13cd-f148-4630-ba1a-86ab8bdb097e	97ea9e4b-9d2d-4896-93ec-66fb641ee545	freelancer	963418ea-bfb5-4093-aa38-234a1d6864c5	freelancer	hello	f	2025-11-21 19:40:14.875518
78cd6413-1d52-4485-8048-d7fea8175f5d	97ea9e4b-9d2d-4896-93ec-66fb641ee545	freelancer	963418ea-bfb5-4093-aa38-234a1d6864c5	freelancer	hello	f	2025-11-21 19:40:14.887512
f25a23d2-3f42-4b3f-b4c8-9c089fceb9d8	97ea9e4b-9d2d-4896-93ec-66fb641ee545	freelancer	963418ea-bfb5-4093-aa38-234a1d6864c5	freelancer	test	f	2025-11-21 19:40:18.789248
89e216e9-a28e-4563-bbc3-deb5c97d9102	97ea9e4b-9d2d-4896-93ec-66fb641ee545	freelancer	963418ea-bfb5-4093-aa38-234a1d6864c5	freelancer	test	f	2025-11-21 19:40:18.798848
17edbe62-0d95-4709-b550-eeebb7cd41d2	97ea9e4b-9d2d-4896-93ec-66fb641ee545	freelancer	963418ea-bfb5-4093-aa38-234a1d6864c5	freelancer	hyyy	f	2025-11-21 19:48:59.929514
4f6cbb8f-eafe-48c6-849f-b1c8d7a31198	97ea9e4b-9d2d-4896-93ec-66fb641ee545	freelancer	963418ea-bfb5-4093-aa38-234a1d6864c5	freelancer	ttrtrt	f	2025-11-21 19:49:16.963485
f6866d08-c1c9-4558-93b2-a696d7aef9d3	963418ea-bfb5-4093-aa38-234a1d6864c5	freelancer	97ea9e4b-9d2d-4896-93ec-66fb641ee545	freelancer	test	f	2025-11-21 21:54:54.800116
6ac93c28-4fdd-4eb6-aef1-1d09d31c3a0d	963418ea-bfb5-4093-aa38-234a1d6864c5	freelancer	97ea9e4b-9d2d-4896-93ec-66fb641ee545	freelancer	working !!!!	f	2025-11-21 21:55:02.748373
bd0906c7-ef5f-4da7-a9eb-434f43379ac8	97ea9e4b-9d2d-4896-93ec-66fb641ee545	freelancer	963418ea-bfb5-4093-aa38-234a1d6864c5	freelancer	yes	f	2025-11-21 21:56:02.832275
065c442f-5304-4151-98cf-a65e90c56b2d	f5bfcebd-b5f0-446e-bbae-1da66e060ccf	product_owner	e7c24a26-5875-4c55-b22d-e0d94cafba32	freelancer	hyyy	f	2025-11-21 22:10:17.737865
\.


--
-- Data for Name: freelancers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.freelancers (id, email, password, full_name, username, phone, country_code, job_title, team_size, services, bio, about_me, profile_image, id_verification, payment_method, account_number, is_verified, accepted_instructions, last_seen, created_at) FROM stdin;
97ea9e4b-9d2d-4896-93ec-66fb641ee545	yassinkokabi4@gmail.com	$2b$10$R4eHLQ3c5jm8PbC57Q.8W.6Pwt7AJsOsVHOBhl1ZgLYl5R9xNY1RS	yassine	yassinex	687802700	+212	devloper	1	{"اختبار تطبيقات","تقييم تطبيقات Android","تقييم مواقع إلكترونية"}	anything hshshh shs sh s	sdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd	/uploads/profile/1763327268349-Professional_developer_headshot_portrait_108be52c.png		محفظة سُمُوّ		f	t	\N	2025-11-16 21:07:52.964413
e7c24a26-5875-4c55-b22d-e0d94cafba32	abdoouchen@gmail.com	$2b$10$GhX6.fdjqkQqF3j9rMS6iu0S8hUqGQXNqwPta10hnOsmHMxwwVs7m	ahmad	ahmad	687802700	+212	tester	1	{"تقييم تطبيقات Android","اختبار تطبيقات","تقييم مواقع إلكترونية"}	im web devloper and app tester	ahmad from morocco tester only this hhhhhhhhhhhhhhhhhhh	/uploads/profile/1763337097225-close-up-profile-view-of-pensive-upset-african-american-man-look-in-distance-thinking-of-personal-problems-thoughtful-sad-biracial-male-feel-depressed-lost-in-thoughts-pondering-having-dilemma-photo.jpg		محفظة سُمُوّ		f	t	\N	2025-11-16 23:51:47.649818
c1673205-885d-432f-a757-ae40abb9c40a	test@gmail.com	$2b$10$MP9CE4ZbAO2e8QLWN7VngudDvuraotzakDg/MaeF2w40p32.wPtHO	amal	amalita	687802700	+966	tester	1	{"اختبار تطبيقات"}	testttttttttttttttttttttttttt	testerrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr	/uploads/profile/1763337811902-gettyimages-1450268558-612x612.jpg		محفظة سُمُوّ		f	t	\N	2025-11-17 00:03:41.195799
963418ea-bfb5-4093-aa38-234a1d6864c5	ibrahim@gmail.com	$2b$10$E/PaW21X7C4/C157Xw/fweNZ1J6nBo35PBVBue.vS95tbWeDx5f3q	ibrahim	ibrahim	687802700	+966	reviewer	1	{"تقييم تطبيقات Android"}	review tttttttttttttttttttttttt	rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr	/uploads/profile/1763338027811-young-asian-personal-trainer-posing-on-gray-background-photo.jpg		محفظة سُمُوّ		f	t	\N	2025-11-17 00:07:14.135633
f8b68a45-7074-4c71-9a10-377cf93266cd	hanan@gmail.com	$2b$10$HOj3mWRmCQ.QxPjR2FuRxud1bdfyiiTo3X5KB9T3lUoIfz./mmmiy	hanan	hananita	687802700	+966	wala	1	{"اختبار تطبيقات"}	test uuuuuuuuuuuuuuuuuuuuuuuu	dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd	/uploads/profile/1763338130477-45fbf1167b0a2c7642b58b46ed96befb.jpg		محفظة سُمُوّ		f	t	\N	2025-11-17 00:08:56.89422
\.


--
-- Data for Name: group_join_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_join_requests (id, group_id, freelancer_id, message, status, reviewed_at, review_notes, created_at) FROM stdin;
0847ab33-6a79-47ea-a54b-7f7d25b9e184	7c81a217-dc67-4032-9e19-79480e7a26bb	963418ea-bfb5-4093-aa38-234a1d6864c5	\N	approved	2025-11-21 21:58:10.793	\N	2025-11-21 21:57:24.256
\.


--
-- Data for Name: group_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_members (id, group_id, freelancer_id, role, joined_at) FROM stdin;
519209f9-4b1e-439a-984e-f374e756e78d	eb2d3ef3-edd4-46b4-9681-f93f149cbd0f	97ea9e4b-9d2d-4896-93ec-66fb641ee545	leader	2025-11-16 21:28:13.077818
008130ee-4f01-469d-b36d-d5e8e2e96c4b	dfeb9c5e-9a2c-4fbe-8a1f-a938ce79833c	97ea9e4b-9d2d-4896-93ec-66fb641ee545	leader	2025-11-16 21:36:05.677467
08400b97-5e95-4f47-ae22-40120cb80419	b0eda34c-3565-48ce-ba4c-28e6e8bbf2c3	97ea9e4b-9d2d-4896-93ec-66fb641ee545	leader	2025-11-16 21:40:19.003061
53949a33-f17e-4c64-a110-9aff96238adb	d3b804cf-3614-4cf1-bbbd-54d83bd8ca0c	97ea9e4b-9d2d-4896-93ec-66fb641ee545	leader	2025-11-16 21:40:25.474803
5c794e82-de55-465b-90f6-b10681e4f10a	3dca4242-68c5-4c60-8dfa-ccdbdb597faf	97ea9e4b-9d2d-4896-93ec-66fb641ee545	leader	2025-11-16 21:40:26.354106
d27558ad-0247-4776-93f2-dd6d682d463b	0a25fc73-8c79-43f5-929a-dcd2ccfe6832	97ea9e4b-9d2d-4896-93ec-66fb641ee545	leader	2025-11-16 21:41:08.235809
c6297d86-c43d-4c4f-bec7-901b8acbb858	51656a65-009d-4a41-a6b6-63fa4e9a0709	97ea9e4b-9d2d-4896-93ec-66fb641ee545	leader	2025-11-16 21:42:39.307435
08ae049a-4cd9-493e-9dde-52e5b1917f06	a9961225-264a-4901-8bf7-0b8c25a1f564	97ea9e4b-9d2d-4896-93ec-66fb641ee545	leader	2025-11-16 21:58:35.250602
539d7e45-25c0-47bd-b4c7-bab016889a59	7c81a217-dc67-4032-9e19-79480e7a26bb	97ea9e4b-9d2d-4896-93ec-66fb641ee545	leader	2025-11-16 22:14:04.117145
704d49c7-e013-4537-b51f-7c0a2d73a281	b1205135-e0b1-46c4-91ec-fad7757927ac	97ea9e4b-9d2d-4896-93ec-66fb641ee545	member	2025-11-16 23:21:35.281271
6771cdb6-3ac7-46a5-95df-ec8ed1e1998f	7c81a217-dc67-4032-9e19-79480e7a26bb	e7c24a26-5875-4c55-b22d-e0d94cafba32	member	2025-11-16 23:53:27.500143
1adcc793-50e4-4433-b268-c60122fb9414	a9961225-264a-4901-8bf7-0b8c25a1f564	e7c24a26-5875-4c55-b22d-e0d94cafba32	member	2025-11-16 23:53:40.511505
9b458993-8b0f-45c8-804c-8b0f37faf599	7c81a217-dc67-4032-9e19-79480e7a26bb	c1673205-885d-432f-a757-ae40abb9c40a	member	2025-11-17 00:03:51.292123
75bcc6a2-e447-4050-9023-6d1e3e7a11d6	7c81a217-dc67-4032-9e19-79480e7a26bb	963418ea-bfb5-4093-aa38-234a1d6864c5	member	2025-11-21 21:58:10.804546
\.


--
-- Data for Name: group_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_posts (id, group_id, author_id, content, image_url, likes_count, comments_count, created_at, updated_at) FROM stdin;
96f56943-9be9-413b-8b9f-8827e2ad48f6	b1205135-e0b1-46c4-91ec-fad7757927ac	97ea9e4b-9d2d-4896-93ec-66fb641ee545	test	\N	0	0	2025-11-16 22:09:45.469773	2025-11-16 22:09:45.469773
0acee0df-59eb-4c26-88ae-355abd9211cd	7c81a217-dc67-4032-9e19-79480e7a26bb	97ea9e4b-9d2d-4896-93ec-66fb641ee545	come rate this resturant \nhttps://maps.app.goo.gl/ubHRV9Cfa2NoDt2d7	\N	1	0	2025-11-17 19:33:33.011057	2025-11-17 21:06:44.273
48abcb50-5bbd-4503-ae13-8f1616ac4767	7c81a217-dc67-4032-9e19-79480e7a26bb	97ea9e4b-9d2d-4896-93ec-66fb641ee545	fgfg	\N	1	0	2025-11-21 15:59:01.530407	2025-11-21 15:59:17.321
de3db1d3-f1e3-4aef-a724-d458d54a8fd1	7c81a217-dc67-4032-9e19-79480e7a26bb	97ea9e4b-9d2d-4896-93ec-66fb641ee545	dfdf	\N	1	0	2025-11-19 16:25:37.0626	2025-11-21 15:59:21.316
22727c2b-dea9-4e31-951d-96b13077560c	7c81a217-dc67-4032-9e19-79480e7a26bb	97ea9e4b-9d2d-4896-93ec-66fb641ee545	cvcv	\N	2	0	2025-11-21 15:59:11.672076	2025-11-21 16:20:36.617
ceb899ab-5bcd-4371-9ca4-95561420ff2f	7c81a217-dc67-4032-9e19-79480e7a26bb	97ea9e4b-9d2d-4896-93ec-66fb641ee545	gfgfgfgdf	\N	2	3	2025-11-21 16:18:30.342503	2025-11-21 16:59:38.182
ca4520c5-f1b8-4f02-96b4-42d43c5c11d0	7c81a217-dc67-4032-9e19-79480e7a26bb	97ea9e4b-9d2d-4896-93ec-66fb641ee545	test	/uploads/post/1763744385014-111ebb234462087.Y3JvcCw5MjAsNzIwLDE4MCww.webp	0	0	2025-11-21 16:59:58.147982	2025-11-21 16:59:58.147982
7f3cf592-3470-4d62-b217-d9fcc768cf7e	7c81a217-dc67-4032-9e19-79480e7a26bb	97ea9e4b-9d2d-4896-93ec-66fb641ee545	testtt	\N	0	0	2025-11-21 17:20:45.478549	2025-11-21 17:20:45.478549
392dbc21-8486-4b6e-91b9-73c29c8ef239	7c81a217-dc67-4032-9e19-79480e7a26bb	97ea9e4b-9d2d-4896-93ec-66fb641ee545	test	\N	0	0	2025-11-21 17:24:41.706753	2025-11-21 17:24:41.706753
050bbe7b-2738-4fcb-b43f-c73d26a1deb8	7c81a217-dc67-4032-9e19-79480e7a26bb	97ea9e4b-9d2d-4896-93ec-66fb641ee545	ttttttttttt	\N	0	0	2025-11-21 17:37:23.5308	2025-11-21 17:37:23.5308
8105a234-ab2e-4012-8010-f2dfa52481df	7c81a217-dc67-4032-9e19-79480e7a26bb	97ea9e4b-9d2d-4896-93ec-66fb641ee545	test	\N	0	0	2025-11-21 17:53:22.738061	2025-11-21 17:53:22.738061
\.


--
-- Data for Name: group_spectators; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_spectators (id, group_id, product_owner_id, role, joined_at) FROM stdin;
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.groups (id, name, description, group_image, portfolio_images, leader_id, max_members, current_members, status, created_at, average_rating, total_ratings, privacy) FROM stdin;
eb2d3ef3-edd4-46b4-9681-f93f149cbd0f	grow members	we make anyone famous	\N	{}	97ea9e4b-9d2d-4896-93ec-66fb641ee545	100	2	active	2025-11-16 21:28:13.068177	0.00	0	public
dfeb9c5e-9a2c-4fbe-8a1f-a938ce79833c	test	test	\N	{}	97ea9e4b-9d2d-4896-93ec-66fb641ee545	100	2	active	2025-11-16 21:36:05.670273	0.00	0	public
b0eda34c-3565-48ce-ba4c-28e6e8bbf2c3	yassin	sdsdsd	\N	{}	97ea9e4b-9d2d-4896-93ec-66fb641ee545	100	2	active	2025-11-16 21:40:18.994986	0.00	0	public
d3b804cf-3614-4cf1-bbbd-54d83bd8ca0c	yassin	sdsdsd	\N	{}	97ea9e4b-9d2d-4896-93ec-66fb641ee545	100	2	active	2025-11-16 21:40:25.468155	0.00	0	public
3dca4242-68c5-4c60-8dfa-ccdbdb597faf	yassin	sdsdsd	\N	{}	97ea9e4b-9d2d-4896-93ec-66fb641ee545	100	2	active	2025-11-16 21:40:26.345872	0.00	0	public
0a25fc73-8c79-43f5-929a-dcd2ccfe6832	yassin	sdsdsd	\N	{}	97ea9e4b-9d2d-4896-93ec-66fb641ee545	100	2	active	2025-11-16 21:41:08.222172	0.00	0	public
51656a65-009d-4a41-a6b6-63fa4e9a0709	yassin	sd	\N	{}	97ea9e4b-9d2d-4896-93ec-66fb641ee545	50	2	active	2025-11-16 21:42:39.299913	0.00	0	public
af67e584-1f49-40e9-8324-ee99cc0c6a20	My Team	we are a friends that we make everything famose	\N	{}	97ea9e4b-9d2d-4896-93ec-66fb641ee545	99	0	active	2025-11-16 21:17:35.569281	0.00	0	public
edb96665-2026-4394-9eb7-a828f236281a	Grow Team	we make anyone famose	\N	{}	97ea9e4b-9d2d-4896-93ec-66fb641ee545	97	0	active	2025-11-16 21:27:27.275101	0.00	0	public
8abe0c35-0abb-4151-9e25-f09ce9c744fd	Grow Team	we make anyone famose	\N	{}	97ea9e4b-9d2d-4896-93ec-66fb641ee545	97	0	active	2025-11-16 21:21:41.172404	0.00	0	public
6e57aa7a-0ae7-44b6-990d-5c908e22b34c	My Team	we are a friends that we make everything famose	\N	{}	97ea9e4b-9d2d-4896-93ec-66fb641ee545	99	0	active	2025-11-16 21:20:41.661916	0.00	0	public
94a05e78-58ca-43db-af6c-cd911f1a9d8f	yassin	ggggggggg	\N	{}	97ea9e4b-9d2d-4896-93ec-66fb641ee545	50	0	active	2025-11-16 21:34:31.689844	0.00	0	public
b1205135-e0b1-46c4-91ec-fad7757927ac	yassin	sd	\N	{}	97ea9e4b-9d2d-4896-93ec-66fb641ee545	50	1	active	2025-11-16 21:50:01.995693	0.00	0	public
a9961225-264a-4901-8bf7-0b8c25a1f564	test	test	\N	{}	97ea9e4b-9d2d-4896-93ec-66fb641ee545	50	3	active	2025-11-16 21:58:35.241855	0.00	0	public
7c81a217-dc67-4032-9e19-79480e7a26bb	test	test	/uploads/group/1763331240070-Yellow Gradient Background Minimal UI Mockup Smartphone Instagram Post for Mobile Application.png	{}	97ea9e4b-9d2d-4896-93ec-66fb641ee545	50	5	active	2025-11-16 22:14:04.106924	0.00	0	private
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, group_id, sender_id, content, type, related_project_id, created_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, user_type, title, message, type, is_read, created_at) FROM stdin;
ca27f3f9-46bc-4368-b7c3-d365309b50bd	97ea9e4b-9d2d-4896-93ec-66fb641ee545	freelancer	عضو جديد انضم للجروب	انضم عضو جديد إلى جروب "yassin"	group_member_joined	f	2025-11-16 22:26:53.71819
05870b7b-0410-4a79-9a5e-a3751e28b8e7	97ea9e4b-9d2d-4896-93ec-66fb641ee545	freelancer	عضو جديد انضم للجروب	انضم عضو جديد إلى جروب "yassin"	group_member_joined	f	2025-11-16 23:21:35.310085
07a3b7e6-86fe-4f02-8eaf-4a8870d907b5	97ea9e4b-9d2d-4896-93ec-66fb641ee545	freelancer	عضو جديد انضم للجروب	انضم عضو جديد إلى جروب "test"	group_member_joined	f	2025-11-16 23:53:27.519886
c2191f3a-5ef1-41bd-8c8e-653409ad3d72	97ea9e4b-9d2d-4896-93ec-66fb641ee545	freelancer	عضو جديد انضم للجروب	انضم عضو جديد إلى جروب "test"	group_member_joined	f	2025-11-16 23:53:40.533491
f2cb98fd-e607-4986-a97b-dccf4c89b9ce	97ea9e4b-9d2d-4896-93ec-66fb641ee545	freelancer	عضو جديد انضم للجروب	انضم عضو جديد إلى جروب "test"	group_member_joined	f	2025-11-17 00:03:51.311205
693a1b6d-f51d-45b3-ba9c-c1b4c17c41ca	97ea9e4b-9d2d-4896-93ec-66fb641ee545	freelancer	عضو جديد انضم للجروب	انضم عضو جديد إلى جروب "test"	group_member_joined	f	2025-11-17 00:07:26.81767
fafa4a86-a627-4464-b6a2-6c6526ec321a	97ea9e4b-9d2d-4896-93ec-66fb641ee545	freelancer	عضو جديد انضم للجروب	انضم عضو جديد إلى جروب "test"	group_member_joined	f	2025-11-17 00:09:08.264268
feafc5ce-5b7b-4a05-8fae-1d09001f711b	f8b68a45-7074-4c71-9a10-377cf93266cd	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-19 16:25:37.090738
6d2a39ae-fee2-4b10-92b1-0f18bafaec5e	963418ea-bfb5-4093-aa38-234a1d6864c5	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-19 16:25:37.103561
f88aecc1-330e-40e8-a42e-05f7017912f9	c1673205-885d-432f-a757-ae40abb9c40a	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-19 16:25:37.114143
3255d9cc-8ee2-4372-bede-af31e7aaa209	e7c24a26-5875-4c55-b22d-e0d94cafba32	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-19 16:25:37.123964
ac43c0c7-cce1-42c5-b678-02d312742075	f8b68a45-7074-4c71-9a10-377cf93266cd	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 15:59:01.552371
a0381088-df18-4c96-b8fa-30f23024ef4a	963418ea-bfb5-4093-aa38-234a1d6864c5	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 15:59:01.564313
790503e8-37bb-4a04-ae9a-c272c932b784	c1673205-885d-432f-a757-ae40abb9c40a	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 15:59:01.573279
723ff4e5-a892-4d29-a746-e1ac0e03d6a6	e7c24a26-5875-4c55-b22d-e0d94cafba32	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 15:59:01.582468
4895304c-d23c-4119-a0d6-22baa5efc9e8	f8b68a45-7074-4c71-9a10-377cf93266cd	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 15:59:11.690219
3ce6f774-72ee-404c-a538-88fddd126386	963418ea-bfb5-4093-aa38-234a1d6864c5	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 15:59:11.701607
9c4c3e2e-3a28-47af-b126-99ad59ed049d	c1673205-885d-432f-a757-ae40abb9c40a	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 15:59:11.712908
508de550-3077-4284-ac3e-90d5cb5ba983	e7c24a26-5875-4c55-b22d-e0d94cafba32	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 15:59:11.722531
819cb5f8-4158-4aa9-8833-a2a52fd0c98a	f8b68a45-7074-4c71-9a10-377cf93266cd	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 16:18:30.358508
63d17c88-df56-442c-973f-8984acd30735	963418ea-bfb5-4093-aa38-234a1d6864c5	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 16:18:30.367093
0bd668e6-6c3d-4634-967e-616276a04b64	c1673205-885d-432f-a757-ae40abb9c40a	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 16:18:30.377482
8e5ac933-041c-47b4-9b94-68dfb840f127	e7c24a26-5875-4c55-b22d-e0d94cafba32	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 16:18:30.385886
d7c296c4-1610-497b-919e-b5ab2c529f3d	f8b68a45-7074-4c71-9a10-377cf93266cd	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 16:59:58.214214
98e3be9b-65af-4ccc-aff6-fd5defb39d3b	963418ea-bfb5-4093-aa38-234a1d6864c5	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 16:59:58.227932
700b5e60-8acc-4c7f-b633-6e60cbdf68c5	c1673205-885d-432f-a757-ae40abb9c40a	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 16:59:58.241514
105f32da-8580-4850-adba-a79807ad4807	e7c24a26-5875-4c55-b22d-e0d94cafba32	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 16:59:58.253385
01496fa5-2ea6-48e7-945e-e5652316e1bd	f8b68a45-7074-4c71-9a10-377cf93266cd	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 17:20:45.503615
7bd7ce44-05ca-46a3-984c-ba473074e576	963418ea-bfb5-4093-aa38-234a1d6864c5	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 17:20:45.51766
cb16316c-6cea-4465-a86d-1bc8c043a79a	c1673205-885d-432f-a757-ae40abb9c40a	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 17:20:45.535487
64ce6498-e1b8-498a-919a-d9b1f1baa9cc	e7c24a26-5875-4c55-b22d-e0d94cafba32	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 17:20:45.558607
8b853451-3704-4374-9f4f-9a6d41eb8b42	f8b68a45-7074-4c71-9a10-377cf93266cd	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 17:24:41.724617
5cb6a8d1-4fe6-4563-b51c-47fb694482ac	963418ea-bfb5-4093-aa38-234a1d6864c5	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 17:24:41.735906
de97427f-aa4c-48ad-9a57-76ea6b122a8a	c1673205-885d-432f-a757-ae40abb9c40a	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 17:24:41.745758
876ea79c-19bd-43ed-9f3b-db061fb5fda5	e7c24a26-5875-4c55-b22d-e0d94cafba32	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 17:24:41.757552
68918e13-8672-4fb4-b0b9-d2a83b3e525a	f8b68a45-7074-4c71-9a10-377cf93266cd	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 17:37:23.555818
a04a4afc-d1c5-4a83-b22a-38368a3a9463	963418ea-bfb5-4093-aa38-234a1d6864c5	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 17:37:23.572095
769247ab-f709-4065-b6b3-c37a71921663	c1673205-885d-432f-a757-ae40abb9c40a	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 17:37:23.584373
fce33ba7-dcde-4779-a4fa-1bab8ed61f95	e7c24a26-5875-4c55-b22d-e0d94cafba32	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 17:37:23.595602
7a08343d-bad2-4c41-b390-606e82ab04cb	f8b68a45-7074-4c71-9a10-377cf93266cd	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 17:53:22.777469
cdcc89ac-49e6-4761-8dda-2881b1e86c2c	963418ea-bfb5-4093-aa38-234a1d6864c5	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 17:53:22.787503
23190335-5410-4243-8c97-00567391c49d	c1673205-885d-432f-a757-ae40abb9c40a	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 17:53:22.79756
0d91c9d3-1338-422c-b750-09316419e097	e7c24a26-5875-4c55-b22d-e0d94cafba32	freelancer	مهمة جديدة	تم إنشاء مهمة جديدة لك من منشور قائد الجروب: test	task_assigned	f	2025-11-21 17:53:22.808633
61aff295-efec-4fec-be2b-18a5258e82b7	f8b68a45-7074-4c71-9a10-377cf93266cd	freelancer	تمت إزالتك من الجروب	تمت إزالتك من جروب "test"	group_member_removed	f	2025-11-21 18:10:23.387596
0f603ece-685e-4bcc-b85a-f1955104f045	97ea9e4b-9d2d-4896-93ec-66fb641ee545	freelancer	طلب انضمام جديد	طلب انضمام من 963418ea-bfb5-4093-aa38-234a1d6864c5 إلى مجموعة "test"	group_join_requested	f	2025-11-21 21:57:24.262599
49f8b3eb-ef4c-4347-81d8-26b3408f317c	963418ea-bfb5-4093-aa38-234a1d6864c5	freelancer	تم قبول طلب انضمامك	تم قبول طلب انضمامك لجروب "test"	group_join_approved	f	2025-11-21 21:58:10.827121
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, product_owner_id, group_id, service_type, quantity, price_per_unit, total_amount, platform_fee, net_amount, leader_commission, member_distribution, group_members_count, per_member_amount, payment_method, payment_details, status, paid_at, completed_at, notes, created_at, updated_at) FROM stdin;
7f0ccc01-e906-4ba0-bcf7-f0f76545083a	f5bfcebd-b5f0-446e-bbae-1da66e060ccf	7c81a217-dc67-4032-9e19-79480e7a26bb	social_media_single	1	700.00	700.00	10.00	690.00	3.00	687.00	5	137.40	bank_card	55555555554844444	pending	\N	\N	\N	2025-11-21 21:38:58.81989	2025-11-21 21:38:58.81989
e625a1ef-5363-4ad4-94ad-f99bd90acea0	f5bfcebd-b5f0-446e-bbae-1da66e060ccf	a9961225-264a-4901-8bf7-0b8c25a1f564	social_media_dual	1	1200.00	1200.00	10.00	1190.00	3.00	1187.00	3	395.67	vodafone_cash	55555555554844444	pending	\N	\N	\N	2025-11-21 21:39:22.491625	2025-11-21 21:39:22.491625
18974d0f-a0b1-417c-8169-251968de9b7a	f5bfcebd-b5f0-446e-bbae-1da66e060ccf	7c81a217-dc67-4032-9e19-79480e7a26bb	ios_reviews	100	1.00	100.00	10.00	90.00	3.00	87.00	5	17.40	bank_card	414444444444444444444	pending	\N	\N	\N	2025-11-21 22:09:52.023975	2025-11-21 22:09:52.023975
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, campaign_id, product_owner_id, amount, payment_method, payment_intent_id, status, created_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, name, name_ar, resource, action, description, created_at) FROM stdin;
\.


--
-- Data for Name: post_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_comments (id, post_id, author_id, content, image_url, created_at) FROM stdin;
534dc6a7-150a-4993-b341-121cc52ad209	ceb899ab-5bcd-4371-9ca4-95561420ff2f	963418ea-bfb5-4093-aa38-234a1d6864c5	hhhth	\N	2025-11-21 16:39:53.305317
ab52bfe5-4f81-47f6-bcbf-b0ae4350ce31	ceb899ab-5bcd-4371-9ca4-95561420ff2f	963418ea-bfb5-4093-aa38-234a1d6864c5	hgh	\N	2025-11-21 16:40:07.431725
b97d6e82-c514-4fd7-9d97-76af26aa81ba	ceb899ab-5bcd-4371-9ca4-95561420ff2f	97ea9e4b-9d2d-4896-93ec-66fb641ee545	tret	/uploads/post/1763744372091-111ebb234462087.Y3JvcCw5MjAsNzIwLDE4MCww.webp	2025-11-21 16:59:38.173532
\.


--
-- Data for Name: post_reactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_reactions (id, post_id, user_id, type, created_at) FROM stdin;
64a671c1-5eab-4670-9f71-c867617eaff7	0acee0df-59eb-4c26-88ae-355abd9211cd	97ea9e4b-9d2d-4896-93ec-66fb641ee545	like	2025-11-17 21:06:44.259775
d3c252d3-20e8-45a8-be27-ef67434317fb	22727c2b-dea9-4e31-951d-96b13077560c	97ea9e4b-9d2d-4896-93ec-66fb641ee545	like	2025-11-21 15:59:16.62127
1d06f1e9-93b9-4653-943c-a24595a68fbc	48abcb50-5bbd-4503-ae13-8f1616ac4767	97ea9e4b-9d2d-4896-93ec-66fb641ee545	like	2025-11-21 15:59:17.316465
cc45eeb7-cab6-4c73-8e43-f8c95dfcf8e4	de3db1d3-f1e3-4aef-a724-d458d54a8fd1	97ea9e4b-9d2d-4896-93ec-66fb641ee545	like	2025-11-21 15:59:21.30833
7092be4b-df85-4ab4-9cd4-b94f15ddcca0	ceb899ab-5bcd-4371-9ca4-95561420ff2f	97ea9e4b-9d2d-4896-93ec-66fb641ee545	like	2025-11-21 16:18:32.885111
51cccea6-0498-4b95-95ee-e356e55cfedb	22727c2b-dea9-4e31-951d-96b13077560c	963418ea-bfb5-4093-aa38-234a1d6864c5	like	2025-11-21 16:20:36.613571
b202ce02-6178-4776-a935-358f82bf2c56	ceb899ab-5bcd-4371-9ca4-95561420ff2f	963418ea-bfb5-4093-aa38-234a1d6864c5	like	2025-11-21 16:48:06.665346
\.


--
-- Data for Name: product_owners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_owners (id, email, password, full_name, company_name, phone, product_name, product_type, product_description, product_url, services, package, budget, duration, accepted_instructions, created_at) FROM stdin;
f5bfcebd-b5f0-446e-bbae-1da66e060ccf	owner@gmail.com	$2b$10$gcNnJG1T6XU8ef5hdplqVuqlE28G8IKQ/mGEsY5gBRSImC.6O0TgW	ahmad owner	\N	\N	\N	\N	\N	\N	{google_play_review}	\N	\N	\N	t	2025-11-21 21:36:45.828283
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, product_owner_id, title, description, target_country, tasks_count, budget, deadline, status, accepted_by_group_id, created_at, updated_at, group_rating, rated_at) FROM stdin;
bebfbb22-ac4b-4c05-85b7-1746c909e650	f5bfcebd-b5f0-446e-bbae-1da66e060ccf	test	test	السعودية	100	100.00	\N	pending	\N	2025-11-21 21:37:52.163846	2025-11-21 21:37:52.163846	\N	\N
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (role_id, permission_id) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, name_ar, description, is_system_role, created_at) FROM stdin;
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, campaign_id, project_id, group_id, freelancer_id, title, description, service_type, reward, platform_fee, net_reward, status, assigned_at, submitted_at, completed_at, submission, proof_image, task_url, feedback, created_at) FROM stdin;
adcfc99f-3e34-48b8-9a77-72ec90824f2b	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	f8b68a45-7074-4c71-9a10-377cf93266cd	مهمة من منشور المجموعة: dfdf	dfdf	community_post	0.00	0.00	0.00	assigned	\N	\N	\N	\N	\N	/posts/de3db1d3-f1e3-4aef-a724-d458d54a8fd1	\N	2025-11-19 16:25:37.081761
ab3d2bc1-34e5-4994-bc57-0cf611b84943	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	963418ea-bfb5-4093-aa38-234a1d6864c5	مهمة من منشور المجموعة: dfdf	dfdf	community_post	0.00	0.00	0.00	assigned	\N	\N	\N	\N	\N	/posts/de3db1d3-f1e3-4aef-a724-d458d54a8fd1	\N	2025-11-19 16:25:37.098173
82163e69-3282-4ca5-a064-764963924785	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	c1673205-885d-432f-a757-ae40abb9c40a	مهمة من منشور المجموعة: dfdf	dfdf	community_post	0.00	0.00	0.00	assigned	\N	\N	\N	\N	\N	/posts/de3db1d3-f1e3-4aef-a724-d458d54a8fd1	\N	2025-11-19 16:25:37.108822
a34bf038-77ed-415b-bc84-02a5b022bc79	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	e7c24a26-5875-4c55-b22d-e0d94cafba32	مهمة من منشور المجموعة: dfdf	dfdf	community_post	0.00	0.00	0.00	assigned	\N	\N	\N	\N	\N	/posts/de3db1d3-f1e3-4aef-a724-d458d54a8fd1	\N	2025-11-19 16:25:37.119974
48836f1b-1117-4838-9b9c-9035102390fb	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	f8b68a45-7074-4c71-9a10-377cf93266cd	cvcvcv	fgfg	community_post	0.00	0.00	0.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community	\N	2025-11-21 15:59:01.545695
5735f498-636a-429e-aa03-9ab5f674d47e	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	963418ea-bfb5-4093-aa38-234a1d6864c5	cvcvcv	fgfg	community_post	0.00	0.00	0.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community	\N	2025-11-21 15:59:01.559072
d0b4a0e6-3b09-494f-8529-35266bc54722	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	c1673205-885d-432f-a757-ae40abb9c40a	cvcvcv	fgfg	community_post	0.00	0.00	0.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community	\N	2025-11-21 15:59:01.569033
85cb7883-1fb3-4c13-b24f-fbbc22dac69f	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	e7c24a26-5875-4c55-b22d-e0d94cafba32	cvcvcv	fgfg	community_post	0.00	0.00	0.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community	\N	2025-11-21 15:59:01.578392
00d723fa-9bbd-4f59-987b-8f91718dda46	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	f8b68a45-7074-4c71-9a10-377cf93266cd	cvcv	cvcv	community_post	0.00	0.00	0.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community	\N	2025-11-21 15:59:11.682342
8f3dd2c4-51c8-4022-8033-0576cf123373	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	963418ea-bfb5-4093-aa38-234a1d6864c5	cvcv	cvcv	community_post	0.00	0.00	0.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community	\N	2025-11-21 15:59:11.695953
b5c6d42e-8d83-48dd-a9e1-b0e92230a666	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	c1673205-885d-432f-a757-ae40abb9c40a	cvcv	cvcv	community_post	0.00	0.00	0.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community	\N	2025-11-21 15:59:11.707209
3c8f722f-4123-49fa-b015-163e9ba5e08c	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	e7c24a26-5875-4c55-b22d-e0d94cafba32	cvcv	cvcv	community_post	0.00	0.00	0.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community	\N	2025-11-21 15:59:11.717729
c1b35593-f66e-47cd-a595-00d01f01a3d1	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	f8b68a45-7074-4c71-9a10-377cf93266cd	fgfg	gfgfgfgdf	community_post	100.00	0.00	100.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community	\N	2025-11-21 16:18:30.352442
5361bc98-60e9-4da9-8df7-1f70dbee64a0	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	963418ea-bfb5-4093-aa38-234a1d6864c5	fgfg	gfgfgfgdf	community_post	100.00	0.00	100.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community	\N	2025-11-21 16:18:30.362831
71be815d-a6e0-4d98-accb-b503e157dddc	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	c1673205-885d-432f-a757-ae40abb9c40a	fgfg	gfgfgfgdf	community_post	100.00	0.00	100.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community	\N	2025-11-21 16:18:30.371521
08cd8804-a591-41eb-9b5f-5555369df493	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	e7c24a26-5875-4c55-b22d-e0d94cafba32	fgfg	gfgfgfgdf	community_post	100.00	0.00	100.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community	\N	2025-11-21 16:18:30.38168
5809a079-ee99-4c75-a2e4-91f94396926a	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	f8b68a45-7074-4c71-9a10-377cf93266cd	test	test	community_post	100.00	0.00	100.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community?postId=ca4520c5-f1b8-4f02-96b4-42d43c5c11d0	\N	2025-11-21 16:59:58.206612
ca6e41b4-2502-413e-983e-10bbaa6f9df5	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	963418ea-bfb5-4093-aa38-234a1d6864c5	test	test	community_post	100.00	0.00	100.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community?postId=ca4520c5-f1b8-4f02-96b4-42d43c5c11d0	\N	2025-11-21 16:59:58.223438
3ba19c35-2c90-40bc-b95f-38ab1b63f385	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	c1673205-885d-432f-a757-ae40abb9c40a	test	test	community_post	100.00	0.00	100.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community?postId=ca4520c5-f1b8-4f02-96b4-42d43c5c11d0	\N	2025-11-21 16:59:58.235167
6cd76c31-556f-407d-9ecc-3d09f6264e84	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	e7c24a26-5875-4c55-b22d-e0d94cafba32	test	test	community_post	100.00	0.00	100.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community?postId=ca4520c5-f1b8-4f02-96b4-42d43c5c11d0	\N	2025-11-21 16:59:58.245991
b73b4c0f-35f9-44e7-a5a4-a268d531978f	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	f8b68a45-7074-4c71-9a10-377cf93266cd	test	testtt	community_post	50.00	0.00	50.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community?postId=7f3cf592-3470-4d62-b217-d9fcc768cf7e	\N	2025-11-21 17:20:45.496127
0170286d-ed9f-4836-995d-a9a236724a06	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	963418ea-bfb5-4093-aa38-234a1d6864c5	test	testtt	community_post	50.00	0.00	50.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community?postId=7f3cf592-3470-4d62-b217-d9fcc768cf7e	\N	2025-11-21 17:20:45.510144
949883ec-3d29-4114-b392-1fc9a9718240	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	c1673205-885d-432f-a757-ae40abb9c40a	test	testtt	community_post	50.00	0.00	50.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community?postId=7f3cf592-3470-4d62-b217-d9fcc768cf7e	\N	2025-11-21 17:20:45.526951
f8292ede-2119-4dc9-97b1-9115826cfafc	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	e7c24a26-5875-4c55-b22d-e0d94cafba32	test	testtt	community_post	50.00	0.00	50.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community?postId=7f3cf592-3470-4d62-b217-d9fcc768cf7e	\N	2025-11-21 17:20:45.543132
b0a597ad-8d85-4cba-8c0f-7fd0c3d11ec3	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	f8b68a45-7074-4c71-9a10-377cf93266cd	trtrt	test	community_post	100.00	0.00	100.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community?postId=392dbc21-8486-4b6e-91b9-73c29c8ef239	\N	2025-11-21 17:24:41.717901
fb66270c-d244-4fd5-bc46-39cb341592d7	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	963418ea-bfb5-4093-aa38-234a1d6864c5	trtrt	test	community_post	100.00	0.00	100.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community?postId=392dbc21-8486-4b6e-91b9-73c29c8ef239	\N	2025-11-21 17:24:41.730667
7457a916-fb76-4a63-8042-fc4881224bc3	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	c1673205-885d-432f-a757-ae40abb9c40a	trtrt	test	community_post	100.00	0.00	100.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community?postId=392dbc21-8486-4b6e-91b9-73c29c8ef239	\N	2025-11-21 17:24:41.741222
1f7cc70c-d380-4977-8b09-e1e3df4024c3	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	e7c24a26-5875-4c55-b22d-e0d94cafba32	trtrt	test	community_post	100.00	0.00	100.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community?postId=392dbc21-8486-4b6e-91b9-73c29c8ef239	\N	2025-11-21 17:24:41.752894
d1e68fd5-d73d-443a-b098-bf9a425e6be5	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	f8b68a45-7074-4c71-9a10-377cf93266cd	test	ttttttttttt	community_post	500.00	0.00	500.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community?postId=050bbe7b-2738-4fcb-b43f-c73d26a1deb8	\N	2025-11-21 17:37:23.545107
31687543-9444-4bb7-860d-eac53a3b08da	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	963418ea-bfb5-4093-aa38-234a1d6864c5	test	ttttttttttt	community_post	500.00	0.00	500.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community?postId=050bbe7b-2738-4fcb-b43f-c73d26a1deb8	\N	2025-11-21 17:37:23.564399
0f5edcd3-943c-430d-8cc0-a7a2a0d70d3f	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	c1673205-885d-432f-a757-ae40abb9c40a	test	ttttttttttt	community_post	500.00	0.00	500.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community?postId=050bbe7b-2738-4fcb-b43f-c73d26a1deb8	\N	2025-11-21 17:37:23.578406
75c2b233-7d8c-459d-bca9-1b217989c811	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	e7c24a26-5875-4c55-b22d-e0d94cafba32	test	ttttttttttt	community_post	500.00	0.00	500.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community?postId=050bbe7b-2738-4fcb-b43f-c73d26a1deb8	\N	2025-11-21 17:37:23.589685
95893052-b068-4c8c-8438-32b5da0b4f37	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	f8b68a45-7074-4c71-9a10-377cf93266cd	tte	test	community_post	10.00	0.00	10.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community?postId=8105a234-ab2e-4012-8010-f2dfa52481df	\N	2025-11-21 17:53:22.76799
359814b9-e1e0-49c9-9408-c963a5d0c040	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	963418ea-bfb5-4093-aa38-234a1d6864c5	tte	test	community_post	10.00	0.00	10.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community?postId=8105a234-ab2e-4012-8010-f2dfa52481df	\N	2025-11-21 17:53:22.782118
4c96c5e1-53fe-458a-984e-7347a582d94d	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	c1673205-885d-432f-a757-ae40abb9c40a	tte	test	community_post	10.00	0.00	10.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community?postId=8105a234-ab2e-4012-8010-f2dfa52481df	\N	2025-11-21 17:53:22.792469
0fb2002e-ad62-482e-afd5-a42dbb7d8e83	\N	\N	7c81a217-dc67-4032-9e19-79480e7a26bb	e7c24a26-5875-4c55-b22d-e0d94cafba32	tte	test	community_post	10.00	0.00	10.00	assigned	\N	\N	\N	\N	\N	/groups/7c81a217-dc67-4032-9e19-79480e7a26bb/community?postId=8105a234-ab2e-4012-8010-f2dfa52481df	\N	2025-11-21 17:53:22.80272
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, wallet_id, task_id, type, amount, status, description, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password) FROM stdin;
\.


--
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wallets (id, freelancer_id, balance, pending_balance, total_earned, total_withdrawn, created_at, updated_at) FROM stdin;
60cc396e-e6ea-4647-ab9f-3ed3a43c69d7	97ea9e4b-9d2d-4896-93ec-66fb641ee545	0.00	0.00	0.00	0.00	2025-11-16 21:07:52.979446	2025-11-16 21:07:52.979446
7f5eb277-f235-4b8d-8649-ff0c7b454f6b	e7c24a26-5875-4c55-b22d-e0d94cafba32	0.00	0.00	0.00	0.00	2025-11-16 23:51:47.656131	2025-11-16 23:51:47.656131
8c5e1cb7-46cb-44cd-97f6-964dadccf8ea	c1673205-885d-432f-a757-ae40abb9c40a	0.00	0.00	0.00	0.00	2025-11-17 00:03:41.211016	2025-11-17 00:03:41.211016
9ad15bfc-08a1-4c23-b831-19f0f3e06d39	963418ea-bfb5-4093-aa38-234a1d6864c5	0.00	0.00	0.00	0.00	2025-11-17 00:07:14.143214	2025-11-17 00:07:14.143214
6bf342a7-65fb-4392-9171-108189de2567	f8b68a45-7074-4c71-9a10-377cf93266cd	0.00	0.00	0.00	0.00	2025-11-17 00:08:56.901678	2025-11-17 00:08:56.901678
\.


--
-- Data for Name: withdrawals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.withdrawals (id, freelancer_id, amount, payment_method, account_number, status, processed_at, notes, created_at) FROM stdin;
\.


--
-- Name: admin_users admin_users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_unique UNIQUE (email);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: conversation_messages conversation_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversation_messages
    ADD CONSTRAINT conversation_messages_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: direct_messages direct_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.direct_messages
    ADD CONSTRAINT direct_messages_pkey PRIMARY KEY (id);


--
-- Name: freelancers freelancers_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.freelancers
    ADD CONSTRAINT freelancers_email_unique UNIQUE (email);


--
-- Name: freelancers freelancers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.freelancers
    ADD CONSTRAINT freelancers_pkey PRIMARY KEY (id);


--
-- Name: freelancers freelancers_username_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.freelancers
    ADD CONSTRAINT freelancers_username_unique UNIQUE (username);


--
-- Name: group_join_requests group_join_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_join_requests
    ADD CONSTRAINT group_join_requests_pkey PRIMARY KEY (id);


--
-- Name: group_members group_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_pkey PRIMARY KEY (id);


--
-- Name: group_posts group_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_posts
    ADD CONSTRAINT group_posts_pkey PRIMARY KEY (id);


--
-- Name: group_spectators group_spectators_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_spectators
    ADD CONSTRAINT group_spectators_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_unique UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: post_comments post_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_comments
    ADD CONSTRAINT post_comments_pkey PRIMARY KEY (id);


--
-- Name: post_reactions post_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_reactions
    ADD CONSTRAINT post_reactions_pkey PRIMARY KEY (id);


--
-- Name: product_owners product_owners_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_owners
    ADD CONSTRAINT product_owners_email_unique UNIQUE (email);


--
-- Name: product_owners product_owners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_owners
    ADD CONSTRAINT product_owners_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_unique UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: wallets wallets_freelancer_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_freelancer_id_unique UNIQUE (freelancer_id);


--
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- Name: withdrawals withdrawals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_pkey PRIMARY KEY (id);


--
-- Name: idx_direct_messages_receiver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_direct_messages_receiver ON public.direct_messages USING btree (receiver_id, receiver_type);


--
-- Name: idx_direct_messages_sender; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_direct_messages_sender ON public.direct_messages USING btree (sender_id, sender_type);


--
-- Name: role_permission_pk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX role_permission_pk ON public.role_permissions USING btree (role_id, permission_id);


--
-- Name: unique_conversation_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_conversation_idx ON public.conversations USING btree (product_owner_id, group_id);


--
-- Name: unique_group_member_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_group_member_idx ON public.group_members USING btree (group_id, freelancer_id);


--
-- Name: unique_join_request_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_join_request_idx ON public.group_join_requests USING btree (group_id, freelancer_id);


--
-- Name: unique_reaction_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_reaction_idx ON public.post_reactions USING btree (post_id, user_id);


--
-- Name: admin_users admin_users_role_id_roles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_role_id_roles_id_fk FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: campaigns campaigns_product_owner_id_product_owners_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_product_owner_id_product_owners_id_fk FOREIGN KEY (product_owner_id) REFERENCES public.product_owners(id);


--
-- Name: conversation_messages conversation_messages_conversation_id_conversations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversation_messages
    ADD CONSTRAINT conversation_messages_conversation_id_conversations_id_fk FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);


--
-- Name: conversations conversations_group_id_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_group_id_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: conversations conversations_leader_id_freelancers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_leader_id_freelancers_id_fk FOREIGN KEY (leader_id) REFERENCES public.freelancers(id);


--
-- Name: conversations conversations_product_owner_id_product_owners_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_product_owner_id_product_owners_id_fk FOREIGN KEY (product_owner_id) REFERENCES public.product_owners(id);


--
-- Name: group_join_requests group_join_requests_freelancer_id_freelancers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_join_requests
    ADD CONSTRAINT group_join_requests_freelancer_id_freelancers_id_fk FOREIGN KEY (freelancer_id) REFERENCES public.freelancers(id);


--
-- Name: group_join_requests group_join_requests_group_id_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_join_requests
    ADD CONSTRAINT group_join_requests_group_id_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: group_members group_members_freelancer_id_freelancers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_freelancer_id_freelancers_id_fk FOREIGN KEY (freelancer_id) REFERENCES public.freelancers(id);


--
-- Name: group_members group_members_group_id_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_group_id_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: group_posts group_posts_author_id_freelancers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_posts
    ADD CONSTRAINT group_posts_author_id_freelancers_id_fk FOREIGN KEY (author_id) REFERENCES public.freelancers(id);


--
-- Name: group_posts group_posts_group_id_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_posts
    ADD CONSTRAINT group_posts_group_id_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: groups groups_leader_id_freelancers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_leader_id_freelancers_id_fk FOREIGN KEY (leader_id) REFERENCES public.freelancers(id);


--
-- Name: messages messages_group_id_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_group_id_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: messages messages_related_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_related_project_id_projects_id_fk FOREIGN KEY (related_project_id) REFERENCES public.projects(id);


--
-- Name: messages messages_sender_id_freelancers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_freelancers_id_fk FOREIGN KEY (sender_id) REFERENCES public.freelancers(id);


--
-- Name: orders orders_group_id_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_group_id_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: orders orders_product_owner_id_product_owners_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_product_owner_id_product_owners_id_fk FOREIGN KEY (product_owner_id) REFERENCES public.product_owners(id);


--
-- Name: payments payments_campaign_id_campaigns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_campaign_id_campaigns_id_fk FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: payments payments_product_owner_id_product_owners_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_product_owner_id_product_owners_id_fk FOREIGN KEY (product_owner_id) REFERENCES public.product_owners(id);


--
-- Name: post_comments post_comments_author_id_freelancers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_comments
    ADD CONSTRAINT post_comments_author_id_freelancers_id_fk FOREIGN KEY (author_id) REFERENCES public.freelancers(id);


--
-- Name: post_comments post_comments_post_id_group_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_comments
    ADD CONSTRAINT post_comments_post_id_group_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.group_posts(id);


--
-- Name: post_reactions post_reactions_post_id_group_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_reactions
    ADD CONSTRAINT post_reactions_post_id_group_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.group_posts(id);


--
-- Name: post_reactions post_reactions_user_id_freelancers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_reactions
    ADD CONSTRAINT post_reactions_user_id_freelancers_id_fk FOREIGN KEY (user_id) REFERENCES public.freelancers(id);


--
-- Name: projects projects_accepted_by_group_id_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_accepted_by_group_id_groups_id_fk FOREIGN KEY (accepted_by_group_id) REFERENCES public.groups(id);


--
-- Name: projects projects_product_owner_id_product_owners_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_product_owner_id_product_owners_id_fk FOREIGN KEY (product_owner_id) REFERENCES public.product_owners(id);


--
-- Name: role_permissions role_permissions_permission_id_permissions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_permissions_id_fk FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_roles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_roles_id_fk FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_campaign_id_campaigns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_campaign_id_campaigns_id_fk FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: tasks tasks_freelancer_id_freelancers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_freelancer_id_freelancers_id_fk FOREIGN KEY (freelancer_id) REFERENCES public.freelancers(id);


--
-- Name: tasks tasks_group_id_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_group_id_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: tasks tasks_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: transactions transactions_task_id_tasks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_task_id_tasks_id_fk FOREIGN KEY (task_id) REFERENCES public.tasks(id);


--
-- Name: transactions transactions_wallet_id_wallets_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_wallets_id_fk FOREIGN KEY (wallet_id) REFERENCES public.wallets(id);


--
-- Name: wallets wallets_freelancer_id_freelancers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_freelancer_id_freelancers_id_fk FOREIGN KEY (freelancer_id) REFERENCES public.freelancers(id);


--
-- Name: withdrawals withdrawals_freelancer_id_freelancers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_freelancer_id_freelancers_id_fk FOREIGN KEY (freelancer_id) REFERENCES public.freelancers(id);


--
-- PostgreSQL database dump complete
--

\unrestrict LWJVpRe0s1lKl6fOJ2UtegUQTebw2KjXw0PmTYVf2g6MHg4UAqTzjXsaErOxyJq

