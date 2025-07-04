import React from 'react';

// Utility for highlighting differences (VERY basic: highlights word differences)
export function diffHighlight(a: string, b: string) {
  const aWords = a.split(' ');
  const bWords = b.split(' ');
  return aWords.map((word, i) => {
    if (bWords[i] !== word) {
      return (
        <mark key={i} className="bg-yellow-300 text-gray-900 rounded px-1">
          {word}
        </mark>
      );
    }
    return word + ' ';
  });
}
