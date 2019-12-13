CREATE OR REPLACE FUNCTION table_update_notify() RETURNS trigger AS $$
DECLARE
  id bigint;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    id = NEW.id;
  ELSE
    id = OLD.id;
  END IF;
  PERFORM pg_notify('example', json_build_object('table', TG_TABLE_NAME, 'id', id, 'type', TG_OP)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER users_notify_update ON utente;
CREATE TRIGGER users_notify_update AFTER UPDATE ON utente FOR EACH ROW EXECUTE PROCEDURE table_update_notify();

DROP TRIGGER users_notify_insert ON utente;
CREATE TRIGGER users_notify_insert AFTER INSERT ON utente FOR EACH ROW EXECUTE PROCEDURE table_update_notify();

DROP TRIGGER users_notify_delete ON utente;
CREATE TRIGGER users_notify_delete AFTER DELETE ON utente FOR EACH ROW EXECUTE PROCEDURE table_update_notify();