import { Github } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ButterflyFooter = () => {
  const navigate = useNavigate();
  return (
    <footer className="fade-in-element py-8 mt-16 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-center sm:text-left">
            &copy; 2025 The Butterfly Network. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-muted-foreground hover:text-[hsl(var(--butterfly-purple))] transition-colors text-sm"
              aria-label="About The Butterfly Network"
              onClick={() => navigate("/about")}
            >
              About Us
            </button>
            <button
              type="button"
              className="flex items-center gap-2 text-muted-foreground hover:text-[hsl(var(--neon-green))] transition-colors"
              aria-label="Visit The Butterfly Network on GitHub"
              onClick={() => window.open("https://github.com/CloveTwilight3", "_blank", "noopener,noreferrer")}
            >
              <Github size={20} />
              <span className="text-sm">GitHub</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ButterflyFooter;