import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { UserProfileProvider } from "@/contexts/UserProfileContext.tsx"; // Changed to alias import
import { UserQuestsProvider } from "./contexts/UserQuestsContext.tsx";
import { TeamProvider } from "./contexts/TeamContext.tsx";
import { FriendProvider } from "./contexts/FriendContext.tsx";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" attribute="class">
    <AuthProvider>
      <UserProfileProvider>
        <UserQuestsProvider>
          <TeamProvider>
            <FriendProvider>
              <App />
            </FriendProvider>
          </TeamProvider>
        </UserQuestsProvider>
      </UserProfileProvider>
    </AuthProvider>
  </ThemeProvider>
);