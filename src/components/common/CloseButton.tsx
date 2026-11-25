import { CloseIcon } from '../icons/CloseIcon';
import './CloseButton.css';

interface CloseButtonProps {
  onClick: () => void;
}

export function CloseButton({ onClick }: CloseButtonProps) {
  return (
    <button type="button" className="close-button" onClick={onClick} aria-label="Close">
      <CloseIcon />
    </button>
  );
}
