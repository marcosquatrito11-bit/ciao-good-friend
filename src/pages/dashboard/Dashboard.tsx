import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ClipboardList, CheckCircle2, Clock, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Application = {
  status: string;
  current_step: number;
  submitted_at: string | null;
  rejection_reason: string | null;
};

const Dashboard = () => {
  const { user, isAdmin, isGuide } = useAuth();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("guide_applications")
        .select("status, current_step, submitted_at, rejection_reason")
        .eq("user_id", user.id)
        .maybeSingle();
      setApp(data);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Welcome 👋</h1>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {isAdmin && <Badge className="bg-primary">Admin</Badge>}
        {isGuide && <Badge variant="secondary">Approved guide</Badge>}
        {!isGuide && !isAdmin && <Badge variant="outline">Tourist</Badge>}
      </div>

      {!isGuide && !isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ClipboardList className="size-5" /> Become a guide</CardTitle>
            <CardDescription>Share your knowledge of Etna with travelers from all over the world.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!app && (
              <Button asChild className="gradient-lava text-primary-foreground border-0 shadow-lava">
                <Link to="/become-guide">Start application</Link>
              </Button>
            )}
            {app?.status === "draft" && (
              <>
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="size-4" /> Application in progress (step {app.current_step}/8)</p>
                <Button asChild>
                  <Link to="/become-guide">Continue application</Link>
                </Button>
              </>
            )}
            {app?.status === "pending" && (
              <p className="text-sm flex items-center gap-2 text-amber-600"><Clock className="size-4" /> Submitted on {new Date(app.submitted_at!).toLocaleDateString()} — under review.</p>
            )}
            {app?.status === "approved" && (
              <p className="text-sm flex items-center gap-2 text-emerald-600"><CheckCircle2 className="size-4" /> Approved! Refresh in a moment.</p>
            )}
            {app?.status === "rejected" && (
              <div className="space-y-2">
                <p className="text-sm flex items-center gap-2 text-destructive"><XCircle className="size-4" /> Application rejected.</p>
                {app.rejection_reason && <p className="text-xs text-muted-foreground bg-muted p-3 rounded">{app.rejection_reason}</p>}
                <Button asChild variant="outline"><Link to="/become-guide">Resubmit</Link></Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
