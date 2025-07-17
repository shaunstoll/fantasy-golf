import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className?: string;
    // eslint-disable-next-line @next/next/no-img-element
  }) => <img src={src} alt={alt} className={className} />,
}));

vi.mock("@formkit/auto-animate/react", () => ({
  useAutoAnimate: vi.fn(() => [vi.fn()]),
}));
