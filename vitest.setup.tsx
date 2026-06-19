import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";

// Persisted UI state (sessionStorage) must not leak between tests.
afterEach(() => {
  sessionStorage.clear();
});

vi.mock("next/image", () => ({
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    <img src={src} alt={alt} className={className} />
  ),
}));

vi.mock("@formkit/auto-animate/react", () => ({
  useAutoAnimate: vi.fn(() => [vi.fn()]),
}));
