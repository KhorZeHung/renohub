"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, User, Layers, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuotationFab() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show when scrolling up or at the top
      // Hide when scrolling down and past 50px
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
          onClick={() => scrollToSection("info-section")}
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-muted-foreground hover:text-primary transition-colors active:text-primary"
        >
          <FileText className="h-5 w-5" />
          <span className="text-[10px] font-medium">Quotation Info</span>
        </button>
        <button
          onClick={() => scrollToSection("client-section")}
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-muted-foreground hover:text-primary transition-colors active:text-primary"
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">Client info</span>
        </button>
        <button
          onClick={() => scrollToSection("groups-section")}
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-muted-foreground hover:text-primary transition-colors active:text-primary"
        >
          <Layers className="h-5 w-5" />
          <span className="text-[10px] font-medium">Groups</span>
        </button>
        <button
          onClick={() => scrollToSection("summary-section")}
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-muted-foreground hover:text-primary transition-colors active:text-primary"
        >
          <Receipt className="h-5 w-5" />
          <span className="text-[10px] font-medium">Summary</span>
        </button>
      </div>
    </div>
  );
}
