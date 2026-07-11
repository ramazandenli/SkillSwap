-- Aggregated stats per user, joined for cheap profile reads.
CREATE VIEW user_stats AS
SELECT
  u.id AS user_id,
  u.points,
  (SELECT COUNT(*)::INT FROM follows WHERE followed_id = u.id) AS follower_count,
  (SELECT COUNT(*)::INT FROM follows WHERE follower_id = u.id) AS following_count,
  COALESCE(
    (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM reviews WHERE to_id = u.id),
    0
  ) AS rating_avg,
  (SELECT COUNT(*)::INT FROM reviews WHERE to_id = u.id) AS rating_count
FROM users u;

-- Returns the average rating and number of reviews a user has received.
CREATE FUNCTION user_rating(uid TEXT)
RETURNS TABLE(avg_rating NUMERIC, review_count INT)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    COALESCE(ROUND(AVG(rating)::NUMERIC, 2), 0),
    COUNT(*)::INT
  FROM reviews
  WHERE to_id = uid;
$$;

-- When an event transitions from 'waiting' to 'accepted', both participants
-- earn +10 points. Keeping this in the DB guarantees atomicity even if the
-- API is bypassed (e.g. an admin flips a row directly).
CREATE FUNCTION award_points_on_accept()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = 'waiting' AND NEW.status = 'accepted' THEN
    UPDATE users SET points = points + 10
    WHERE id IN (NEW.user1_id, NEW.user2_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_award_points_on_accept
  AFTER UPDATE OF status ON events
  FOR EACH ROW
  EXECUTE FUNCTION award_points_on_accept();

-- Admin utility: zero out a user's points (e.g. after a policy violation).
CREATE PROCEDURE reset_user_points(uid TEXT)
LANGUAGE SQL
AS $$
  UPDATE users SET points = 0 WHERE id = uid;
$$;
