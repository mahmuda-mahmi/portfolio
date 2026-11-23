interface GlitchWordProps {
  text: string;
}

export function GlitchWord({ text }: GlitchWordProps) {
  return (
    <span className="stretch-root">
      <span>{text}</span>
      <span className="stretch-root__glitch stretch-root__glitch--1" aria-hidden="true">
        {text}
      </span>
      <span className="stretch-root__glitch stretch-root__glitch--2" aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
