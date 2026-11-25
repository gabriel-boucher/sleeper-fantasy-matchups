import { ReactNode } from 'react';

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <>
      <h3 className="league-settings-section-title">{title}</h3>
      <div className="league-settings-columns">{children}</div>
    </>
  );
}
