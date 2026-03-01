'use client';

import { motion } from 'framer-motion';
import { PRODUCT_PLACEHOLDER } from '@/lib/thumbnails';

type Props = {
  src: string;
  alt?: string;
  anchorId: string;
  className?: string;
};

export default function SharedThumb({ src, alt, anchorId, className }: Props) {
  return (
    <motion.img
      src={src}
      alt={alt ?? ''}
      layoutId={anchorId}
      className={[
        'object-cover',
        'shared-thumb',
        className ?? '',
      ].join(' ')}
      onError={(e) => {
        const el = e.currentTarget;
        if (!el.src.includes('placeholders/')) el.src = PRODUCT_PLACEHOLDER;
      }}
    />
  );
}
