import type { ReactNode } from "react";

/** Original 16-bit style icons. Each is a 16×16 grid drawn with rectangles. */
function Pix({ cells, colors }: { cells: string[]; colors: Record<string, string> }) {
  const rects: ReactNode[] = [];
  cells.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      const fill = colors[cell];
      if (!fill) return;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />);
    });
  });
  return (
    <svg viewBox="0 0 16 16" className="size-10" shapeRendering="crispEdges" aria-hidden>
      {rects}
    </svg>
  );
}

const skin = { ".": "", k: "#1a120c", s: "#f3d2b0", h: "#3d342c", b: "#2a6fdb", w: "#f7f1e6", r: "#c4473a", y: "#e2b143", g: "#3f8f55", c: "#d7dde6", d: "#6d7684" };

export function AboutIcon() {
  return (
    <Pix
      colors={skin}
      cells={[
        "................",
        "....kkkkkk......",
        "...kssssssk.....",
        "...kssssssk.....",
        "...ksshhssk.....",
        "....kkkkkk......",
        ".....bbbb.......",
        "...bbbbbbbb.....",
        "..bbbbbbbbbb....",
        "..bbbbbbbbbb....",
        "..bbbbbbbbbb....",
        "...bbbbbbbb.....",
        "................",
        "................",
        "................",
        "................",
      ]}
    />
  );
}

export function PhotosIcon() {
  return (
    <Pix
      colors={{ ...skin, f: "#9fd0ea", p: "#f4f7fb" }}
      cells={[
        "................",
        ".kkkkkkkkkkkkk..",
        ".kpppppppppppk..",
        ".kpppppppppppk..",
        ".kppfffppppppk..",
        ".kppfffppyyypk..",
        ".kpppppppyyyyk..",
        ".kppppgggggppk..",
        ".kppgggggggppk..",
        ".kpggggggggppk..",
        ".kpppppppppppk..",
        ".kkkkkkkkkkkkk..",
        "................",
        "................",
        "................",
        "................",
      ]}
    />
  );
}

export function ExperienceIcon() {
  return (
    <Pix
      colors={{ ...skin, n: "#8a5a32" }}
      cells={[
        "................",
        "..kkkk..........",
        ".knnnkkkkk......",
        ".knnnnnnnk......",
        ".knwwwwwnk......",
        ".knwwwwwnk......",
        ".knwwwwwnk......",
        ".knwwwwwnk......",
        ".knwwwwwnk......",
        ".knwwwwwnk......",
        ".kkkkkkkkk......",
        "................",
        "................",
        "................",
        "................",
        "................",
      ]}
    />
  );
}

export function ProjectsIcon() {
  return (
    <Pix
      colors={{ ...skin, f: "#e6b84a", e: "#c4922c" }}
      cells={[
        "................",
        "...eeeeee.......",
        "..effffffk......",
        ".ekkkkkkkkk.....",
        ".kffffffffk.....",
        ".kffffffffk.....",
        ".kffffffffk.....",
        ".kffffffffk.....",
        ".kffffffffk.....",
        ".kffffffffk.....",
        ".kkkkkkkkkk.....",
        "................",
        "................",
        "................",
        "................",
        "................",
      ]}
    />
  );
}

export function GovernanceIcon() {
  return (
    <Pix
      colors={{ ...skin, a: "#c9ccd1", m: "#8d939c" }}
      cells={[
        "......kkkk......",
        ".....kamaak.....",
        ".....kammak.....",
        "....kkkkkakk....",
        "...kammmmmak....",
        "..kammmmmmmak...",
        "..kammkmmkmmk...",
        "..kammmmmmmak...",
        "...kammmmmak....",
        "....kkkkkkk.....",
        "......kkkk......",
        "......kggk......",
        "......kggk......",
        ".....kkggkk.....",
        "................",
        "................",
      ]}
    />
  );
}

export function ResumeIcon() {
  return (
    <Pix
      colors={{ ...skin, p: "#f4efe6" }}
      cells={[
        "................",
        "..kkkkkkkkk.....",
        "..kppppppkk.....",
        "..kppppppkpk....",
        "..kppppppkkk....",
        "..kpppppppk.....",
        "..kprrppppk.....",
        "..kpppppppk.....",
        "..kprrrpppk.....",
        "..kpppppppk.....",
        "..kprrppppk.....",
        "..kkkkkkkkk.....",
        "................",
        "................",
        "................",
        "................",
      ]}
    />
  );
}

export function TerminalIcon() {
  return (
    <Pix
      colors={{ ...skin, t: "#d7ffe0" }}
      cells={[
        "................",
        ".kkkkkkkkkkkkk..",
        ".ktttttttttttk..",
        ".ktkkttttttttk..",
        ".kttkttttttttk..",
        ".ktttkkttttttk..",
        ".ktttttttttttk..",
        ".ktttttkkttttk..",
        ".kttttttkttttk..",
        ".ktttttttktttk..",
        ".ktttttttttttk..",
        ".kkkkkkkkkkkkk..",
        "................",
        "................",
        "................",
        "................",
      ]}
    />
  );
}

