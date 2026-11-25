import { ReactNode } from 'react';
import { SectionHeader } from './SectionHeader';
import './Section.css';

interface SectionProps {
  title: ReactNode;
  titleHint?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Section({ title, titleHint, actions, className = '', children }: SectionProps) {
  return (
    <section className={`panel-section ${className}`}>
      <SectionHeader title={title} level="h3" titleHint={titleHint} actions={actions} />
      {children}
    </section>
  );
}
