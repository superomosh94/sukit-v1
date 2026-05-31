import type { PropsWithChildren } from "react";

interface EmptySectionProps {
  className?: string;
}

export function EmptySection({
  className,
  children,
}: PropsWithChildren<EmptySectionProps>) {
  return (
    <section className={className}>
      <div className="mx-auto w-full max-w-[1200px] px-4 py-10">
        {children}
      </div>
    </section>
  );
}
