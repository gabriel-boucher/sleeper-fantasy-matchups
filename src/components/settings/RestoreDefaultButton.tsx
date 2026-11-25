import { RestoreIcon } from '../icons/RestoreIcon';
import './RestoreDefaultButton.css';

interface RestoreDefaultButtonProps {
  defaultLabel: string;
  settingName: string;
  onClick: () => void;
}

export function RestoreDefaultButton({ defaultLabel, settingName, onClick }: RestoreDefaultButtonProps) {
  const description = `Restore league value for ${settingName} (${defaultLabel})`;
  return (
    <button type="button" className="restore-default-button" onClick={onClick} title={description} aria-label={description}>
      <span>{defaultLabel}</span>
      <RestoreIcon />
    </button>
  );
}
