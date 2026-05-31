import type { PropsWithChildren, CSSProperties } from "react";

interface CoverSectionProps {
  bgImage?: string;
  bgColor?: string;
  overlay?: string;
  height?: string | number;
  className?: string;
}

export function CoverSection({
  bgImage,
  bgColor = "#000000",
  overlay,
  height,
  children,
  className,
}: PropsWithChildren<CoverSectionProps>) {
  const style: CSSProperties = {
    minHeight: height ?? "100vh",
    backgroundColor: bgColor,
    backgroundImage: bgImage ? `url(${bgImage})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <section className={`relative flex min-h-screen items-center justify-center ${className ?? ""}`} style={style}>
      {overlay && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: overlay }}
        />
      )}
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4">
        {children}
      </div>
    </section>
  );
}
