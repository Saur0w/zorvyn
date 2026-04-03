"use client";

import styles from "./page.module.css";
import Overview from "@/components/Home";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

gsap.registerPlugin(SplitText, useGSAP);

export default function Home() {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLParagraphElement>(null);

    useGSAP(() => {
        const split = new SplitText(textRef.current, {
            type: "lines",
            linesClass: "line"
        });

        gsap.from(split.lines, {
            yPercent: 100,
            opacity: 0,
            stagger: 0.1,
            duration: 1,
            ease: "power4.out",
        });

    }, {
        scope: containerRef,
    });
  return (
    <div className={styles.page}>
      {/*<Overview />*/}
        <p ref={textRef} className={styles.text}>
            This is a smooth GSAP SplitText reveal animation
        </p>
    </div>
  );
}
