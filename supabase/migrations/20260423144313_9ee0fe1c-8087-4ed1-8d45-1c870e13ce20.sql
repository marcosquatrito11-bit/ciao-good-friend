
-- Aggiorna rating su experiences e guides quando arriva una review
CREATE OR REPLACE FUNCTION public.update_review_aggregates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  exp_avg numeric;
  exp_cnt int;
  guide_avg numeric;
  guide_cnt int;
  target_exp uuid;
  target_guide uuid;
BEGIN
  target_exp := COALESCE(NEW.experience_id, OLD.experience_id);
  target_guide := COALESCE(NEW.guide_id, OLD.guide_id);

  SELECT COALESCE(AVG(rating)::numeric(3,2), 0), COUNT(*) INTO exp_avg, exp_cnt
  FROM public.reviews WHERE experience_id = target_exp;
  UPDATE public.experiences SET rating = exp_avg, reviews_count = exp_cnt WHERE id = target_exp;

  SELECT COALESCE(AVG(rating)::numeric(3,2), 0), COUNT(*) INTO guide_avg, guide_cnt
  FROM public.reviews WHERE guide_id = target_guide;
  UPDATE public.guides SET rating = guide_avg, reviews_count = guide_cnt WHERE id = target_guide;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_reviews_aggregate ON public.reviews;
CREATE TRIGGER trg_reviews_aggregate
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_review_aggregates();

-- Aggiorna spots_left quando una booking viene creata/cancellata
CREATE OR REPLACE FUNCTION public.update_spots_on_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.experience_date_id IS NOT NULL AND NEW.status <> 'cancelled' THEN
    UPDATE public.experience_dates
    SET spots_left = GREATEST(0, spots_left - NEW.participants)
    WHERE id = NEW.experience_date_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- transizione a cancelled: restituisci posti
    IF OLD.status <> 'cancelled' AND NEW.status = 'cancelled' AND NEW.experience_date_id IS NOT NULL THEN
      UPDATE public.experience_dates
      SET spots_left = spots_left + NEW.participants
      WHERE id = NEW.experience_date_id;
    -- transizione da cancelled a attivo: scala posti
    ELSIF OLD.status = 'cancelled' AND NEW.status <> 'cancelled' AND NEW.experience_date_id IS NOT NULL THEN
      UPDATE public.experience_dates
      SET spots_left = GREATEST(0, spots_left - NEW.participants)
      WHERE id = NEW.experience_date_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bookings_spots ON public.bookings;
CREATE TRIGGER trg_bookings_spots
AFTER INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_spots_on_booking();

-- Aggiorna bookings_count su experiences e guides
CREATE OR REPLACE FUNCTION public.update_booking_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.experiences SET bookings_count = bookings_count + 1 WHERE id = NEW.experience_id;
    UPDATE public.guides SET bookings_count = bookings_count + 1 WHERE id = NEW.guide_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bookings_count ON public.bookings;
CREATE TRIGGER trg_bookings_count
AFTER INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_booking_counts();

-- Trigger updated_at su tabelle che ce l'hanno
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_guide_apps_updated_at ON public.guide_applications;
CREATE TRIGGER trg_guide_apps_updated_at BEFORE UPDATE ON public.guide_applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_experiences_updated_at ON public.experiences;
CREATE TRIGGER trg_experiences_updated_at BEFORE UPDATE ON public.experiences FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_bookings_updated_at ON public.bookings;
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_guides_updated_at ON public.guides;
CREATE TRIGGER trg_guides_updated_at BEFORE UPDATE ON public.guides FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
