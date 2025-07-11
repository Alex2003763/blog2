import Giscus from '@giscus/react';
import { useTheme } from 'next-themes';

const GiscusComments = () => {
  const { theme } = useTheme();

  return (
    <div className="mt-8">
      <Giscus
        id="comments"
        repo="Alex2003763/blog2" // 替換成您的 GitHub repo, e.g., "user/repo"
        repoId="R_kgDOPJkMQg" // 替換成您的 repo ID
        category="Announcements" // 替換成您啟用了 Discussions 的 category
        categoryId="DIC_kwDOPJkMQs4Csz6i" // 替換成您的 category ID
        mapping="pathname"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme === 'dark' ? 'dark' : 'light'}
        lang="zh-TW"
        loading="lazy"
      />
    </div>
  );
};

export default GiscusComments;