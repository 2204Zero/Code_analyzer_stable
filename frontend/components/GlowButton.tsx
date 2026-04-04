"use client";

import React from "react";

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

const GlowButton: React.FC<GlowButtonProps> = ({ 
  loading, 
  onClick, 
  children, 
  className = "", 
  ...props 
}) => {
  return (
    <button
      {...props}
      onClick={onClick}
      disabled={loading}
      className={`relative px-6 py-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-400 text-black text-sm font-bold active:scale-95 disabled:cursor-not-allowed ${
        loading ? "animate-glow-pulse transition-none" : "transition-all hover:shadow-[0_0_22px_rgba(16,185,129,0.35)]"
      } ${className}`}
      style={
        !loading 
          ? { boxShadow: "0 6px 18px rgba(0,0,0,0.25)" } 
          : { zIndex: 10 }
      }
    >
      {loading ? "Analyzing..." : children}
    </button>
  );
};

export default GlowButton;
