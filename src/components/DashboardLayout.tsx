import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Mountain, LogOut, LayoutDashboard, ClipboardList, Compass, ShieldCheck, Heart, MessageSquare, CalendarDays, User, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const item = "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors";
const active = "bg-accent text-accent-foreground";

export const DashboardLayout = () => {
  const { user, isAdmin, isGuide, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-background border-b">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display font-bold">
            <span className="grid place-items-center size-7 rounded-md gradient-lava shadow-lava">
              <Mountain className="size-4 text-primary-foreground" />
            </span>
            EtnaGo
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-muted-foreground truncate max-w-[200px]">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="container grid md:grid-cols-[220px_1fr] gap-6 py-6">
        <aside className="md:sticky md:top-6 self-start">
          <nav className="bg-background border rounded-lg p-2 space-y-1">
            <NavLink to="/dashboard" end className={({ isActive }) => cn(item, isActive && active)}>
              <LayoutDashboard className="size-4" /> Overview
            </NavLink>
            <NavLink to="/dashboard/profile" className={({ isActive }) => cn(item, isActive && active)}>
              <User className="size-4" /> Profile
            </NavLink>
            <NavLink to="/dashboard/messages" className={({ isActive }) => cn(item, isActive && active)}>
              <MessageSquare className="size-4" /> Messages
            </NavLink>
            <NavLink to="/dashboard/bookings" className={({ isActive }) => cn(item, isActive && active)}>
              <CalendarDays className="size-4" /> My bookings
            </NavLink>
            <NavLink to="/dashboard/favorites" className={({ isActive }) => cn(item, isActive && active)}>
              <Heart className="size-4" /> Favorites
            </NavLink>
            {!isGuide && !isAdmin && (
              <NavLink to="/become-guide" className={({ isActive }) => cn(item, isActive && active)}>
                <ClipboardList className="size-4" /> Become a guide
              </NavLink>
            )}
            {isGuide && (
              <>
                <div className="pt-2 px-3 text-[10px] font-semibold uppercase text-muted-foreground">Guide</div>
                <NavLink to="/dashboard/guide" className={({ isActive }) => cn(item, isActive && active)}>
                  <BarChart3 className="size-4" /> Stats & bookings
                </NavLink>
                <NavLink to="/dashboard/experiences" className={({ isActive }) => cn(item, isActive && active)}>
                  <Compass className="size-4" /> My experiences
                </NavLink>
              </>
            )}
            {isAdmin && (
              <>
                <div className="pt-2 px-3 text-[10px] font-semibold uppercase text-muted-foreground">Admin</div>
                <NavLink to="/dashboard/admin" className={({ isActive }) => cn(item, isActive && active)}>
                  <ShieldCheck className="size-4" /> Applications
                </NavLink>
              </>
            )}
          </nav>
        </aside>

        <main className="bg-background border rounded-lg p-6 min-h-[60vh]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
