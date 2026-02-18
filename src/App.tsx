// src/App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { TestimoniProvider } from "@/context/TestimoniContext";
import { ProgramProvider } from "@/context/ProgramContext";
import { KomisiMagangProvider } from "@/context/KomisiMagangContext";
import { RequirementsProvider } from "@/context/RequirementsContext";
import { ContactProvider } from "@/context/ContactContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProgramManager from "./pages/admin/ProgramManager";
import TestimoniManager from "./pages/admin/TestimoniManager";
import KomisiManager from "./pages/admin/KomisiMagang";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <TestimoniProvider>
          <ProgramProvider>
            <RequirementsProvider>
              <KomisiMagangProvider>
                <ContactProvider>
                  <BrowserRouter>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<Login />} />

                      {/* Protected Admin Routes */}
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute>
                            <AdminLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<AdminDashboard />} />
                        <Route path="program" element={<ProgramManager />} />
                        <Route
                          path="testimoni"
                          element={<TestimoniManager />}
                        />
                        <Route path="magang" element={<KomisiManager />} />
                      </Route>

                      {/* Not Found */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </ContactProvider>
              </KomisiMagangProvider>
            </RequirementsProvider>
          </ProgramProvider>
        </TestimoniProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
