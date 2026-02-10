'use client';

import { motion } from 'framer-motion';

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
    />
  );
}
