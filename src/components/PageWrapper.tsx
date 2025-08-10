import { ReactNode } from 'react';
import { css } from '@emotion/react';

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

const pageContainer = css`
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const header = css`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const headerTitle = css`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  margin-bottom: 0.5rem;
`;

const headerSubtitle = css`
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
`;

const mainContent = css`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

export function PageWrapper({ children, title = "Macro Tracker", subtitle = "Track your meals and nutritional intake" }: PageWrapperProps) {
  return (
    <div css={pageContainer}>
      <header css={header}>
        <h1 css={headerTitle}>{title}</h1>
        <p css={headerSubtitle}>{subtitle}</p>
      </header>
      <main css={mainContent}>
        {children}
      </main>
    </div>
  );
}
