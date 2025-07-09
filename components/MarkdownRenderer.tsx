import React, { useEffect, useRef } from 'react';
import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [processedContent, setProcessedContent] = React.useState<string>('');

  useEffect(() => {
    if (contentRef.current) {
      // Add IDs to headings for table of contents
      const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach((heading) => {
        const text = heading.textContent || '';
        const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
        heading.id = id;
      });
    }
  }, [processedContent]);

  // Process markdown using remark
  const processMarkdown = async (markdown: string): Promise<string> => {
    const result = await remark()
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeStringify)
      .process(markdown);
    return result.toString();
  };

  useEffect(() => {
    processMarkdown(content).then(setProcessedContent);
  }, [content]);

  return (
    <div
      ref={contentRef}
      className="prose prose-base max-w-none dark:prose-invert markdown-content"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}
