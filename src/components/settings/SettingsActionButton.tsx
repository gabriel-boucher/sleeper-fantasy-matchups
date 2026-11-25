import { ReactNode } from 'react';
import './SettingsActionButton.css';

interface SettingsActionButtonProps {
  type?: 'button' | 'submit';
  isPrimary?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export function SettingsActionButton({ type = 'button', isPrimary = false, disabled, onClick, children }: SettingsActionButtonProps) {
  return (
    <button type={type} className={`settings-action-button${isPrimary ? ' is-primary' : ''}`} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
