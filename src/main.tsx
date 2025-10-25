import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { UserProfileProvider } from "./contexts/UserProfileContext.tsx";
import { UserQuestsProvider } from "./contexts/UserQuestsContext.tsx"; // Import UserQuestsProvider

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" attribute="class">
    <AuthProvider>
      <UserProfileProvider>
        <UserQuestsProvider> {/* Wrap App with UserQuestsProvider */}
          <App />
        </UserQuestsProvider>
      </UserProfileProvider>
    </AuthProvider>
  </ThemeProvider>
);