'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import SharedThumb from '@/components/interest/SharedThumb';
import { logEvent } from '@/utils/logEvent';

export default function InterestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;

  useEffect(() => {
    logEvent('detail_viewed', { item_id: id });
  }, [id]);

  return (
    <motion.main
      className="min-h-screen bg-[#f7f8fa]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="mx-auto max-w-[520px] p-4">
        <div className="h-[240px] overflow-hidden rounded-2xl">
          <SharedThumb
            src="https://images.unsplash.com/photo-1526481280695-3c687fd5432c?auto=format&fit=crop&w=800&q=70"
            anchorId={`thumb-${id}`}
            className="h-full w-full"
          />
        </div>

        <div className="mt-4 h-5 w-2/3 rounded bg-black/20" />
        <div className="mt-2 h-4 w-1/2 rounded bg-black/10" />
      </div>
    </motion.main>
  );
}
