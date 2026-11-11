import { useState } from 'react';
import './UserAvatar.css';

interface UserAvatarProps {
  url: string | null;
  // Used for the initials when there's no picture
  name: string;
}

// A user's or team's round picture; falls back to initials when there's none or it fails to load.
// Its size comes from the --avatar-size CSS variable set by whatever contains it (56px by default).
export function UserAvatar({ url, name }: UserAvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (!url || failedUrl === url) {
    return <span className="user-avatar fallback" aria-hidden="true">{getInitials(name)}</span>;
  }

  return (
    <img
      className="user-avatar"
      src={url}
      alt=""
      decoding="async"
      onError={() => setFailedUrl(url)}
    />
  );
}

function getInitials(name: string): string {
  return name
    .replace(/^@/, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');
}
