import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { UserProfileProvider } from "@/contexts/UserProfileContext.tsx";
import { AllQuestsProvider } from "./contexts/AllQuestsContext.tsx"; // Updated import
import { TeamProvider } from "./contexts/TeamContext.tsx";
import { FriendProvider } from "./contexts/FriendContext.tsx";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" attribute="class">
    <AuthProvider>
      <UserProfileProvider>
        <AllQuestsProvider> {/* Updated provider name */}
          <TeamProvider>
            <FriendProvider>
              <App />
            </FriendProvider>
          </TeamProvider>
        </AllQuestsProvider>
      </UserProfileProvider>
    </AuthProvider>
  </ThemeProvider>
);