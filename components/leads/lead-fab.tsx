"use client";

import { useState, useEffect, useRef } from "react";
import { User, FileText, History, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function LeadFab() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background border-t lg:hidden pb-safe transition-transform duration-300",
        isVisible ? "translate-y-0" : "translate-y-[150%]"
      )}
    >
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => scrollToSection("lead-info-section")}
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-muted-foreground hover:text-primary transition-colors active:text-primary"
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">Lead Info</span>
        </button>
        <button
          onClick={() => scrollToSection("lead-quotations-section")}
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-muted-foreground hover:text-primary transition-colors active:text-primary"
        >
          <FileText className="h-5 w-5" />
          <span className="text-[10px] font-medium">Quotations</span>
        </button>
        <button
          onClick={() => scrollToSection("lead-timeline-section")}
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-muted-foreground hover:text-primary transition-colors active:text-primary"
        >
          <History className="h-5 w-5" />
          <span className="text-[10px] font-medium">Timeline</span>
        </button>
        <button
          onClick={() => scrollToSection("lead-danger-section")}
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-muted-foreground hover:text-primary transition-colors active:text-primary"
        >
          <Settings className="h-5 w-5" />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
}
