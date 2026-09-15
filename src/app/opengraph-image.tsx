import { ImageResponse } from "next/og";
export const runtime = "edge";
export const alt = "Arinze Okigbo — Founder. Engineer. Builder.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#0a0c0b",
          color: "#f1f3ed",
          padding: 64,
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 20, color: "#a1aaa2", display: "flex" }}>
          FOUNDER · ENGINEER · EXPLORER
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 120,
            lineHeight: 0.95,
            letterSpacing: "-7px",
          }}
        >
          <span>Arinze</span>
          <div style={{ display: "flex" }}>
            Okigbo<span style={{ color: "#c2f6bd" }}>↗</span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#c2f6bd" }}>
          Security. Identity. AI. / arinzeokigbo.com
        </div>
      </div>
    ),
    size,
  );
}
