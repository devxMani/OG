import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Mani — Research, Systems, Taste"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "#070707",
          padding: "72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            marginBottom: 24,
          }}
        >
          Research · Systems · Taste
        </div>
        <div style={{ display: "flex", fontSize: 92, color: "#fafafa", fontStyle: "italic" }}>Mani</div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "rgba(255,255,255,0.55)",
            marginTop: 20,
            maxWidth: 820,
            lineHeight: 1.4,
          }}
        >
          Voice AI, LLM evaluations, and interpretability-driven evals synthesis.
        </div>
      </div>
    ),
    size
  )
}