"use client";

import { useRef, useEffect, type PropsWithChildren, type CSSProperties } from "react";

interface ParallaxSectionProps {
  bgImage?: string;
  bgColor?: string;
  speed?: number;
  className?: string;
}

export function ParallaxSection({
  bgImage,
  bgColor = "#1a1a2e",
  speed = 0.5,
  children,
  className,
}: PropsWithChildren<ParallaxSectionProps>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleScroll = () => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const offset = rect.top * speed;
      el.style.backgroundPositionY = `${offset}px`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  const style: CSSProperties = {
    backgroundColor: bgColor,
    backgroundImage: bgImage ? `url(${bgImage})` : undefined,
    backgroundSize: "cover",
    backgroundAttachment: "fixed",
    backgroundPosition: "center",
  };

  return (
    <section
      ref={ref}
      className={`relative overflow-hidden ${className ?? ""}`}
      style={style}
    >
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 py-20">
        {children}
      </div>
    </section>
  );
}
