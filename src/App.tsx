import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import BecomeGuide from "./pages/BecomeGuide.tsx";
import Dashboard from "./pages/dashboard/Dashboard.tsx";
import GuideExperiences from "./pages/dashboard/GuideExperiences.tsx";
import AdminApplications from "./pages/dashboard/AdminApplications.tsx";
import ExperiencesList from "./pages/ExperiencesList.tsx";
import ExperienceDetail from "./pages/ExperienceDetail.tsx";
import ExperienceEditor from "./pages/dashboard/ExperienceEditor.tsx";
import Profile from "./pages/dashboard/Profile.tsx";
import Favorites from "./pages/dashboard/Favorites.tsx";
import Messages from "./pages/dashboard/Messages.tsx";
import MyBookings from "./pages/dashboard/MyBookings.tsx";
import GuideBookings from "./pages/dashboard/GuideBookings.tsx";
import GuideProfile from "./pages/GuideProfile.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/experiences" element={<ExperiencesList />} />
            <Route path="/experiences/:slug" element={<ExperienceDetail />} />
            <Route path="/guides/:id" element={<GuideProfile />} />
            <Route
              path="/become-guide"
              element={
                <ProtectedRoute>
                  <BecomeGuide />
                </ProtectedRoute>
              }
            />
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/profile" element={<Profile />} />
              <Route path="/dashboard/messages" element={<Messages />} />
              <Route path="/dashboard/bookings" element={<MyBookings />} />
              <Route path="/dashboard/favorites" element={<Favorites />} />
              <Route
                path="/dashboard/guide"
                element={
                  <ProtectedRoute requireRole="guide">
                    <GuideBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/experiences"
                element={
                  <ProtectedRoute requireRole="guide">
                    <GuideExperiences />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/experiences/new"
                element={
                  <ProtectedRoute requireRole="guide">
                    <ExperienceEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/experiences/:id/edit"
                element={
                  <ProtectedRoute requireRole="guide">
                    <ExperienceEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute requireRole="admin">
                    <AdminApplications />
                  </ProtectedRoute>
                }
              />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
