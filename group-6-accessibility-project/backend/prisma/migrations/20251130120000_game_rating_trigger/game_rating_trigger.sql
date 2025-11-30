-- Trigger function to update game rating after review changes
CREATE OR REPLACE FUNCTION update_game_rating()
RETURNS TRIGGER AS $$
DECLARE
  affected_game_id INT;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    affected_game_id := OLD."gameId";
  ELSE
    affected_game_id := NEW."gameId";
  END IF;

  UPDATE "Game"
  SET rating = (
    SELECT AVG(rating)::float
    FROM "Review"
    WHERE "Review"."gameId" = affected_game_id
  )
  WHERE "id" = affected_game_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for INSERT and UPDATE on Review
CREATE TRIGGER review_after_insert_update
AFTER INSERT OR UPDATE ON "Review"
FOR EACH ROW
EXECUTE FUNCTION update_game_rating();

-- Trigger for DELETE on Review
CREATE TRIGGER review_after_delete
AFTER DELETE ON "Review"
FOR EACH ROW
EXECUTE FUNCTION update_game_rating();
