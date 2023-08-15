import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import axios from "axios";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <div className={styles.portfolioContent}>
      <div className={styles.portfolioContentBox}>
        <a href="https://www.libertyhousespecialties.com/">
          <img className={styles.portfolioImage} src="/images/lhs.png" />
          <p className={styles.portfolioContentText}>
            Liberty House Specialties
          </p>
        </a>
      </div>
      <div className={styles.portfolioContentBox}>
        <a href="https://www.libertyhousespecialties.com/">
          <img className={styles.portfolioImage} src="/images/lhs.png" />
          <p className={styles.portfolioContentText}>
            Liberty House Specialties
          </p>
        </a>
      </div>
    </div>
  );
}
