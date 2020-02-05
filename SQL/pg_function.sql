CREATE OR REPLACE FUNCTION table_update_notify() RETURNS trigger AS $$
DECLARE
  id bigint;
  nome varchar;
  cognome varchar;
  dataiscrizione date;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    id = NEW.id;
    nome = NEW.nome;
    cognome = NEW.cognome;
    dataiscrizione = NEW.dataiscrizione;
  ELSE
    id = OLD.id;
    nome = OLD.nome;
    cognome = OLD.cognome;
    dataiscrizione = OLD.dataiscrizione;
  END IF;
  PERFORM pg_notify('results', json_build_object('table', TG_TABLE_NAME, 'id', id, 'nome', nome, 'cognome', cognome, 'dataiscrizione', dataiscrizione, 'type', TG_OP)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
