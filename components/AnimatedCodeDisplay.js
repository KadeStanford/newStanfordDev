import React, { useState, useEffect } from "react";
import { TypeAnimation } from "react-type-animation";

const CODE_SEQUENCES = [
  // Sequence 1: React Component Setup
  [
    `// Create Core Navigation Component`,
    100,
    `import React from 'react';`,
    100,
    `import { Header } from './Header';`,
    100,
    `const App = ({ user }) => {`,
    100,
    `    const [route, setRoute] = useState('/home');`,
    100,
    `    return (`,
    100,
    `        <div className="main">`,
    100,
    `            <Header user={user} navigate={setRoute} />`,
    100,
    `        </div>`,
    100,
    `    );`,
    100,
    `};`,
    100,
    "",
    1500, // Pause
    500, // Deletion speed
  ],
  // Sequence 2: Data Fetching / API
  [
    `// Data Fetching: API Gateway Setup`,
    100,
    `const API_ENDPOINT = '/api/data';`,
    100,
    `async function fetchData(query) {`,
    100,
    `    const response = await fetch(API_ENDPOINT + query);`,
    100,
    `    if (!response.ok) {`,
    100,
    `        return console.error('404');`,
    100,
    `    }`,
    100,
    `    return response.json();`,
    100,
    `}`,
    100,
    "",
    1500,
    500,
  ],
  // Sequence 3: Tailwind Styling / Logic
  [
    `// Logic: Apply Responsive Styling`,
    100,
    `let cards = [];`,
    100,
    `// Tailwind classes applied dynamically`,
    100,
    `cards.forEach(card => {`,
    100,
    `    card.className = "flex w-full md:w-1/2 lg:w-1/3";`,
    100,
    `});`,
    100,
    `return cards;`,
    100,
    "",
    1500,
    500,
  ],
];

export default function AnimatedCodeDisplay({ isVisible }) {
  const [currentSequence, setCurrentSequence] = useState(0);

  // VS Code-like Color Map (uses hex codes)
  const styleMap = {
    keyword: "#ef4444", // Pink/Red for const, import, if, return
    variable: "#60a5fa", // Light Blue for standard variables/functions
    comment: "#64748b", // Slate for comments
    string: "#10b981", // Green for strings/paths
    component: "#a78bfa", // Purple for React Components/Tags
    literal: "#facc15", // Yellow for numbers, booleans, JSX props
  };

  // Regular expression groups for syntax highlighting
  const regex = {
    // Keywords (JS & React hooks)
    keywords:
      /(const|let|if|import|return|export|async|await|from|function|new)/g,
    // Tags/Components (starts with capital letter or JSX props)
    components:
      /(Header|App|div|className|user|navigate|route|response\.ok|response\.json|MAX_INSTANCES|db\.load|fetchData|Stripe|Postgres|audit|scale)/g,
    // Variable/Function Names (camelCase, not capital or keywords)
    variables:
      /(setRoute|useState|useEffect|fetch|API_ENDPOINT|query|response|error|cards|forEach|card)/g,
    // Strings/Paths
    strings: /('.*?'|".*?"|`.*?`)/g,
    // Comments
    comments: /(\/\/.+)/g,
    // Literals (numbers/booleans)
    literals: /(true|false|null|404|1\/2|0\.8)/g,
  };

  // Function to apply styles to a string
  const applyStyles = (input) => {
    let output = input;

    // Apply comments first (to protect their content)
    output = output.replace(
      regex.comments,
      (match) => `<span style="color:${styleMap.comment}">${match}</span>`
    );

    // Apply strings
    output = output.replace(
      regex.strings,
      (match) => `<span style="color:${styleMap.string}">${match}</span>`
    );

    // Apply keywords
    output = output.replace(
      regex.keywords,
      (match) => `<span style="color:${styleMap.keyword}">${match}</span>`
    );

    // Apply components (tags/capitalized functions)
    output = output.replace(
      regex.components,
      (match) => `<span style="color:${styleMap.component}">${match}</span>`
    );

    // Apply variables
    output = output.replace(
      regex.variables,
      (match) => `<span style="color:${styleMap.variable}">${match}</span>`
    );

    // Apply literals
    output = output.replace(
      regex.literals,
      (match) => `<span style="color:${styleMap.literal}">${match}</span>`
    );

    return output;
  };

  const getRandomSequence = (previousIndex) => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * CODE_SEQUENCES.length);
    } while (nextIndex === previousIndex);
    return nextIndex;
  };

  const handleSequenceEnd = () => {
    const nextIndex = getRandomSequence(currentSequence);
    setCurrentSequence(nextIndex);
  };

  // 1. Process the raw sequence data: Apply styling and create the final array for TypeAnimation
  const typedSequence = CODE_SEQUENCES[currentSequence]
    .flatMap((item, index) => {
      if (typeof item === "string") {
        const styledLine = applyStyles(item);
        // Return styled HTML string and a short delay
        return [styledLine, 500];
      } else if (typeof item === "number") {
        // Handle deletion speed (negative value) or pause (positive value)
        return [item > 1000 ? item : -Math.abs(item)];
      }
      return [];
    })
    .concat([handleSequenceEnd, 100]);

  return (
    <div className="text-white font-mono text-sm h-full w-full whitespace-pre-wrap">
      <TypeAnimation
        key={currentSequence}
        sequence={typedSequence}
        wrapper="div"
        speed={90}
        deletionSpeed={50}
        style={{ whiteSpace: "pre-line", fontSize: "1em" }}
        // 2. IMPORTANT: Use custom component to render HTML instead of text
        // This is the solution for allowing the <span> tags to render as HTML colors
        // instead of literal text.
        renderer={({ sequence, speed, deletionSpeed, cursor }) => {
          return (
            <div style={{ whiteSpace: "pre-line", fontSize: "1em" }}>
              <TypeAnimation
                sequence={sequence}
                wrapper="div"
                speed={speed}
                deletionSpeed={deletionSpeed}
                cursor={false} // Disable cursor on the inner animation
                // Renders the string sequence with HTML styles
                renderer={({ renderedString }) => (
                  <div dangerouslySetInnerHTML={{ __html: renderedString }} />
                )}
              />
            </div>
          );
        }}
      />
    </div>
  );
}
