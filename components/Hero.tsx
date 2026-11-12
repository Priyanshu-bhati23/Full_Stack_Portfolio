"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

/** Loads the 3D scene on the client and passes down the reduced-motion setting. */
export default function Hero() {
  const [still, setStill] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setStill(query.matches);
    const onChange = () => setStill(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return <HeroScene still={still} />;
}
