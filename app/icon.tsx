import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0714",
          borderRadius: 8,
          border: "1.5px solid #a855f7",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236,72,153,0.6) 0%, rgba(168,85,247,0.4) 50%, transparent 70%)",
            filter: "blur(2px)",
          }}
        />
        {/* Stylized geometric N symbol */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 4v16M19 4v16M5 6l14 12"
            stroke="url(#gradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
