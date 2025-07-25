import React, { useEffect, useRef } from 'react';
import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import rehypeHighlight from 'rehype-highlight';
import rehypeMermaid from 'rehype-mermaid';
import mermaid from 'mermaid';
import 'highlight.js/styles/github-dark-dimmed.css';
import { visit } from 'unist-util-visit';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [processedContent, setProcessedContent] = React.useState<string>('');

  // Custom rehype plugin to add alt text to images
  const rehypeAddImageAlt = () => (tree: any) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img') {
        const alt = node.properties?.alt;
        if (!alt || alt.trim() === '') {
          // Generate alt text from filename if missing
          const src = node.properties?.src || '';
          const filename = src.split('/').pop() || '';
          const altText = filename.split('.')[0].replace(/[-_]/g, ' ');
          node.properties.alt = altText;
        }
      }
    });
  };
// Custom rehype plugin to downgrade H1 to H2
const rehypeDowngradeHeadings = () => (tree: any) => {
  visit(tree, 'element', (node) => {
    if (node.tagName === 'h1') {
      node.tagName = 'h2';
    }
  });
};

// Process markdown using remark
const processMarkdown = async (markdown: string): Promise<string> => {
  const result = await remark()
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeDowngradeHeadings) // Downgrade H1s to H2s
    .use(rehypeAddImageAlt) // Add alt text to images
    .use(rehypeHighlight)
    .use(rehypeMermaid) // Use default options to avoid type errors
    .use(rehypeStringify)
    .process(markdown);
  return result.toString();
};

  useEffect(() => {
    processMarkdown(content).then(setProcessedContent);
  }, [content]);

  useEffect(() => {
    if (processedContent && contentRef.current) {
      // Add IDs to headings for table of contents
      const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let headingIndex = 0;
      headings.forEach((heading) => {
        let parent: HTMLElement | null = heading.parentElement;
        let inCodeBlock = false;
        while (parent && parent !== contentRef.current) {
          if (parent.tagName === 'PRE' || parent.tagName === 'CODE') {
            inCodeBlock = true;
            break;
          }
          parent = parent.parentElement;
        }
        if (!inCodeBlock) {
          const text = heading.textContent || '';
          const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') + `-${headingIndex}`;
          heading.id = id;
          headingIndex++;
        }
      });

      // Initialize and run Mermaid
      try {
        mermaid.initialize({
          startOnLoad: false, // We will call run() manually
          theme: 'dark',
          securityLevel: 'loose',
          fontFamily: 'inherit'
        });
        mermaid.run({
          nodes: contentRef.current.querySelectorAll('.mermaid'),
        });
      } catch (e) {
        console.error('Mermaid rendering error:', e);
      }
    }
  }, [processedContent]);

  return (
    <div
      id="article-content"
      ref={contentRef}
      className="px-4 py-6 prose prose-base max-w-none dark:prose-invert prose-pre:bg-[#1c1d21] prose-code:before:content-none prose-code:after:content-none markdown-content md:px-6 lg:px-8"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}
