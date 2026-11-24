import { ReactNode } from 'react';
import { SectionHeader } from './SectionHeader';
import './Section.css';

interface SectionProps {
  title: ReactNode;
  titleHint?: string;
  actions?: ReactNode;
  hasDivider?: boolean;
  className?: string;
  children: ReactNode;
}

export function Section({ title, titleHint, actions, hasDivider = true, className = '', children }: SectionProps) {
  return (
    <section className={`panel-section ${hasDivider ? 'with-divider' : ''} ${className}`}>
      <SectionHeader title={title} level="h3" titleHint={titleHint} actions={actions} />
      {children}
    </section>
  );
}
