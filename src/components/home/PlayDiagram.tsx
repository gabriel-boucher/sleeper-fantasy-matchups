import { ReactNode } from 'react';

export type Play = 'headToHead' | 'crossingRoutes' | 'climb' | 'liveMotion';

const DEFENDER_ARM = 3;

function Defender({ x, y }: { x: number; y: number }) {
  const a = DEFENDER_ARM;
  return <path className="play-defender" d={`M${x - a} ${y - a}l${2 * a} ${2 * a}M${x + a} ${y - a}l${-2 * a} ${2 * a}`} />;
}

function Blocker({ x, y }: { x: number; y: number }) {
  return <circle className="play-blocker" cx={x} cy={y} r="3.5" />;
}

const PLAYS: Record<Play, ReactNode> = {
  headToHead: (
    <>
      <path className="play-scrimmage" d="M6 24h52" />
      <Defender x={18} y={13} />
      <Defender x={32} y={13} />
      <Defender x={46} y={13} />
      <Blocker x={18} y={35} />
      <Blocker x={32} y={35} />
      <Blocker x={46} y={35} />
    </>
  ),
  crossingRoutes: (
    <>
      <Blocker x={16} y={40} />
      <Blocker x={48} y={40} />
      <path className="play-route" d="M16 36C16 22 48 26 48 11M44 15l4-5 4 5" />
      <path className="play-route" d="M48 36C48 22 16 26 16 11M12 15l4-5 4 5" />
    </>
  ),
  climb: (
    <>
      <Defender x={14} y={30} />
      <Defender x={29} y={19} />
      <Blocker x={14} y={41} />
      <path className="play-route" d="M18 41h12V30h13V9M39 14l4-5 4 5" />
    </>
  ),
  liveMotion: (
    <>
      <Blocker x={10} y={36} />
      <path className="play-route" d="M14 36l5-5 5 5 5-5 5 5 5-5V12M35 17l4-5 4 5" />
      <circle className="play-ball" cx="52" cy="12" r="3.5" />
    </>
  )
};

export function PlayDiagram({ play }: { play: Play }) {
  return (
    <svg className="play-diagram" viewBox="0 0 64 48" aria-hidden="true">
      {PLAYS[play]}
    </svg>
  );
}
