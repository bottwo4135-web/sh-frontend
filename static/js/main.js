// Generic helpers
(function(){
  // Intersection-based reveal for animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){ e.target.style.visibility = 'visible'; }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in, .slide-up').forEach(el => {
    el.style.visibility = 'hidden'; observer.observe(el);
  });
})();
