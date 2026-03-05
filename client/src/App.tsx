import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Embed from "./pages/Embed";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/embed"} component={Embed} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster
              toastOptions={{
                style: {
                  fontFamily: "'Noto Kufi Arabic', 'DM Sans', sans-serif",
                  backgroundColor: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(10,22,40,0.08)",
                  color: "#0a1628",
                },
              }}
            />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
