import { FormEvent, useState } from 'react';
import './UsernameForm.css';

interface UsernameFormProps {
  initialUsername?: string;
  loading: boolean;
  onSubmit: (username: string) => void;
  inputId?: string;
  variant?: 'compact' | 'hero';
  autoFocus?: boolean;
}

const INPUT_LABEL = 'Sleeper username';

export function UsernameForm({
  initialUsername = '',
  loading,
  onSubmit,
  inputId = 'username-input',
  variant = 'compact',
  autoFocus,
}: UsernameFormProps) {
  const [username, setUsername] = useState(initialUsername);
  const trimmedUsername = username.trim();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (trimmedUsername) onSubmit(trimmedUsername);
  }

  return (
    <form className={`search-form search-form--${variant}`} onSubmit={handleSubmit}>
      <label htmlFor={inputId} className="visually-hidden">{INPUT_LABEL}</label>
      <div className="search-row">
        <input
          id={inputId}
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={INPUT_LABEL}
          className="field-control"
          autoComplete="off"
          spellCheck={false}
          autoFocus={autoFocus}
        />
        <button type="submit" className="button" disabled={loading || !trimmedUsername}>
          {loading ? 'Searching…' : 'Find leagues'}
        </button>
      </div>
    </form>
  );
}
