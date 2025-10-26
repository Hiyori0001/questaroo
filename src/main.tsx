import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { UserProfileProvider } from "./contexts/UserProfileContext.tsx";
import { UserQuestsProvider } from "./contexts/UserQuestsContext.tsx";
import { TeamProvider } from "./contexts/TeamContext.tsx"; // Import TeamProvider

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" attribute="class">
    <AuthProvider>
      <UserProfileProvider>
        <UserQuestsProvider>
          <TeamProvider> {/* Wrap App with TeamProvider */}
            <App />
          </TeamProvider>
        </UserQuestsProvider>
      </UserProfileProvider>
    </AuthProvider>
  </ThemeProvider>
);