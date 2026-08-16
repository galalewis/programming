// ============================================
// GALAL ACADEMY — COURSES.JS
// فلترة الكورسات حسب المرحلة في courses.html (فلترة عرض فقط، من غير Backend)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.filter-bar__btn');
  const courseCards = document.querySelectorAll('#coursesGrid .course-card');

  if (!filterBtns.length || !courseCards.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      courseCards.forEach((card) => {
        const matches = filter === 'all' || card.dataset.grade === filter;
        card.style.display = matches ? '' : 'none';
      });
    });
  });
});
