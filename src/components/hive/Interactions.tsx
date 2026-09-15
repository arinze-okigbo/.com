"use client";
import { useReducedMotion } from "./motion/preferences";
import { Icon } from "./Icon";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  ViewTransition,
  type ReactNode,
  type MouseEvent,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { springKeyframes } from "./motion/native-spring";

type TransitionDocument = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};
let soundEnabled = false;
let audioContext: AudioContext | undefined;
function playClick() {
  if (!soundEnabled) return;
  try {
    audioContext ||= new AudioContext();
    void audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(640, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(320, audioContext.currentTime + 0.045);
    gain.gain.setValueAtTime(0.025, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.065);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.07);
  } catch {
    /* Audio is an optional enhancement. */
  }
}

let ephemeralLight = false;
function readTheme() {
  try {
    const saved = localStorage.getItem("hive-theme");
    return saved ? saved === "light" : ephemeralLight;
  } catch {
    return ephemeralLight;
  }
}
function subscribeTheme(callback: () => void) {
  addEventListener("storage", callback);
  addEventListener("hive-theme-change", callback);
  return () => {
    removeEventListener("storage", callback);
    removeEventListener("hive-theme-change", callback);
  };
}
export function ThemeToggle() {
  const light = useSyncExternalStore(subscribeTheme, readTheme, () => false);
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const cancelWipe = useRef<(() => void) | null>(null);
  useEffect(() => {
    const cancel = () => cancelWipe.current?.();
    const onNavigation = (event: globalThis.MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("a[href]")) cancel();
    };
    document.addEventListener("click", onNavigation, true);
    document.addEventListener("visibilitychange", cancel);
    addEventListener("popstate", cancel);
    return () => {
      cancel();
      document.removeEventListener("click", onNavigation, true);
      document.removeEventListener("visibilitychange", cancel);
      removeEventListener("popstate", cancel);
    };
  }, [pathname, reduced]);
  useEffect(() => {
    document.documentElement.dataset.theme = light ? "light" : "dark";
    document.documentElement.classList.toggle("light", light);
  }, [light]);
  const glyph = useRef<SVGSVGElement>(null);
  const previousLight = useRef(light);
  useEffect(() => {
    const previous = previousLight.current;
    previousLight.current = light;
    const node = glyph.current;
    if (!node || reduced || previous === light || typeof node.animate !== "function") return;
    const animations = [
      node.animate(
        springKeyframes(previous ? 90 : 0, light ? 90 : 0, (angle) => ({
          transform: `rotate(${angle}deg)`,
        })),
        { duration: 600, easing: "linear" },
      ),
    ];
    node.querySelectorAll<SVGGElement>("[data-theme-glyph]").forEach((group) => {
      const show = group.dataset.themeGlyph === (light ? "sun" : "moon");
      animations.push(
        group.animate(
          springKeyframes(show ? 0 : 1, show ? 1 : 0, (value) => ({
            opacity: value,
            transform: `scale(${0.8 + 0.2 * value})`,
          })),
          { duration: 600, easing: "linear" },
        ),
      );
    });
    return () => animations.forEach((animation) => animation.cancel());
  }, [light, reduced]);
  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    const next = !light;
    const update = () => {
      ephemeralLight = next;
      document.documentElement.dataset.theme = next ? "light" : "dark";
      document.documentElement.classList.toggle("light", next);
      try {
        localStorage.setItem("hive-theme", next ? "light" : "dark");
      } catch {
        /* Theme still works for this visit. */
      }
      dispatchEvent(new Event("hive-theme-change"));
    };
    cancelWipe.current?.();
    update();
    if (reduced || typeof Element.prototype.animate !== "function") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.detail === 0 ? bounds.x + bounds.width / 2 : event.clientX;
    const y = event.detail === 0 ? bounds.y + bounds.height / 2 : event.clientY;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const overlay = document.createElement("div");
    overlay.className = "hive-theme-wipe";
    overlay.setAttribute("aria-hidden", "true");
    document.body.append(overlay);
    const animation = overlay.animate(
      springKeyframes(0, 1, (progress) => ({
        clipPath: `circle(${Math.max(0, progress) * radius}px at ${x}px ${y}px)`,
        opacity: 0.16 * Math.max(0, 1 - progress),
      })),
      { duration: 600, easing: "linear" },
    );
    const cleanup = () => {
      animation.cancel();
      overlay.remove();
      if (cancelWipe.current === cleanup) cancelWipe.current = null;
    };
    cancelWipe.current = cleanup;
    void animation.finished.then(cleanup, cleanup);
  };
  return (
    <button
      className="hive-icon-button theme-toggle"
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${light ? "dark" : "light"} mode`}
      title={`Switch to ${light ? "dark" : "light"} mode`}
    >
      <svg
        ref={glyph}
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
        style={{ transform: `rotate(${light ? 90 : 0}deg)` }}
      >
        <g
          data-theme-glyph="moon"
          style={{
            transformOrigin: "12px 12px",
            opacity: light ? 0 : 1,
            transform: `scale(${light ? 0.8 : 1})`,
          }}
        >
          <path d="M18 16 C14.5 20 8 18 6 14 C4 10 6 5 10 4 C8 8 9 12 12 14 C14 16 16 16 18 16 Z" />
        </g>
        <g
          data-theme-glyph="sun"
          style={{
            transformOrigin: "12px 12px",
            opacity: light ? 1 : 0,
            transform: `scale(${light ? 1 : 0.8})`,
          }}
        >
          <path d="M12 5 C15.866 5 19 8.134 19 12 C19 15.866 15.866 19 12 19 C8.134 19 5 15.866 5 12 C5 8.134 8.134 5 12 5 Z" />
        </g>
        <g data-theme-glyph="sun" style={{ opacity: light ? 1 : 0, transformOrigin: "12px 12px" }}>
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d="M12 1v2" transform={`rotate(${i * 45} 12 12)`} />
          ))}
        </g>
      </svg>
    </button>
  );
}

export function SoundToggle() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const click = (event: Event) => {
      if (event.target instanceof Element && event.target.closest("button,a")) playClick();
    };
    document.addEventListener("click", click);
    return () => {
      document.removeEventListener("click", click);
      soundEnabled = false;
    };
  }, []);
  return (
    <button
      className="hive-sound-toggle"
      type="button"
      aria-pressed={enabled}
      onClick={() => {
        soundEnabled = !enabled;
        setEnabled(!enabled);
      }}
      title="Optional synthesized interface sounds"
    >
      Sound {enabled ? "on" : "off"}
      <span aria-hidden="true"> {enabled ? "◖))" : "◖·"}</span>
    </button>
  );
}

export function CopyButton({ value, label = "Copy email" }: { value: string; label?: string }) {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <span className="hive-copy-control">
      <button
        className="hive-copy-button"
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setMessage("Copied to clipboard");
          } catch {
            setMessage("Copy unavailable. Select the address to copy it.");
          }
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setMessage(""), 4000);
        }}
      >
        {message === "Copied to clipboard" ? (
          <>
            Copied <Icon name="check" />
          </>
        ) : (
          label
        )}
      </button>
      <span className="hive-copy-status" role="status">
        {message}
      </span>
    </span>
  );
}

// Intl initialization can load timezone data. Defer it until a clock is
// visible, and share both the formatter and 15-second tick across instances.
let newYorkFormatter: Intl.DateTimeFormat | undefined;
let clockTimer: ReturnType<typeof setInterval> | undefined;
let clockText = "New York · Eastern time";
const visibleClocks = new Set<(time: string) => void>();
function subscribeClock(listener: (time: string) => void) {
  visibleClocks.add(listener);
  if (!clockTimer) {
    const update = () => {
      newYorkFormatter ??= new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZoneName: "short",
      });
      clockText = newYorkFormatter.format(new Date());
      visibleClocks.forEach((notify) => notify(clockText));
    };
    update();
    clockTimer = setInterval(update, 15000);
  } else listener(clockText);
  return () => {
    visibleClocks.delete(listener);
    if (!visibleClocks.size) {
      clearInterval(clockTimer);
      clockTimer = undefined;
    }
  };
}

export function NYClock() {
  const [time, setTime] = useState("New York · Eastern time");
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let inView = false;
    let unsubscribe: (() => void) | undefined;
    const reconcile = () => {
      if (inView && !document.hidden) unsubscribe ??= subscribeClock(setTime);
      else {
        unsubscribe?.();
        unsubscribe = undefined;
      }
    };
    // Display:none ancestors (the mobile hero label) have no intersection.
    // Zero-area edge contact must not activate the below-fold footer clock.
    const observer = new IntersectionObserver(([entry]) => {
      inView =
        entry.isIntersecting &&
        entry.intersectionRect.width > 0 &&
        entry.intersectionRect.height > 0;
      reconcile();
    });
    observer.observe(node);
    document.addEventListener("visibilitychange", reconcile);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", reconcile);
      unsubscribe?.();
    };
  }, []);
  return (
    <span ref={ref} className="hive-clock">
      {time}
    </span>
  );
}

export function SharedElement({ name, children }: { name: string; children: ReactNode }) {
  return (
    <ViewTransition name={name} share="hive-morph" default="none">
      {children}
    </ViewTransition>
  );
}

export function TransitionLink({
  href,
  children,
  className,
  transitionName,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  transitionName?: string;
}) {
  const link = (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
  return transitionName ? <SharedElement name={transitionName}>{link}</SharedElement> : link;
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const previousPath = useRef(pathname);
  useEffect(() => {
    const changed = previousPath.current !== pathname;
    previousPath.current = pathname;
    const node = ref.current;
    if (
      !changed ||
      reduced ||
      (document as TransitionDocument).startViewTransition ||
      !node?.animate
    )
      return;
    const animation = node.animate(
      springKeyframes(10, 0, (y) => ({ transform: `translateY(${y}px)` })),
      { duration: 600, easing: "linear" },
    );
    return () => animation.cancel();
  }, [pathname, reduced]);
  return (
    <ViewTransition
      key={pathname}
      default="none"
      update="none"
      enter="hive-page-enter"
      exit="hive-page-exit"
    >
      {/* Streamed content updates stay immediate; only a route-key change
          creates the exit/enter pair. No hydration-time wrapper replacement. */}
      <div ref={ref}>{children}</div>
    </ViewTransition>
  );
}

/** Composes through the owner's existing public email; there is no submission backend. */
export function ContactComposer({ email = "arinze@splita.co" }: { email?: string }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  return (
    <form
      className="hive-contact-composer"
      onSubmit={(event) => {
        event.preventDefault();
        const draft = `mailto:${encodeURIComponent(email).replace("%40", "@")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        setStatus("Opening your email app. Message has not been sent.");
        window.location.assign(draft);
      }}
    >
      <label htmlFor="contact-subject">What are you thinking about?</label>
      <input
        id="contact-subject"
        name="subject"
        value={subject}
        onChange={(event) => setSubject(event.target.value)}
        required
        maxLength={140}
        placeholder="A project, an idea, a hello"
      />
      <label htmlFor="contact-message">Your message</label>
      <textarea
        id="contact-message"
        name="message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        required
        maxLength={4000}
        rows={5}
        placeholder="Tell me a little about it."
      />
      <p className="hive-lab-caption">
        Opens a draft in your email app. You decide when to send it.
      </p>
      <button className="button button-primary" type="submit">
        Open email draft <Icon name="arrow-up-right" />
      </button>
      <p className="hive-compose-status" role="status">
        {status}
      </p>
    </form>
  );
}
