/* FADE-IN ON SCROLL using IntersectionObserver */
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    const observerOpts = {
      root: null,
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.08
    };
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.fade-in, .content-section').forEach(el => el.classList.add('show'));
      return;
    }
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      });
    }, observerOpts);
    document.querySelectorAll('.fade-in, .content-section').forEach(el => io.observe(el));
  });
})();

/* NAV TOGGLE (small screens) */
(function() {
  const btn = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if(!btn || !nav) return;
  btn.addEventListener('click', () => {
    const exp = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!exp));
    if(!exp){
      nav.style.display = 'flex';
      nav.style.flexDirection = 'column';
      nav.style.position = 'absolute';
      nav.style.right = '0.8rem';
      nav.style.top = '64px';
      nav.style.background = 'rgba(0,0,0,0.94)';
      nav.style.padding = '0.6rem';
      nav.style.borderRadius = '8px';
      nav.style.gap = '0.6rem';
      nav.style.zIndex = '220';
      nav.style.border = '1px solid rgba(0,246,255,0.22)';
      nav.style.boxShadow = '0 10px 40px rgba(0,0,0,0.6)';
    } else {
      nav.style.display = '';
      nav.style.position = '';
      nav.style.boxShadow = '';
      nav.style.border = '';
    }
  });
})();

/* Smooth internal scrolling */
(function(){
  function smoothScrollTo(targetY, duration = 900) {
    const startY = window.pageYOffset;
    const diff = targetY - startY;
    let start;
    function step(timestamp) {
      if (!start) start = timestamp;
      const time = timestamp - start;
      const percent = Math.min(time / duration, 1);
      const eased = percent < 0.5
        ? 2 * percent * percent
        : -1 + (4 - 2 * percent) * percent;
      window.scrollTo(0, Math.round(startY + diff * eased));
      if (time < duration) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const targetEl = document.querySelector(href);
      if (!targetEl) return;
      e.preventDefault();
      const headerOffset = 56;
      const targetY = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      smoothScrollTo(targetY, 900);
    });
  });
})();

/* CTA neon pulse (cursor-origin) */
(function() {
  const btn = document.querySelector('.cta');
  if (!btn) return;
  btn.addEventListener('mousemove', function(e) {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    btn.style.setProperty('--x', x + 'px');
    btn.style.setProperty('--y', y + 'px');
  });
  btn.addEventListener('mouseenter', function(e) {
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - rect.left) || rect.width/2;
    const y = (e.clientY - rect.top) || rect.height/2;
    btn.style.setProperty('--x', x + 'px');
    btn.style.setProperty('--y', y + 'px');
    btn.classList.remove('pulse');
    void btn.offsetWidth;
    btn.classList.add('pulse');
  });
  btn.addEventListener('click', function(e){
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - rect.left) || rect.width/2;
    const y = (e.clientY - rect.top) || rect.height/2;
    btn.style.setProperty('--x', x + 'px');
    btn.style.setProperty('--y', y + 'px');
    btn.classList.remove('pulse');
    void btn.offsetWidth;
    btn.classList.add('pulse');
  });
})();

/* DROPDOWN TOGGLING (reveal stacked images, measure height for smooth expand) */
(function(){
  function setContentMaxHeight(content){
    // compute real content height (allow images to finish loading first)
    const prev = content.style.maxHeight;
    content.style.maxHeight = '0px';
    // force reflow
    void content.offsetHeight;
    const full = content.scrollHeight;
    content.style.maxHeight = full + 'px';
  }

  function observeImagesAndResize(content){
    // when images load, update max-height
    const imgs = Array.from(content.querySelectorAll('img'));
    if (imgs.length === 0) return;
    let loaded = 0;
    imgs.forEach(img => {
      if (img.complete) loaded++;
      else img.addEventListener('load', () => {
        loaded++;
        setContentMaxHeight(content);
      }, { once: true });
      // also handle error so layout still correct
      img.addEventListener('error', () => {
        setContentMaxHeight(content);
      }, { once: true });
    });
    // if all already loaded, set maxHeight now
    if (loaded === imgs.length) {
      setTimeout(()=> setContentMaxHeight(content), 60);
    }
  }

  document.querySelectorAll('.dropdown-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const wrapper = btn.closest('.dropdown');
      const targetId = btn.getAttribute('data-target');
      const content = document.getElementById(targetId);
      const isOpen = wrapper.classList.contains('open');

      if (isOpen) {
        wrapper.classList.remove('open');
        btn.setAttribute('aria-expanded','false');
        content.style.maxHeight = '0';
        content.setAttribute('aria-hidden','true');
      } else {
        wrapper.classList.add('open');
        btn.setAttribute('aria-expanded','true');
        content.setAttribute('aria-hidden','false');

        // Wait a tick to allow CSS padding transition; measure content height and set maxHeight
        // Also observe images to recalc if they load after opening
        setTimeout(() => {
          setContentMaxHeight(content);
          observeImagesAndResize(content);
        }, 60);
      }
    });
  });
})();

/* CONTACT FORM VALIDATION + mailto submit + subtle glitch error effect */
(function(){
  const form = document.getElementById('contactForm');
  if (!form) return;

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const subjectInput = document.getElementById('subject');
  const messageInput = document.getElementById('message');

  const errName = document.getElementById('err-name');
  const errEmail = document.getElementById('err-email');
  const errPhone = document.getElementById('err-phone');
  const errSubject = document.getElementById('err-subject');
  const errMessage = document.getElementById('err-message');
  const statusEl = document.getElementById('formStatus');

  function validateEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(el, msg){
    el.textContent = '⚠ ' + msg;
    el.setAttribute('data-text', '⚠ ' + msg);
    el.classList.add('show','glitch');
    const parent = el.previousElementSibling || el.parentElement;
    if (parent) {
      parent.classList.add('shake');
      setTimeout(()=> parent.classList.remove('shake'), 550);
    }
    setTimeout(()=> { el.classList.remove('glitch'); }, 1300);
  }

  function clearError(el){
    el.textContent = '';
    el.classList.remove('show','glitch');
  }

  function validateAll(){
    let ok = true;
    clearError(errName); clearError(errEmail); clearError(errPhone); clearError(errSubject); clearError(errMessage);
    statusEl.textContent = '';

    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim();
    const phoneVal = phoneInput.value.trim();
    const subjectVal = subjectInput.value.trim();
    const messageVal = messageInput.value.trim();

    if (nameVal.length < 2){ showError(errName, 'Please enter your name'); ok = false; }
    if (!validateEmail(emailVal)){ showError(errEmail, 'Please enter a valid email'); ok = false; }
    if (phoneVal && phoneVal.length < 7){ showError(errPhone, 'Please enter a valid phone'); ok = false; }
    if (subjectVal.length > 0 && subjectVal.length < 3){ showError(errSubject, 'Subject is too short'); ok = false; }
    if (messageVal.length < 10){ showError(errMessage, 'Message must be at least 10 characters'); ok = false; }

    return ok;
  }

  [nameInput, emailInput, phoneInput, subjectInput, messageInput].forEach(input => {
    input.addEventListener('input', () => {
      const errMap = { name: errName, email: errEmail, phone: errPhone, subject: errSubject, message: errMessage };
      clearError(errMap[input.id]);
    });
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    if (!validateAll()){
      statusEl.textContent = 'Please fix the highlighted errors.';
      return;
    }

    const to = 'nathaneapen2006@gmail.com';
    const subject = subjectInput.value.trim() || 'Website contact from ' + nameInput.value.trim();
    let body = '';
    body += 'Name: ' + nameInput.value.trim() + '\n';
    body += 'Email: ' + emailInput.value.trim() + '\n';
    if (phoneInput.value.trim()) body += 'Phone: ' + phoneInput.value.trim() + '\n';
    body += '\nMessage:\n' + messageInput.value.trim() + '\n\n';
    body += '-- via website contact form --';

    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    statusEl.textContent = 'Opening email app...';
    window.location.href = mailto;

    const btn = form.querySelector('.send-btn');
    if (btn) {
      btn.classList.add('sent');
      setTimeout(()=> btn.classList.remove('sent'), 1200);
    }

    setTimeout(() => {
      nameInput.value = ''; emailInput.value = ''; phoneInput.value = ''; subjectInput.value = ''; messageInput.value = '';
      statusEl.textContent = 'If your mail app did not open, please copy the message and email manually.';
    }, 1400);
  });
})();
