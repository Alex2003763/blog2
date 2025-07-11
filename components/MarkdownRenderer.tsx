import React, { useEffect, useRef } from 'react';
import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark-dimmed.css';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [processedContent, setProcessedContent] = React.useState<string>('');

  useEffect(() => {
    if (contentRef.current) {
      // Add IDs to headings for table of contents, skip those inside code blocks
      const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let headingIndex = 0;
      
      headings.forEach((heading) => {
        // Check if heading is inside a code block
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
    }
  }, [processedContent]);

  // Process markdown using remark
  const processMarkdown = async (markdown: string): Promise<string> => {
    const result = await remark()
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeHighlight, { subset: false, ignoreMissing: true })
      .use(rehypeStringify)
      .process(markdown);
    return result.toString();
  };

  useEffect(() => {
    processMarkdown(content).then(setProcessedContent);
  }, [content]);

  return (
    <div
      id="article-content"
      ref={contentRef}
      className="px-4 py-6 overflow-auto prose prose-base max-w-none dark:prose-invert prose-pre:bg-[#1c1d21] prose-code:before:content-none prose-code:after:content-none markdown-content md:px-6 lg:px-8"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}
