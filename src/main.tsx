import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { UserProfileProvider } from "@/contexts/UserProfileContext.tsx";
import { AllQuestsProvider } from "./contexts/AllQuestsContext.tsx";
import { TeamProvider } from "./contexts/TeamContext.tsx";
import { FriendProvider } from "./contexts/FriendContext.tsx";
import { SparkleProvider } from "@/contexts/SparkleContext.tsx"; // Import SparkleProvider here

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" attribute="class">
    <AuthProvider>
      <UserProfileProvider>
        <AllQuestsProvider>
          <TeamProvider>
            <FriendProvider>
              <SparkleProvider> {/* Wrap App with SparkleProvider here */}
                <App />
              </SparkleProvider>
            </FriendProvider>
          </TeamProvider>
        </AllQuestsProvider>
      </UserProfileProvider>
    </AuthProvider>
  </ThemeProvider>
);