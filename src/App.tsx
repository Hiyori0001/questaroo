import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import LocationQuests from "./pages/LocationQuests";
import MiniGames from "./pages/MiniGames";
import ProfilePage from "./pages/ProfilePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import CreateQuestPage from "./pages/CreateQuestPage";
import TeamsPage from "./pages/TeamsPage";
import SocialPage from "./pages/SocialPage";
import EventModePage from "./pages/EventModePage"; // Import the new EventModePage
import Navbar from "./components/Navbar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/location-quests" element={<LocationQuests />} />
          <Route path="/mini-games" element={<MiniGames />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/create-quest" element={<CreateQuestPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/social" element={<SocialPage />} />
          <Route path="/events" element={<EventModePage />} /> {/* Add the new EventModePage route */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;