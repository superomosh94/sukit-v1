"use client";

import { useKernel } from "./registry-provider";
import { useEffect, useState } from "react";

interface SlotComponent {
  Component: React.ComponentType<any>;
  id: string;
  when?: string;
  position: number;
}

export function SlotRenderer({ slot, context }: { slot: string; context?: any }) {
  const kernel = useKernel();
  const [components, setComponents] = useState<SlotComponent[]>([]);

  useEffect(() => {
    const update = () => {
      const comps = kernel.ui.getSlotComponents(slot);
      setComponents(
        comps.map((c, i) => ({
          Component: c.component,
          id: `${slot}-${i}`,
          when: c.options.when,
          position: c.options.position ?? 50,
        })),
      );
    };

    update();
    const unsub = kernel.events.on("ui:updated", update);
    return unsub;
  }, [slot, kernel]);

  return (
    <>
      {components.map(({ Component, id }) => (
        <Component key={id} context={context} />
      ))}
    </>
  );
}
