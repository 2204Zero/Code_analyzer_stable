"use client";

import React, { useEffect } from "react";
import { useVertexStore } from "@/store/useVertexStore";
import { ArchitectureCanvas } from "@/components/3d/ArchitectureCanvas";
import { TopNav } from "@/components/dashboard/TopNav";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import { DiffModal } from "@/components/ui/DiffModal";

export default function DashboardPage() {
  useEffect(() => {
    useVertexStore.getState().fetchArchitecture("1");
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#09090B]">
      <TopNav />
      <LeftSidebar />
      <ArchitectureCanvas />
      <DiffModal />
    </main>
  );
}
