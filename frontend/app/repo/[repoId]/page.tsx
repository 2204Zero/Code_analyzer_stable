"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useVertexStore } from "@/store/useVertexStore";
import { ArchitectureCanvas } from "@/components/3d/ArchitectureCanvas";
import { TopNav } from "@/components/dashboard/TopNav";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import { DiffModal } from "@/components/ui/DiffModal";
import { ChatDrawer } from "@/components/dashboard/ChatDrawer";
import { Atmosphere } from "@/components/ui/Atmosphere";

export default function RepoWorkspacePage() {
  const params = useParams();
  const repoId = Array.isArray(params.repoId) ? params.repoId[0] : params.repoId || "1";

  useEffect(() => {
    useVertexStore.getState().fetchArchitecture(repoId);
  }, [repoId]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#09090B] text-white">
      
      {/* 1. Deep Cinematic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Deep ambient glow - very subtle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/10 blur-[120px] rounded-full opacity-60" />
      </div>

      <Atmosphere />

      {/* 2. UI Layer */}
      <div className="relative z-20 pointer-events-none">
        <TopNav />
        <LeftSidebar />
      </div>
      
      {/* 3. Drawers & Modals (z-50+) */}
      <ChatDrawer />
      <DiffModal />

      {/* 4. The 3D Canvas (z-10) */}
      <ArchitectureCanvas />
    </main>
  );
}
