import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { resolveMediaUrl } from '../../../core/utils/mediaUrl';
import { ImageLightbox } from './AlertBanner';

export interface ProofViewerProps {
  src?: string | null;
  alt: string;
  size?: number;
}

export const ProofViewer: React.FC<ProofViewerProps> = ({ src, alt, size = 48 }) => {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const url = resolveMediaUrl(src);

  if (!url || failed) {
    return (
      <span className="ui-proof" style={{ width: size, height: size }} aria-label={alt} role="img">
        <ImageOff size={Math.max(16, Math.floor(size / 2.5))} />
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        className="ui-proof"
        style={{ width: size, height: size }}
        aria-label={alt}
        onClick={() => setOpen(true)}
      >
        <img
          className="ui-proof__img"
          src={url}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      </button>
      <ImageLightbox isOpen={open} onClose={() => setOpen(false)} src={url} alt={alt} />
    </>
  );
};

export default ProofViewer;
