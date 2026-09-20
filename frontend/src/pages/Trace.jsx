import html from "../trace/trace.html?raw";

export default function Trace() {
  return (
    <iframe
      title="ShieldAI Trace"
      srcDoc={html}
      style={{
        position: "fixed",
        top: "64px",
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "calc(100vh - 64px)",
        border: 0,
        background: "#111827",
      }}
    />
  );
}
