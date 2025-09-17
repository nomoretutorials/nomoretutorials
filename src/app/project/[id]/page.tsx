"use client";

import React from "react";
import Sidebar from "../_components/Sidebar";

type Props = {
  params: { id: string };
};

export default function SpecificProjectPage({ params }: Props) {
  const { id } = params;

  return (
    <div className="h-lvh p-2 overflow-hidden">
      <div className="h-full rounded-2xl border bg-background shadow-sm px-0 py-0 overflow-hidden">
        <div className="flex h-full">
          <Sidebar id={id} />

          {/* Main content */}
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-4xl">
              <h1 className="text-2xl font-bold">
                ronit kedia{" "}
                <span className="text-sm text-muted-foreground">{id}</span>
              </h1>
              <p className="mt-4 text-muted-foreground">
                This is the main canvas. Try dragging the divider between the
                left panel and this content to resize the panel. The
                implementation uses pointer events for crisp cross-device
                dragging without external libs.
              </p>

              <div className="mt-8 space-y-6">
                <div className="p-4 border rounded-md">
                  Main content block 1
                </div>
                <div className="p-4 border rounded-md">
                  Main content block 2
                </div>
                <div className="p-4 border rounded-md">
                  Main content block 3
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
