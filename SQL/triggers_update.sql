DROP TRIGGER users_notify_update ON utente;
CREATE TRIGGER users_notify_update AFTER UPDATE ON utente FOR EACH ROW EXECUTE PROCEDURE table_update_notify();

DROP TRIGGER users_notify_insert ON utente;
CREATE TRIGGER users_notify_insert AFTER INSERT ON utente FOR EACH ROW EXECUTE PROCEDURE table_update_notify();

DROP TRIGGER users_notify_delete ON utente;
CREATE TRIGGER users_notify_delete AFTER DELETE ON utente FOR EACH ROW EXECUTE PROCEDURE table_update_notify();
