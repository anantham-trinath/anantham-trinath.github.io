import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PostView from "./pages/PostView";
import TeachingHome from "./pages/teaching/TeachingHome";
import CoursePage from "./pages/teaching/CoursePage";
import LecturePage from "./pages/teaching/LecturePage";
import ThemeProvider from "./components/ThemeProvider";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/post/:slug" element={<PostView />} />
            <Route path="/teaching" element={<TeachingHome />} />
            <Route path="/teaching/:courseSlug" element={<CoursePage />} />
            <Route path="/teaching/:courseSlug/:lectureSlug" element={<LecturePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
