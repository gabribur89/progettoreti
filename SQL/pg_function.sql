CREATE OR REPLACE FUNCTION table_update_notify() RETURNS trigger AS $$
DECLARE
  id bigint;
  nome varchar;
  cognome varchar;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    id = NEW.id;
    nome = NEW.nome;
    cognome = NEW.cognome;
  ELSE
    id = OLD.id;
    nome = OLD.nome;
    cognome = OLD.cognome;
  END IF;
  PERFORM pg_notify('results', json_build_object('table', TG_TABLE_NAME, 'id', id, 'nome', nome, 'cognome', cognome, 'type', TG_OP)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
