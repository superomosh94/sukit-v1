"use client";

import type { PropsWithChildren } from "react";
import type { DeviceViewport } from "@/lib/builder/types";
import { cn } from "@/lib/utils/cn";

interface DeviceFrameProps {
  viewport: DeviceViewport;
}

export function DeviceFrame({
  viewport,
  children,
}: PropsWithChildren<DeviceFrameProps>) {
  return (
    <div
      className={cn(
        "mx-auto flex min-h-full flex-col transition-all duration-300",
        viewport === "desktop" && "w-full",
        viewport === "tablet" &&
          "w-[810px] rounded-lg border-2 border-muted bg-background shadow-xl",
        viewport === "phone" &&
          "w-[390px] rounded-[2rem] border-2 border-muted bg-background shadow-xl",
      )}
    >
      {viewport === "phone" && (
        <div className="flex items-center justify-center border-b border-muted py-2">
          <div className="h-1.5 w-20 rounded-full bg-muted" />
        </div>
      )}
      {viewport === "tablet" && (
        <div className="flex items-center justify-center border-b border-muted py-1.5">
          <div className="h-1 w-12 rounded-full bg-muted" />
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
}
