import { act, cleanup, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { NYClock } from "./Interactions";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("retains a factual static timezone fallback on the server", () => {
  expect(renderToString(<NYClock />)).toContain("New York · Eastern time");
});

it("shares one formatter and timer only while clocks are visible, and resumes with current time", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-15T17:20:00Z"));
  const constructor = vi.spyOn(Intl, "DateTimeFormat");
  const observers: {
    notify: IntersectionObserverCallback;
    node?: Element;
    disconnect: ReturnType<typeof vi.fn>;
  }[] = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      notify: IntersectionObserverCallback;
      node?: Element;
      disconnect = vi.fn();
      constructor(notify: IntersectionObserverCallback) {
        this.notify = notify;
        observers.push(this);
      }
      observe(node: Element) {
        this.node = node;
      }
    },
  );
  let hidden = false;
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
  const { container, unmount } = render(
    <>
      <NYClock />
      <NYClock />
    </>,
  );
  const clocks = container.querySelectorAll(".hive-clock");
  const visibility = (index: number, intersecting: boolean, width = 100) =>
    act(() => {
      const observer = observers[index];
      observer.notify(
        [
          {
            isIntersecting: intersecting,
            intersectionRect: { width, height: 16 },
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      );
    });
  expect(constructor).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
  visibility(0, false);
  visibility(1, true, 0);
  expect(constructor).not.toHaveBeenCalled();
  visibility(0, true);
  expect(clocks[0]).toHaveTextContent("12:20 EST");
  expect(constructor).toHaveBeenCalledTimes(1);
  expect(vi.getTimerCount()).toBe(1);
  visibility(1, true);
  expect(clocks[1]).toHaveTextContent("12:20 EST");
  expect(constructor).toHaveBeenCalledTimes(1);
  expect(vi.getTimerCount()).toBe(1);
  act(() => vi.advanceTimersByTime(60000));
  expect(clocks[0]).toHaveTextContent("12:21 EST");
  expect(clocks[1]).toHaveTextContent("12:21 EST");
  expect(constructor).toHaveBeenCalledTimes(1);
  visibility(0, false);
  visibility(1, false);
  expect(vi.getTimerCount()).toBe(0);
  vi.setSystemTime(new Date("2026-07-15T17:35:00Z"));
  visibility(1, true);
  expect(clocks[1]).toHaveTextContent("13:35 EDT");
  expect(constructor).toHaveBeenCalledTimes(1);
  act(() => {
    hidden = true;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect(vi.getTimerCount()).toBe(0);
  vi.setSystemTime(new Date("2026-07-15T17:40:00Z"));
  act(() => {
    hidden = false;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect(clocks[1]).toHaveTextContent("13:40 EDT");
  expect(vi.getTimerCount()).toBe(1);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
  observers.forEach((observer) => expect(observer.disconnect).toHaveBeenCalledOnce());
});
