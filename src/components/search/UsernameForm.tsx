import { FormEvent, useState } from 'react';
import './UsernameForm.css';

interface UsernameFormProps {
  initialUsername?: string;
  loading: boolean;
  onSubmit: (username: string) => void;
}

export function UsernameForm({ initialUsername = '', loading, onSubmit }: UsernameFormProps) {
  const [username, setUsername] = useState(initialUsername);
  const trimmed = username.trim();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (trimmed) onSubmit(trimmed);
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <label htmlFor="username-input" className="field-label">Sleeper username</label>
      <div className="search-row">
        <input
          id="username-input"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username..."
          className="field-control"
          autoComplete="off"
          spellCheck={false}
        />
        <button type="submit" className="button" disabled={loading || !trimmed}>
          {loading ? 'Searching…' : 'Find leagues'}
        </button>
      </div>
    </form>
  );
}
