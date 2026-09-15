import { ImageResponse } from "next/og";
export const runtime = "edge";
export async function GET(request: Request) {
  const title = (new URL(request.url).searchParams.get("title") ?? "Arinze Okigbo").slice(0, 120);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0c0b",
          color: "#f1f3ed",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            color: "#a1aaa2",
          }}
        >
          <span>ARINZE OKIGBO</span>
          <span>FOUNDER · ENGINEER · BUILDER</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 50 ? 66 : 90,
            lineHeight: 1.05,
            letterSpacing: "-4px",
            maxWidth: 990,
          }}
        >
          {title}
          <span style={{ color: "#c2f6bd" }}>↗</span>
        </div>
        <div
          style={{
            display: "flex",
            borderTop: "1px solid #29302a",
            paddingTop: 24,
            justifyContent: "space-between",
            fontSize: 20,
          }}
        >
          <span>arinzeokigbo.com</span>
          <span style={{ color: "#c2f6bd" }}>Curiosity, made concrete.</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
