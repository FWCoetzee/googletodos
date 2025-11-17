import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { PageTransition } from "@/components/PageTransition";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-8 text-center">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              404
            </h1>
            <p className="text-xl text-foreground mb-2">Oops! Page not found</p>
            <p className="text-muted-foreground mb-6">
              The page you're looking for doesn't exist.
            </p>
            <a 
              href="/" 
              className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg shadow-glow hover:shadow-lg transition-all"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default NotFound;
