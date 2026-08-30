import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PageMeta } from "./components/PageMeta";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/auth"
          element={
            <>
              <PageMeta
                title="Sign In — Todo List by Franklin Coetzee"
                description="Sign in or create an account to manage your tasks securely in the Todo List app by Franklin Coetzee."
                path="/auth"
              />
              <Auth />
            </>
          }
        />
        <Route
          path="/reset-password"
          element={
            <>
              <PageMeta
                title="Reset Password — Todo List by Franklin Coetzee"
                description="Reset your Todo List account password securely."
                path="/reset-password"
              />
              <ResetPassword />
            </>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <PageMeta
                title="About Franklin Coetzee — Todo List"
                description="Learn about Franklin Coetzee, the developer behind this full-stack Todo List portfolio project."
                path="/about"
              />
              <About />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <PageMeta
                title="Contact Franklin Coetzee — Todo List"
                description="Send a message directly to Franklin Coetzee, developer of this Todo List app."
                path="/contact"
              />
              <Contact />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <PageMeta
                title="Todo List by Franklin Coetzee — Stay Organized"
                description="A full-stack Todo List app by Franklin Coetzee: secure accounts, drag-and-drop tasks, due dates, realtime avatars, and profile management."
                path="/"
              />
              <Index />
            </ProtectedRoute>
          }
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AnimatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
