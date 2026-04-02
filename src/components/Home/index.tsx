"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import styles from "./style.module.scss";

gsap.registerPlugin(SplitText, useGSAP);

export default function Overview() {
    const heroRef = useRef<HTMLDivElement>(null);
    const greetRef = useRef<HTMLParagraphElement>(null);
    const nameRef = useRef<HTMLSpanElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);
    const chartsRef = useRef<HTMLElement>(null);
    const txRef = useRef<HTMLElement>(null);
    const counterRefs = useRef<(HTMLSpanElement | null)[]>([]);

    useGSAP(() => {
        const split = new SplitText(greetRef.current, {
            type: "lines"
        });

        gsap.from(split.lines, {
            yPercent: 100,
            opacity: 0,
            stagger: 0.05,
            duration: 0.8,
            ease: "power4.out"
        });
    }, {
        scope: heroRef
    });

    return (
      <section className={styles.root} ref={heroRef}>
          <header className={styles.hero}>
              <div className={styles.heroLeft}>
                  <div className={styles.greetingWrap}>
                      <p className={styles.greeting} ref={greetRef}>
                          Saurow
                      </p>
                  </div>
              </div>
          </header>
      </section>
    );
}