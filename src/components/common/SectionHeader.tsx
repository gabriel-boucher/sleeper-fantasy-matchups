import { ReactNode } from 'react';
import './SectionHeader.css';

interface SectionHeaderProps {
  title: ReactNode;
  level: 'h2' | 'h3';
  titleHint?: string;
  actions?: ReactNode;
}

export function SectionHeader({ title, level: Heading, titleHint, actions }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <Heading className="section-title" title={titleHint}>{title}</Heading>
      {actions}
    </div>
  );
}
