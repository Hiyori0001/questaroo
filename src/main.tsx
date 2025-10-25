import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { UserProfileProvider } from "./contexts/UserProfileContext.tsx"; // Import UserProfileProvider

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" attribute="class">
    <AuthProvider>
      <UserProfileProvider> {/* Wrap App with UserProfileProvider */}
        <App />
      </UserProfileProvider>
    </AuthProvider>
  </ThemeProvider>
);