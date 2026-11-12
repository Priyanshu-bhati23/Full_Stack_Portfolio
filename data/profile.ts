/**
 * Everything personal on the site lives in this one file.
 * Empty strings and empty lists hide the part of the page that uses them.
 * Each project's "live" link is empty until the app is deployed: paste the
 * Vercel address there and an "Open the live app" button appears.
 */

export const profile = {
  name: "Priyanshu Bhati",
  role: "Full-stack developer",
  /** The large line at the top of the page. */
  headline: "I build AI products you can watch working.",
  intro:
    "Full-stack developer and B.Tech student at IIIT Nagpur, looking for a full-stack or frontend internship. Below are three AI apps I designed, built and deployed end to end.",
  location: "Kota, Rajasthan, India",
  email: "priyanshubhati.dev@gmail.com",
  github: "https://github.com/Priyanshu-bhati23",
  linkedin: "https://www.linkedin.com/in/priyanshu-bhati-4416a3286",
  /** The file lives at public/resume.pdf. */
  resume: "/resume.pdf",

  about: [
    "I am a B.Tech student at the Indian Institute of Information Technology, Nagpur, graduating in 2027, studying Electronics and Communication Engineering with a minor in IoT.",
    "I like building AI products end to end: the agent and streaming back end, and the interface that shows people what the system is doing. Before these three apps I built an agentic Angular component generator with LangGraph and a multimodal AI doctor assistant.",
    "Outside code I am a core member of E-Cell at IIIT Nagpur, and I run Untold Founders, where I tell the stories of startup founders.",
  ],

  skills: [
    { group: "Languages", items: ["TypeScript", "JavaScript", "Python", "C++", "Java", "HTML", "CSS", "GLSL"] },
    { group: "Frontend", items: ["React", "Next.js", "React Three Fiber", "three.js", "Responsive design", "Accessibility"] },
    { group: "Backend", items: ["Node.js", "REST and streaming APIs", "Flask", "FastAPI", "PostgreSQL", "MySQL", "MongoDB"] },
    { group: "AI", items: ["LLM tool calling", "Structured outputs", "RAG", "LangChain", "LangGraph", "Speech to text"] },
    { group: "Tools", items: ["Git", "GitHub Actions", "Vercel", "MLflow", "DVC"] },
  ],

  /** Heading for the list below. */
  experienceTitle: "Leadership",
  experience: [
    { role: "Core Member", org: "E-Cell, IIIT Nagpur", period: "Oct 2024 to Aug 2026", points: [] },
    { role: "Public Relations Team Lead", org: "E-Summit, IIIT Nagpur", period: "Feb 2026", points: [] },
  ] as Array<{ role: string; org: string; period: string; points: string[] }>,

  education: [
    {
      degree: "B.Tech, Electronics and Communication Engineering, minor in IoT",
      school: "Indian Institute of Information Technology, Nagpur",
      period: "Aug 2023 to May 2027",
      detail: "CGPA 7.26",
    },
  ] as Array<{ degree: string; school: string; period: string; detail: string }>,

  /** Earlier projects, shown as a short list under About. */
  earlier: [
    {
      name: "Auto Angular Component Generator",
      what: "An agentic system that writes Angular components from a plain-language description, with planning, validation and self-correction loops in LangGraph.",
      link: "https://agentic-component-architect-qi0s1kosn.vercel.app/",
    },
    {
      name: "Multimodal AI Doctor Assistant",
      what: "A voice, vision and text assistant with Whisper speech-to-text and text-to-speech, served through a Gradio interface.",
      link: "https://huggingface.co/spaces/fallguy23/AIMedhatBot",
    },
  ] as Array<{ name: string; what: string; link: string }>,
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
    live: "",
    source: "https://github.com/Priyanshu-bhati23/Repoverse",
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
    live: "",
    source: "https://github.com/Priyanshu-bhati23/Hivemind",
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
    live: "",
    source: "https://github.com/Priyanshu-bhati23/VoxUI",
    shot: "/shots/voxui.webp",
    shotAlt: "VoxUI with its bundled sample, a focus timer, open in the preview window beside the voice orb.",
  },
];
