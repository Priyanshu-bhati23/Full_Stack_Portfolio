/**
 * Everything personal on the site lives in this one file.
 * Replace the placeholder values (marked TODO) with your own details.
 * Empty strings and empty lists hide the part of the page that uses them.
 */

export const profile = {
  name: "Your Name", // TODO
  role: "Full-stack developer",
  /** The large line at the top of the page. */
  headline: "I build AI products you can watch working.",
  intro: "Full-stack and frontend developer, looking for an internship. Below are three AI apps I designed, built and deployed end to end.", // TODO: adjust
  location: "", // TODO: for example "Pune, India"
  email: "", // TODO
  github: "", // TODO: full link, for example https://github.com/your-username
  linkedin: "", // TODO: full link
  /** Put your resume at public/resume.pdf, then set this to "/resume.pdf". */
  resume: "",

  about: [
    // TODO: two or three short paragraphs about you, in your own words.
    "Add a short paragraph about who you are, what you study, and the kind of work you want to do.",
  ],

  skills: [
    { group: "Languages", items: ["TypeScript", "JavaScript", "HTML", "CSS", "GLSL"] },
    { group: "Frontend", items: ["React", "Next.js", "React Three Fiber", "three.js", "Responsive design", "Accessibility"] },
    { group: "Backend and AI", items: ["Node.js", "REST and streaming APIs", "LLM tool calling", "Structured outputs", "Speech to text"] },
    { group: "Tools", items: ["Git", "GitHub", "Vercel"] },
  ],

  experience: [
    // TODO: { role: "Frontend Intern", org: "Company", period: "May 2026 to Jul 2026", points: ["What you did and what changed because of it."] },
  ] as Array<{ role: string; org: string; period: string; points: string[] }>,

  education: [
    // TODO: { degree: "B.Tech, Computer Science", school: "College name", period: "2023 to 2027", detail: "CGPA 8.6" },
  ] as Array<{ degree: string; school: string; period: string; detail: string }>,
};

export interface Project {
  slug: "repoverse" | "hivemind" | "voxui";
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  stack: string[];
  /** Deployed link. Leave empty until it is live. */
  live: string;
  /** GitHub link. Leave empty until it is pushed. */
  source: string;
  shot: string;
  shotAlt: string;
}

export const projects: Project[] = [
  {
    slug: "repoverse",
    name: "Repoverse",
    tagline: "A 3D map of any codebase",
    description:
      "Paste a GitHub repo and its file tree becomes a star chart: folders are stars, files orbit them. Select a file for a streamed AI explanation, or ask a question and watch which files the AI opens to answer it.",
    highlights: [
      "A deterministic 3D layout algorithm that keeps deep folder trees readable",
      "Instanced rendering, so 1,200 files draw in a handful of draw calls",
      "Retrieval without a vector database: the model picks files from the tree, then answers from their contents",
    ],
    stack: ["Next.js", "TypeScript", "React Three Fiber", "Groq", "GitHub API"],
    live: "", // TODO
    source: "", // TODO
    shot: "/shots/repoverse.webp",
    shotAlt: "Repoverse showing its own source code as a star chart, with folders as large stars and files orbiting them.",
  },
  {
    slug: "hivemind",
    name: "Hivemind",
    tagline: "A team of AI agents you can watch work",
    description:
      "An orchestrator splits one goal into tasks. Five specialist agents run them in parallel with real tool calls, and every hand-off is animated on a 3D honeycomb while a log shows each step.",
    highlights: [
      "A task-graph scheduler with dependencies and parallel execution",
      "A tool-calling loop with live Wikipedia lookups and a hand-written calculator that never runs model output as code",
      "One event stream drives both the log and the 3D scene",
    ],
    stack: ["Next.js", "TypeScript", "React Three Fiber", "Groq", "Tool calling"],
    live: "", // TODO
    source: "", // TODO
    shot: "/shots/hivemind.webp",
    shotAlt: "Hivemind during its scripted demo: two agent cells raised on a honeycomb board, with their tool calls listed in a log.",
  },
  {
    slug: "voxui",
    name: "VoxUI",
    tagline: "Say it, and a working interface gets built",
    description:
      "Describe an interface out loud. Your speech is transcribed, a complete HTML document streams into a live preview as it is written, and you refine it by talking.",
    highlights: [
      "Voice capture with a GLSL orb that moves with the microphone level",
      "Streaming generation, rendered in the preview while it is still being written",
      "Generated code runs in a sandboxed iframe behind a strict Content-Security-Policy",
    ],
    stack: ["Next.js", "TypeScript", "GLSL", "Web Audio", "Groq Whisper"],
    live: "", // TODO
    source: "", // TODO
    shot: "/shots/voxui.webp",
    shotAlt: "VoxUI with its bundled sample, a focus timer, open in the preview window beside the voice orb.",
  },
];
