export default function CpuTitle({ text = "CPU" }: { text?: string }) {
  return (
    <h1 className="cpu-title" data-text={text}>
      {text}
    </h1>
  );
}
