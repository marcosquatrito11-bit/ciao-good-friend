import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Mountain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const credsSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
});

const signupSchema = credsSchema.extend({
  displayName: z.string().trim().min(2, "Name too short").max(80),
});

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  useEffect(() => {
    if (!loading && user) navigate(from, { replace: true });
  }, [loading, user, from, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = credsSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Email or password incorrect" : error.message);
      return;
    }
    toast.success("Welcome back!");
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signupSchema.safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
      displayName: fd.get("displayName"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: parsed.data.displayName },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message.includes("already") ? "This email is already registered" : error.message);
      return;
    }
    toast.success("Account created! Check your email to confirm.");
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setBusy(true);
    const { error } = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: `${window.location.origin}/dashboard`,
    });
    setBusy(false);
    if (error) toast.error(error.message);
  };

  const handleForgot = async () => {
    const email = prompt("Enter your email to reset password:");
    if (!email) return;
    const parsed = z.string().email().safeParse(email.trim());
    if (!parsed.success) return toast.error("Invalid email");
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Reset email sent");
  };

  return (
    <main className="min-h-screen grid place-items-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 font-display font-bold text-2xl mb-6">
          <span className="grid place-items-center size-10 rounded-lg gradient-lava shadow-lava">
            <Mountain className="size-6 text-primary-foreground" />
          </span>
          EtnaGo
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in or create an account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">Log in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form className="space-y-4 mt-4" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="li-email">Email</Label>
                    <Input id="li-email" name="email" type="email" autoComplete="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="li-pass">Password</Label>
                    <Input id="li-pass" name="password" type="password" autoComplete="current-password" required />
                  </div>
                  <Button type="submit" className="w-full gradient-lava text-primary-foreground border-0 shadow-lava" disabled={busy}>
                    Log in
                  </Button>
                  <button type="button" onClick={handleForgot} className="block w-full text-xs text-muted-foreground hover:text-primary text-center">
                    Forgot password?
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form className="space-y-4 mt-4" onSubmit={handleSignup}>
                  <div className="space-y-2">
                    <Label htmlFor="su-name">Full name</Label>
                    <Input id="su-name" name="displayName" required minLength={2} maxLength={80} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-email">Email</Label>
                    <Input id="su-email" name="email" type="email" autoComplete="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-pass">Password</Label>
                    <Input id="su-pass" name="password" type="password" autoComplete="new-password" required minLength={8} />
                  </div>
                  <Button type="submit" className="w-full gradient-lava text-primary-foreground border-0 shadow-lava" disabled={busy}>
                    Create account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px bg-border flex-1" />
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="h-px bg-border flex-1" />
            </div>

            <div className="grid gap-2">
              <Button variant="outline" disabled={busy} onClick={() => handleOAuth("google")}>
                Continue with Google
              </Button>
              <Button variant="outline" disabled={busy} onClick={() => handleOAuth("apple")}>
                Continue with Apple
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link to="/" className="hover:text-primary">← Back to home</Link>
        </p>
      </div>
    </main>
  );
};

export default Auth;
