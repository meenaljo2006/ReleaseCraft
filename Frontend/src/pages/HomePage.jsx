'use client';

import React from 'react';
import { easeInOut, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import './HomePage.css'; // Make sure this path is correct

// This is the ElegantShape component, now using plain CSS classes
function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradientClass = 'gradient-default',
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={`elegant-shape-wrapper ${className}`}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
        style={{
          width,
          height,
        }}
        className="elegant-shape-inner"
      >
        <div className={`elegant-shape-main ${gradientClass}`} />
      </motion.div>
    </motion.div>
  );
}

// This is the main Hero component
export default function HomePage() {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: easeInOut,
      },
    }),
  };

  return (
    <div className="hero-container">
      {/* Background radial gradient blur */}
      <div className="hero-gradient-bg" />

      {/* Animated shapes container */}
      <div className="hero-shapes-container">
        <ElegantShape
          delay={0.3}
          width={550}
          height={140}
          rotate={14}
          gradientClass="gradient-indigo"
          className="shape-1"
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradientClass="gradient-rose"
          className="shape-2"
        />
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradientClass="gradient-violet"
          className="shape-3"
        />
        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradientClass="gradient-amber"
          className="shape-4"
        />
        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradientClass="gradient-cyan"
          className="shape-5"
        />
      </div>

      {/* Hero Content */}
      <div className="hero-content-container">
        <div className="hero-content">
          {/* Headline - Merged from your HomePage.js */}
          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="hero-headline">
              <span className="hero-headline-main">
                Messy Tickets
              </span>
              <br />
              <span className="hero-headline-styled">
                Polished Notes
              </span>
            </h1>
          </motion.div>

          {/* Subheadline - Merged from your HomePage.js */}
          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <p className="hero-subheadline">
              ReleaseCraft cuts through the jargon, instantly translating technical Jira and GitHub tickets into polished release notes.
            </p>
          </motion.div>

          {/* CTA Buttons - Merged from your HomePage.js */}
          <motion.div
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="hero-cta-wrapper"
          >
            <button className="hero-cta-button" >
              <a href="/signup">
              Get Started
              <ArrowRight className="hero-cta-icon" />
              </a>
              
            </button>
            {/* THIS IS THE NEW BUTTON */}
            <a href="/viewdemo" className="hero-cta-button-outline">
              View Demo
            </a>
          </motion.div>
        </div>
      </div>

      {/* Faded overlay at the bottom */}
      <div className="hero-fade-overlay" />
    </div>
  );
}