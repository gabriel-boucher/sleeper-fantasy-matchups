import { ReactNode } from 'react';
import { SectionHeader } from './SectionHeader';

interface PanelProps {
  title: ReactNode;
  titleHint?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Panel({ title, titleHint, actions, className = '', children }: PanelProps) {
  return (
    <section className={`panel ${className}`}>
      <SectionHeader title={title} level="h2" titleHint={titleHint} actions={actions} />
      {children}
    </section>
  );
}
