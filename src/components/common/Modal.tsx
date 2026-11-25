import { KeyboardEventHandler, MouseEvent, ReactNode, SyntheticEvent, useEffect, useRef } from 'react';
import './Modal.css';

interface ModalProps {
  className: string;
  labelledBy: string;
  onClose: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLDialogElement>;
  children: ReactNode;
}

export function Modal({ className, labelledBy, onClose, onKeyDown, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function closeOnBackdropClick(e: MouseEvent<HTMLDialogElement>) {
    const isBackdropClick = e.target === e.currentTarget;
    if (isBackdropClick) onClose();
  }

  function closeOnEscape(e: SyntheticEvent<HTMLDialogElement>) {
    e.preventDefault();
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className={`modal ${className}`}
      onClick={closeOnBackdropClick}
      onCancel={closeOnEscape}
      onClose={onClose}
      onKeyDown={onKeyDown}
      aria-labelledby={labelledBy}
    >
      {children}
    </dialog>
  );
}
