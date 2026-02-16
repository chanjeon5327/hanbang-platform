'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useInterestPreview } from '@/stores/interestPreview';
import SharedThumb from './SharedThumb';
import { logEvent } from '@/utils/logEvent';
import { getYtThumb } from '@/lib/thumbnails';

export default function InterestPreview() {
  const { openId, openData, close } = useInterestPreview();
  const router = useRouter();

  // 프리뷰 노출 트래킹
  useEffect(() => {
    if (openId && openData) {
      logEvent('preview_opened', {
        item_id: openId,
        title: openData.title,
      });
    }
  }, [openId, openData]);

  // ESC 닫기
  useEffect(() => {
    if (!openId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openId, close]);

  return (
    <AnimatePresence>
      {openId && openData && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ backgroundColor: 'var(--overlay-dim)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={close}
        >
          <motion.div
            className="
              w-full max-w-[520px]
              rounded-t-2xl
              bg-[var(--card-bg)]
              p-4
              ring-1 ring-[var(--card-border)]
            "
            initial={{ y: 72 }}
            animate={{ y: 0 }}
            exit={{ y: 72 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-[190px] overflow-hidden rounded-xl">
              <SharedThumb
                src={openData.thumbUrl || getYtThumb(parseInt(openId, 10) || 0)}
                anchorId={`thumb-${openId}`}
                className="h-full w-full"
              />
            </div>

            <div className="mt-3 space-y-1">
              <div className="body-lg font-bold text-[var(--text-primary)]">
                {openData.title}
              </div>
              {openData.subtitle && (
                <div className="body-sm text-[var(--text-secondary)]">
                  {openData.subtitle}
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => {
                  logEvent('preview_cta_clicked', {
                    item_id: openId,
                  });
                  close();
                  router.push(`/interest/${openId}`);
                }}
                className="
                  w-full rounded-lg
                  bg-white/15
                  py-3
                  text-sm font-semibold text-white
                  hover:bg-white/20
                  active:opacity-95
                "
              >
                상세 페이지로 이동
              </button>

              <button
                onClick={close}
                className="w-full py-2 body-sm text-white/60"
              >
                닫기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
