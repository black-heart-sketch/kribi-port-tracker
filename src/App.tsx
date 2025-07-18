import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Shipes from "./pages/Ships";
import Berthing from "./pages/Berthing";
import CurrentBerthings from './pages/CurrentBerthings';
import BerthingRequests from './pages/berthing/BerthingRequests';
import Login from './pages/Login';
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Docks from "./pages/admin/port/Docks";
import Ships from "./pages/admin/port/Ships";
import UsersManagement from "./pages/admin/users";
import UserDetails from "./pages/admin/users/UserDetails";
import AdminDashboard from "./pages/admin/Dashboard";
import MyCargo from "./pages/cargo/MyCargo";
import CustomsClearance from "./pages/customs/CustomsClearance";

// Protected Route Component
type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Store the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Public Only Route Component
const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname || "/dashboard";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/berthing/current" element={<CurrentBerthings />} />
          <Route path="/berthing/requests" element={<BerthingRequests />} />
          
          {/* Auth routes */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <Signup />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicOnlyRoute>
                <ForgotPassword />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicOnlyRoute>
                <ResetPassword />
              </PublicOnlyRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ships"
            element={
              <ProtectedRoute>
                <Shipes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/berthing"
            element={
              <ProtectedRoute>
                <Berthing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/berthing/new"
            element={
              <ProtectedRoute>
                <Berthing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/berthing/my-requests"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/port/docks"
            element={
              <ProtectedRoute>
                <Docks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/port/ships"
            element={
              <ProtectedRoute>
                <Ships />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <UsersManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:userId"
            element={
              <ProtectedRoute>
                <UserDetails />
              </ProtectedRoute>
            }
          />

          {/* Cargo Routes */}
          <Route
            path="/cargo/my-cargo"
            element={
              <ProtectedRoute>
                <MyCargo />
              </ProtectedRoute>
            }
          />

          {/* Customs Routes */}
          <Route
            path="/customs/clearance"
            element={
              <ProtectedRoute>
                <CustomsClearance />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
