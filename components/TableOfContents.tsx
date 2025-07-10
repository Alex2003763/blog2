import React, { useState, useEffect } from 'react';
import { LinkIcon } from './icons';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Parse headings from content
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      
      items.push({
        id,
        text,
        level
      });
    }

    setTocItems(items);
  }, [content]);

  useEffect(() => {
    // Create intersection observer for active section tracking
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -35% 0px',
        threshold: 0
      }
    );

    // Observe all headings
    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <div className="sticky p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-sm top-24 dark:bg-gray-800/50 dark:border-gray-700/50">
      <div className="flex items-center mb-4 space-x-2">
        <LinkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Table of Contents
        </h3>
      </div>
      <nav>
        <ul className="space-y-2">
          {tocItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollToHeading(item.id)}
                className={`
                  w-full text-left text-sm transition-colors
                  ${activeId === item.id
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }
                  ${item.level === 2 ? 'pl-2' : ''}
                  ${item.level === 3 ? 'pl-6' : ''}
                  ${item.level === 4 ? 'pl-10' : ''}
                  ${item.level === 5 ? 'pl-14' : ''}
                  ${item.level === 6 ? 'pl-18' : ''}
                `}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}