import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Coaches from "./pages/Coaches";
import Sessions from "./pages/Sessions";
import NotFound from "./pages/NotFound";

// Member Pages
import MemberDashboard from "./pages/member/MemberDashboard";
import MemberBookings from "./pages/member/MemberBookings";
import MemberSessions from "./pages/member/MemberSessions";
import MemberProgress from "./pages/member/MemberProgress";
import MemberReviews from "./pages/member/MemberReviews";

// Coach Pages
import CoachDashboard from "./pages/coach/CoachDashboard";
import CoachSessions from "./pages/coach/CoachSessions";
import CoachAttendance from "./pages/coach/CoachAttendance";
import CoachReviews from "./pages/coach/CoachReviews";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminCoaches from "./pages/admin/AdminCoaches";
import AdminSessions from "./pages/admin/AdminSessions";
import AdminClassTypes from "./pages/admin/AdminClassTypes";
import AdminBookings from "./pages/admin/AdminBookings";

const App = () => (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/coaches" element={<Coaches />} />
            <Route path="/sessions" element={<Sessions />} />
            
            {/* Member Routes - Protected */}
            <Route path="/member" element={
              <ProtectedRoute allowedRoles={['Member']}>
                <MemberDashboard />
              </ProtectedRoute>
            } />
            <Route path="/member/bookings" element={
              <ProtectedRoute allowedRoles={['Member']}>
                <MemberBookings />
              </ProtectedRoute>
            } />
            <Route path="/member/sessions" element={
              <ProtectedRoute allowedRoles={['Member']}>
                <MemberSessions />
              </ProtectedRoute>
            } />
            <Route path="/member/progress" element={
              <ProtectedRoute allowedRoles={['Member']}>
                <MemberProgress />
              </ProtectedRoute>
            } />
            <Route path="/member/reviews" element={
              <ProtectedRoute allowedRoles={['Member']}>
                <MemberReviews />
              </ProtectedRoute>
            } />
            
            {/* Coach Routes - Protected */}
            <Route path="/coach" element={
              <ProtectedRoute allowedRoles={['Coach']}>
                <CoachDashboard />
              </ProtectedRoute>
            } />
            <Route path="/coach/sessions" element={
              <ProtectedRoute allowedRoles={['Coach']}>
                <CoachSessions />
              </ProtectedRoute>
            } />
            <Route path="/coach/attendance" element={
              <ProtectedRoute allowedRoles={['Coach']}>
                <CoachAttendance />
              </ProtectedRoute>
            } />
            <Route path="/coach/reviews" element={
              <ProtectedRoute allowedRoles={['Coach']}>
                <CoachReviews />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes - Protected */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/members" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminMembers />
              </ProtectedRoute>
            } />
            <Route path="/admin/coaches" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminCoaches />
              </ProtectedRoute>
            } />
            <Route path="/admin/sessions" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminSessions />
              </ProtectedRoute>
            } />
            <Route path="/admin/class-types" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminClassTypes />
              </ProtectedRoute>
            } />
            <Route path="/admin/bookings" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminBookings />
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
);

export default App;
