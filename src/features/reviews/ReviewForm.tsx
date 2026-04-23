import { useState } from "react";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Props = {
  bookingId: string;
  experienceId: string;
  guideId: string;
  onClose: () => void;
  onDone: () => void;
};

export const ReviewForm = ({ bookingId, experienceId, guideId, onClose, onDone }: Props) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("reviews").insert({
      booking_id: bookingId,
      experience_id: experienceId,
      guide_id: guideId,
      tourist_id: user.id,
      rating,
      comment: comment.trim() || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Thanks for your review!");
    onDone();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Leave a review</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-1 justify-center">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)} type="button">
                <Star className={`size-8 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
          <Textarea
            rows={4}
            placeholder="Share your experience (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={submit} disabled={saving} className="gradient-lava text-primary-foreground border-0 shadow-lava">
              {saving ? <Loader2 className="size-4 animate-spin" /> : null} Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
