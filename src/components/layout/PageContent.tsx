import { ReactNode } from 'react';
import './PageContent.css';

interface PageContentProps {
  children: ReactNode;
}

export function PageContent({ children }: PageContentProps) {
  return <main className="page-content">{children}</main>;
}
