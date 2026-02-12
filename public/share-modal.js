(() => {
  try {
    // 예: data-share-open 버튼이 있을 때만 이벤트 바인딩
    const openBtn = document.querySelector('[data-share-open]');
    const closeBtn = document.querySelector('[data-share-close]');
    const modal = document.querySelector('[data-share-modal]');

    if (!openBtn || !modal) return;

    openBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }
  } catch (e) {
    // 어떤 페이지에서도 절대 앱을 죽이지 않게 방어
    console.warn('[share-modal] ignored error:', e);
  }
})();
