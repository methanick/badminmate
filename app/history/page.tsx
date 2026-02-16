"use client";

import { HistoryPanel } from "@/components/history-panel";

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <HistoryPanel showBackButton showTitle />
      </div>
    </div>
  );
}
