import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StoryGenerator from "./pages/StoryGenerator";
import About from "./pages/About"; // Import the new About page
import LocationQuests from "./pages/LocationQuests"; // Import the new LocationQuests page
import Navbar from "./components/Navbar"; // Import the Navbar component

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar /> {/* Render the Navbar at the top */}
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/story-generator" element={<StoryGenerator />} />
          <Route path="/about" element={<About />} /> {/* Add the new About route */}
          <Route path="/location-quests" element={<LocationQuests />} /> {/* Add the new LocationQuests route */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;