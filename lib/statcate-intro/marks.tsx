import type { ReactNode } from "react";

type MarkProps = {
  size?: number;
  className?: string;
};

function Svg({ size = 22, className, children }: MarkProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function MaleMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="15" r="6" />
      <path d="m13.3 10.7 7-7M14 3h7v7" />
    </Svg>
  );
}

export function FemaleMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="6" />
      <path d="M12 14v8M8 18h8" />
    </Svg>
  );
}

export function TempleMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <path d="M3 21h18" />
      <path d="M5 21V12l7-6 7 6v9" />
      <path d="M9 21v-4h6v4" />
      <path d="M7 12h10" />
      <path d="M12 6V3" />
      <path d="M9.5 8.5h5" />
    </Svg>
  );
}

export function PeopleMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20c.4-3.2 2.6-5 5.5-5s5.1 1.8 5.5 5" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M16 20c.3-2.2 1.7-3.6 3.8-4" />
    </Svg>
  );
}

export function BookMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <path d="M4 5.5c2.2-1 4.3-1.2 8 0v13c-3.7-1.2-5.8-1-8 0V5.5Z" />
      <path d="M12 5.5c2.2-1 4.3-1.2 8 0v13c-3.7-1.2-5.8-1-8 0" />
      <path d="M12 5.5v13" />
    </Svg>
  );
}

export function DharmaMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2.2" />
      <path d="M12 3.5v4.2M12 16.3v4.2M3.5 12h4.2M16.3 12h4.2" />
      <path d="m6 6 3 3M15 15l3 3M18 6l-3 3M9 15l-3 3" />
    </Svg>
  );
}

export function ChurchMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <path d="M12 2v4" />
      <path d="M10 4h4" />
      <path d="M5 21V11l7-5 7 5v10" />
      <path d="M10 21v-5h4v5" />
      <path d="M8 11h8" />
    </Svg>
  );
}

export function MosqueMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <path d="M4 21V11" />
      <path d="M4 8v3" />
      <path d="M4 8c0-1.2.9-2 2-2s2 .8 2 2" />
      <path d="M20 21V11" />
      <path d="M20 8v3" />
      <path d="M20 8c0-1.2-.9-2-2-2s-2 .8-2 2" />
      <path d="M6 21V13c0-3.3 2.7-5.5 6-7 3.3 1.5 6 3.7 6 7v8" />
      <path d="M12 6.2V4" />
      <path d="M10 21v-4h4v4" />
    </Svg>
  );
}

export function OtherMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v8M8.5 12h7" />
    </Svg>
  );
}

export function InsuredMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <path d="M12 3 19 6.5v5.2c0 4.2-2.8 7.2-7 8.8-4.2-1.6-7-4.6-7-8.8V6.5L12 3Z" />
      <circle cx="12" cy="10" r="2" />
      <path d="M8.5 16c.5-1.8 2-2.7 3.5-2.7s3 0.9 3.5 2.7" />
    </Svg>
  );
}

export function PensionerMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <circle cx="10" cy="7" r="2.4" />
      <path d="M6.5 20c.4-3.2 2.2-5 3.5-5s2.6 1.2 3.2 3" />
      <path d="M14 11.5 16.5 20" />
      <path d="M15.2 16.5h3.3" />
    </Svg>
  );
}

export function CoinMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.2v9.6" />
      <path d="M9.4 9.2c.7-1 2-1.5 2.6-1.5 1.6 0 2.6.8 2.6 2s-1 1.8-2.6 2.2c-1.7.4-2.7 1-2.7 2.2s1.1 2.1 2.8 2.1c.8 0 2-.4 2.6-1.4" />
    </Svg>
  );
}

export function CareMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <path d="M12 19s-6.5-4.2-6.5-9A3.6 3.6 0 0 1 12 8a3.6 3.6 0 0 1 6.5 2c0 4.8-6.5 9-6.5 9Z" />
    </Svg>
  );
}

export function SdgMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function ChildMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="2.4" />
      <path d="M8 20c.4-3.4 2-5.2 4-5.2s3.6 1.8 4 5.2" />
      <path d="M9 13.5 7.5 17M15 13.5 16.5 17" />
    </Svg>
  );
}

export function ElderMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <circle cx="10" cy="7.2" r="2.3" />
      <path d="M7 20c.4-3 2-4.8 3-4.8 1.2 0 2.2 1 2.8 2.6" />
      <path d="M14 11 16.2 20" />
      <path d="M15.2 16.2h3.2" />
    </Svg>
  );
}

export function TrendMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <path d="M3 17 9 11l4 4 8-9" />
      <path d="M15 6h6v6" />
    </Svg>
  );
}

export function MapMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
      <circle cx="12" cy="11" r="2" />
    </Svg>
  );
}

export function GlobeMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.4 2.2 3.6 5.2 3.6 8.5s-1.2 6.3-3.6 8.5C9.6 18.3 8.4 15.3 8.4 12S9.6 5.7 12 3.5Z" />
    </Svg>
  );
}

export function PercentMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <path d="M6 18 18 6" />
      <circle cx="7.5" cy="7.5" r="2.2" />
      <circle cx="16.5" cy="16.5" r="2.2" />
    </Svg>
  );
}

export function LeafMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <path d="M5 19c8-1 13-7 14-14-8 1-13 7-14 14Z" />
      <path d="M8 16c2.2-2.4 5-4.2 8.5-5.2" />
    </Svg>
  );
}

export function BoltMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <path d="M13 3 6 13h6l-1 8 7-10h-6l1-8Z" />
    </Svg>
  );
}

export function ChartMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <path d="M4 20h16" />
      <path d="M7 16v-5" />
      <path d="M12 16V8" />
      <path d="M17 16v-8" />
    </Svg>
  );
}

export function FactoryMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <path d="M3 21V9l6 4V9l6 4V7h6v14H3Z" />
      <path d="M7 21v-3M12 21v-3M17 21v-3" />
    </Svg>
  );
}
