"use client";

import styles from "./page.module.css";
import Overview from "@/components/Home";

export default function Home() {
  return (
    <div className={styles.page}>
      <Overview />
    </div>
  );
}
