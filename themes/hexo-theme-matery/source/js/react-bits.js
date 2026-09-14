(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var article = document.querySelector('.post-content, .content');
  var revealItems = document.querySelectorAll('.post-card, .card, .archive-item, .post-content h2, .post-content h3, .post-content img');

  document.addEventListener('pointermove', function (event) {
    document.documentElement.style.setProperty('--rb-x', event.clientX + 'px');
    document.documentElement.style.setProperty('--rb-y', event.clientY + 'px');
  }, { passive: true });

  if (article) {
    article.classList.add('rb-reveal');
    if (!reducedMotion) window.requestAnimationFrame(function () { article.classList.add('rb-visible'); });
    article.querySelectorAll('h1, .article-title, .post-title').forEach(function (title) {
      title.classList.add('rb-blur-text');
      window.requestAnimationFrame(function () { title.classList.add('rb-visible'); });
    });
  }

  revealItems.forEach(function (item, index) {
    item.classList.add('rb-reveal', 'rb-spotlight');
    item.style.transitionDelay = Math.min(index * 35, 280) + 'ms';
  });

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (item) { item.classList.add('rb-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('rb-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    revealItems.forEach(function (item) { observer.observe(item); });
  }

  document.querySelectorAll('.rb-spotlight').forEach(function (item) {
    item.addEventListener('pointermove', function (event) {
      var rect = item.getBoundingClientRect();
      item.style.setProperty('--card-x', (event.clientX - rect.left) + 'px');
      item.style.setProperty('--card-y', (event.clientY - rect.top) + 'px');
    }, { passive: true });
  });
}());
