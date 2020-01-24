--
-- PostgreSQL database dump
--

-- Dumped from database version 12.0
-- Dumped by pg_dump version 12.0

-- Started on 2020-01-22 18:35:55

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- TOC entry 202 (class 1259 OID 16394)
-- Name: utente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.utente (
    nome character(20),
    cognome character(20),
    id integer NOT NULL,
    cf character(20),
    telefono character(20),
    datanascita date,
    indirizzo character(50),
    citta character(30),
    cap character(10),
    tipo character(10),
    durata character(10)
);


ALTER TABLE public.utente OWNER TO postgres;

--
-- TOC entry 203 (class 1259 OID 24613)
-- Name: utente_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.utente_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.utente_id_seq OWNER TO postgres;

--
-- TOC entry 2826 (class 0 OID 0)
-- Dependencies: 203
-- Name: utente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.utente_id_seq OWNED BY public.utente.id;


--
-- TOC entry 2687 (class 2604 OID 24615)
-- Name: utente id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utente ALTER COLUMN id SET DEFAULT nextval('public.utente_id_seq'::regclass);


--
-- TOC entry 2819 (class 0 OID 16394)
-- Dependencies: 202
-- Data for Name: utente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.utente (nome, cognome, id, cf, telefono, datanascita, indirizzo, citta, cap, tipo, durata) FROM stdin;
aaa                 	\N	1	\N	\N	\N	\N	\N	\N	\N	\N
aaa                 	\N	2	\N	\N	\N	\N	\N	\N	\N	\N
aaa                 	\N	3	\N	\N	\N	\N	\N	\N	\N	\N
aaa                 	\N	4	\N	\N	\N	\N	\N	\N	\N	\N
aaa                 	\N	5	\N	\N	\N	\N	\N	\N	\N	\N
brian               	white               	6	\N	\N	\N	\N	\N	\N	\N	\N
aaa                 	xxx                 	7	\N	\N	\N	\N	\N	\N	\N	\N
fff                 	ggg                 	8	\N	\N	\N	\N	\N	\N	\N	\N
aaa                 	rrrr                	9	\N	\N	\N	\N	\N	\N	\N	\N
ada                 	dsrr                	10	\N	\N	\N	\N	\N	\N	\N	\N
aaa                 	rrrr                	11	\N	\N	\N	\N	\N	\N	\N	\N
aaa                 	rrrr                	12	\N	\N	\N	\N	\N	\N	\N	\N
aaa                 	rrrr                	13	\N	\N	\N	\N	\N	\N	\N	\N
fff                 	ggg                 	14	\N	\N	\N	\N	\N	\N	\N	\N
fff                 	ggg                 	15	\N	\N	\N	\N	\N	\N	\N	\N
fff                 	ggg                 	16	\N	\N	\N	\N	\N	\N	\N	\N
lollo               	ciao                	17	\N	\N	\N	\N	\N	\N	\N	\N
ciao                	ciaone              	18	\N	\N	\N	\N	\N	\N	\N	\N
loddo               	dadsasdsd           	19	\N	\N	\N	\N	\N	\N	\N	\N
lollo               	cdddo               	20	\N	\N	\N	\N	\N	\N	\N	\N
lollo               	cdddo               	21	\N	\N	\N	\N	\N	\N	\N	\N
Giorgio             	Gori                	22	\N	\N	\N	\N	\N	\N	\N	\N
Pippo               	Caio                	23	PPPCCC79M12S120R    	3336655887          	1979-02-01	via roma 10                                       	valenza                       	15040     	\N	\N
Tito                	Lollo               	24	TTTLLL22M10H109B    	011253632           	1993-06-05	piazza garibaldi 20                               	alessandria                   	15100     	cyclette  	3mesi     
Chiara              	Ciao                	25	CCCCHR88            	33665522            	1988-11-12	via roma 12                                       	valenza                       	15040     	cyclette  	6mesi     
\.


--
-- TOC entry 2827 (class 0 OID 0)
-- Dependencies: 203
-- Name: utente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.utente_id_seq', 25, true);


--
-- TOC entry 2689 (class 2606 OID 24617)
-- Name: utente utente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utente
    ADD CONSTRAINT utente_pkey PRIMARY KEY (id);


--
-- TOC entry 2690 (class 2620 OID 24624)
-- Name: utente users_notify_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER users_notify_delete AFTER DELETE ON public.utente FOR EACH ROW EXECUTE FUNCTION public.table_update_notify();


--
-- TOC entry 2691 (class 2620 OID 24623)
-- Name: utente users_notify_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER users_notify_insert AFTER INSERT ON public.utente FOR EACH ROW EXECUTE FUNCTION public.table_update_notify();


--
-- TOC entry 2692 (class 2620 OID 24622)
-- Name: utente users_notify_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER users_notify_update AFTER UPDATE ON public.utente FOR EACH ROW EXECUTE FUNCTION public.table_update_notify();


-- Completed on 2020-01-22 18:35:56

--
-- PostgreSQL database dump complete
--

