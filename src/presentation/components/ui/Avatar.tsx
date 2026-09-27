import React, { useState } from 'react';
import { resolveMediaUrl } from '../../../core/utils/mediaUrl';

export type AvatarSize = 24 | 32 | 40 | 48 | 64 | 96;
export type PresenceStatus = 'online' | 'offline' | 'busy' | 'flagged';

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: AvatarSize;
  shape?: 'circle' | 'square';
  presence?: PresenceStatus;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 32,
  shape = 'circle',
  presence,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const getInitials = (n?: string | null) => {
    if (!n) return '';
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const resolvedUrl = src && !imgError ? resolveMediaUrl(src) : null;
  const initials = getInitials(name);

  const classes = [
    'ui-avatar',
    `ui-avatar--${size}`,
    `ui-avatar--${shape}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {resolvedUrl ? (
        <img
          src={resolvedUrl}
          alt={name || 'Avatar'}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <span>{initials}</span>
      )}
      {presence && (
        <span
          className={`ui-avatar__presence ui-avatar__presence--${presence}`}
          aria-label={presence}
        />
      )}
    </div>
  );
};
