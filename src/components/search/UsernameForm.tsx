import { FormEvent, useState } from 'react';
import './UsernameForm.css';

interface UsernameFormProps {
  initialUsername?: string;
  loading: boolean;
  onSubmit: (username: string) => void;
  /** Needed when more than one form is on the page, so each label points at its own box */
  id?: string;
  /** "hero" is the large version used on the home page */
  variant?: 'compact' | 'hero';
  autoFocus?: boolean;
}

export function UsernameForm({
  initialUsername = '',
  loading,
  onSubmit,
  id = 'username-input',
  variant = 'compact',
  autoFocus,
}: UsernameFormProps) {
  const [username, setUsername] = useState(initialUsername);
  const trimmed = username.trim();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (trimmed) onSubmit(trimmed);
  }

  return (
    <form className={`search-form search-form--${variant}`} onSubmit={handleSubmit}>
      {/* The placeholder says what to type; the label is for screen readers */}
      <label htmlFor={id} className="visually-hidden">Sleeper username</label>
      <div className="search-row">
        <input
          id={id}
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Sleeper username"
          className="field-control"
          autoComplete="off"
          spellCheck={false}
          autoFocus={autoFocus}
        />
        <button type="submit" className="button" disabled={loading || !trimmed}>
          {loading ? 'Searching…' : 'Find leagues'}
        </button>
      </div>
    </form>
  );
}
