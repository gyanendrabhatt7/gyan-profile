// ==============================
//  Scroll Reveal
// ==============================
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

// ==============================
//  Sticky Header
// ==============================
const header = document.getElementById('site-header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// ==============================
//  Mobile Nav Toggle
// ==============================
const hamburger = document.getElementById('hamburger');
const mobileNav  = document.getElementById('mobile-nav');

hamburger.addEventListener('click', () => {
  mobileNav.classList.toggle('open');
});

mobileNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
  });
});

// ==============================
//  Smooth Active Nav on Scroll
// ==============================
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.5 });

sections.forEach(s => navObserver.observe(s));

// ==============================
//  Avatar Photo Upload
// ==============================
const avatarUpload  = document.getElementById('avatar-upload');
const avatarDisplay = document.getElementById('avatar-display');

if (avatarUpload && avatarDisplay) {
  avatarUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      // Clear the "GB" text and show the uploaded image
      avatarDisplay.innerHTML = `<img src="${ev.target.result}" alt="Profile Photo" />`;
      avatarDisplay.classList.add('has-photo');
    };
    reader.readAsDataURL(file);
  });
}

// ==============================
//  Contact Form (FormSubmit.co)
// ==============================
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn  = form.querySelector('button[type="submit"]');
    const data = new FormData(form);

    // Set _next to current page so we stay here after submit
    data.set('_next', window.location.href);

    btn.innerHTML = '⏳ Sending...';
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        btn.textContent = '✅ Message Sent!';
        btn.style.background = 'linear-gradient(135deg, #00ffa3, #00b074)';
        form.reset();
        setTimeout(() => {
          btn.textContent = 'Send Message';
          btn.style.background = '';
          btn.disabled = false;
        }, 4000);
      } else {
        throw new Error('Server error');
      }
    } catch {
      btn.textContent = '❌ Error — Try Again';
      btn.style.background = 'linear-gradient(135deg, #ff4e6a, #c0002a)';
      btn.disabled = false;
      setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.style.background = '';
      }, 3500);
    }
  });
}

// ==============================
//  Cursor aurora glow
// ==============================
const cursor = document.createElement('div');
cursor.id = 'cursor-glow';
cursor.style.cssText = `
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  transition: left 0.15s ease, top 0.15s ease;
  left: -200px; top: -200px;
`;
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});
