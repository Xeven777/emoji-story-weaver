import { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/ui/navbar";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import { Loader } from "lucide-react";
const Stories = lazy(() => import("./pages/Stories"));
const StoryDetail = lazy(() => import("./pages/StoryDetail"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Sonner richColors />
    <BrowserRouter>
      <Navbar />
      <Suspense
        fallback={
          <div className="min-h-screen w-full grid place items-center">
            <Loader className="size-10 animate-spin ease-in-out" />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/stories/:id" element={<StoryDetail />} />
        </Routes>
      </Suspense>
      <Footer />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
