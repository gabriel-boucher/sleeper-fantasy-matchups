import { useState } from 'react';
import { getInitials } from '../../utils/format';
import './UserAvatar.css';

interface UserAvatarProps {
  url: string | null;
  name: string;
}

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
