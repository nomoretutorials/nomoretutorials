"use client";

import React from "react";

import Sidebar from "../_components/Sidebar";

type Props = {
  params: { id: string };
};

export default function SpecificProjectPage({ params }: Props) {
  const { id } = params;

  return (
    <div className="h-lvh overflow-hidden p-2">
      <div className="bg-background h-full overflow-hidden rounded-2xl border px-0 py-0 shadow-sm">
        <div className="flex h-full">
          <Sidebar id={id} />

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl">
              <h1 className="text-2xl font-bold">
                ronit kedia <span className="text-muted-foreground text-sm">{id}</span>
              </h1>
              <p className="text-muted-foreground mt-4">
                This is the main canvas. Try dragging the divider between the left panel and this
                content to resize the panel. The implementation uses pointer events for crisp
                cross-device dragging without external libs.
              </p>

              <div className="mt-8 space-y-6">
                <div className="rounded-md border p-4">Main content block 1</div>
                <div className="rounded-md border p-4">Main content block 2</div>
                <div className="rounded-md border p-4">Main content block 3</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
