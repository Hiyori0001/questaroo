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
import EventModePage from "./pages/EventModePage";
import AccessibilityPage from "./pages/AccessibilityPage";
import QuestDetailsPage from "./pages/QuestDetailsPage";
import Navbar from "./components/Navbar";
import AuthPage from "./pages/AuthPage";
import QuestLogPage from "./pages/QuestLogPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ShopPage from "./pages/ShopPage";
import CuteBackground from "./components/CuteBackground"; // Import CuteBackground
// import GlobalSparkleClickEffect from "./components/GlobalSparkleClickEffect"; // Import GlobalSparkleClickEffect

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="relative min-h-screen flex flex-col"> {/* Main container for layout */}
          <Navbar />
          <CuteBackground /> {/* Render CuteBackground as a fixed, full-screen element */}
          {/* <GlobalSparkleClickEffect /> */} {/* Temporarily commented out for testing */}
          <main className="flex-grow pt-16 max-w-full overflow-x-hidden relative z-10"> {/* Main content, positioned on top */}
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/location-quests" element={<LocationQuests />} />
              <Route path="/location-quests/:id" element={<QuestDetailsPage />} />
              <Route path="/mini-games" element={<MiniGames />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/create-quest" element={<CreateQuestPage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/social" element={<SocialPage />} />
              <Route path="/events" element={<EventModePage />} />
              <Route path="/accessibility" element={<AccessibilityPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/quest-log" element={<QuestLogPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/shop" element={<ShopPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;