import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "@/app/page";

vi.mock("framer-motion", () => {
  const motionProxy = new Proxy(
    {},
    {
      get: () => {
        return ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
          <div {...props}>{children}</div>
        );
      },
    },
  );

  return {
    motion: motionProxy,
    useReducedMotion: () => true,
    useScroll: () => ({ scrollYProgress: 0 }),
    useTransform: () => 0,
  };
});

describe("Home page", () => {
  it("renders the hero positioning content", () => {
    render(<Home />);
    expect(screen.getByText("Founder")).toBeInTheDocument();
    expect(screen.getByText("Engineer")).toBeInTheDocument();
  });
});