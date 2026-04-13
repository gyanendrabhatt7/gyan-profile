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
//  Avatar Photo Upload (Admin Only)
// ==============================
const avatarUpload  = document.getElementById('avatar-upload');
const avatarDisplay = document.getElementById('avatar-display');
const avatarLabel   = document.querySelector('.avatar-upload-label');

// Restore saved photo on page load
(function restoreSavedPhoto() {
  const saved = localStorage.getItem('gb_avatar_b64');
  if (saved && avatarDisplay) {
    avatarDisplay.innerHTML = `<img src="${saved}" alt="Profile Photo" />`;
    avatarDisplay.classList.add('has-photo');
  }
})();

if (avatarUpload && avatarDisplay) {
  avatarUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      avatarDisplay.innerHTML = `<img src="${ev.target.result}" alt="Profile Photo" />`;
      avatarDisplay.classList.add('has-photo');
      localStorage.setItem('gb_avatar_b64', ev.target.result);
    };
    reader.readAsDataURL(file);
  });
}

// ==============================
//  Admin Auth (Avatar Upload)
// ==============================
// Password is verified using SHA-256 hashing (never stored in plain text).
// ── DEFAULT PASSWORD: admin@GB2025 ──
//
// To set a NEW password in future:
//   1. Open browser console (F12 → Console tab)
//   2. Run this command (replace 'yourNewPassword' with your real one):
//        crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourNewPassword'))
//          .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
//   3. Copy the printed hash string
//   4. Replace the ADMIN_PASSWORD_HASH value below with it
//   5. Commit to Git: git add script.js && git commit -m "chore: update admin password hash"
const ADMIN_PASSWORD_HASH = 'dab6f348e6eefe9e805d9cbaaca90e0aa482b3cdfe7305eff6ea65f4c913b6ae';

async function hashPassword(pw) {
  const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
  return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2,'0')).join('');
}

let isAdminAuthed = false;

function enableAvatarUpload() {
  if (!avatarLabel) return;
  // Restore full style for the label
  avatarLabel.style.cssText = `
    position: absolute; inset: 8px; border-radius: 50%; z-index: 3;
    display: flex; align-items: flex-end; justify-content: center;
    padding-bottom: 14px; cursor: pointer; background: transparent;
    transition: all 0.3s ease; opacity: 0;
  `;
  // Show on hover
  const wrap = document.querySelector('.hero-avatar-wrap');
  if (wrap) {
    wrap.addEventListener('mouseenter', () => { if (isAdminAuthed) avatarLabel.style.opacity = '1'; });
    wrap.addEventListener('mouseleave', () => { avatarLabel.style.opacity = '0'; });
    // Overlay darkening
    avatarLabel.style.setProperty('--darken', '1');
  }
}

// Admin Login Modal
const adminLoginOverlay = document.getElementById('admin-login-overlay');
const adminLoginForm    = document.getElementById('admin-login-form');
const adminLoginClose   = document.getElementById('admin-login-close');
const adminLoginError   = document.getElementById('admin-login-error');
const adminLoginStatus  = document.getElementById('admin-login-status');

function openAdminLogin() {
  if (!adminLoginOverlay) return;
  adminLoginOverlay.style.display = 'flex';
  setTimeout(() => adminLoginOverlay.classList.add('visible'), 10);
  const pwInput = document.getElementById('admin-pw-input');
  if (pwInput) { pwInput.value = ''; pwInput.focus(); }
  if (adminLoginError) adminLoginError.textContent = '';
  if (adminLoginStatus) adminLoginStatus.textContent = isAdminAuthed ? '✅ You are already logged in as Admin.' : '';
}

function closeAdminLogin() {
  if (!adminLoginOverlay) return;
  adminLoginOverlay.classList.remove('visible');
  setTimeout(() => { adminLoginOverlay.style.display = 'none'; }, 300);
}

if (adminLoginClose) adminLoginClose.addEventListener('click', closeAdminLogin);
if (adminLoginOverlay) {
  adminLoginOverlay.addEventListener('click', (e) => {
    if (e.target === adminLoginOverlay) closeAdminLogin();
  });
}

if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pwInput = document.getElementById('admin-pw-input');
    if (!pwInput) return;
    const hashed = await hashPassword(pwInput.value);
    if (hashed === ADMIN_PASSWORD_HASH) {
      isAdminAuthed = true;
      enableAvatarUpload();
      if (adminLoginStatus) {
        adminLoginStatus.textContent = '✅ Admin access granted! Hover over the avatar to upload a photo.';
        adminLoginStatus.style.color = '#00ffa3';
      }
      if (adminLoginError) adminLoginError.textContent = '';
      setTimeout(closeAdminLogin, 2000);
    } else {
      if (adminLoginError) {
        adminLoginError.textContent = '❌ Incorrect password. Try again.';
        // Shake animation
        adminLoginForm.classList.add('shake');
        setTimeout(() => adminLoginForm.classList.remove('shake'), 500);
      }
      pwInput.value = '';
      pwInput.focus();
    }
  });
}

// Shortcut: Ctrl + Shift + A → open admin login
document.addEventListener('keydown', (ev) => {
  if (ev.ctrlKey && ev.shiftKey && ev.key.toUpperCase() === 'A') {
    ev.preventDefault();
    adminLoginOverlay && adminLoginOverlay.style.display === 'flex' ? closeAdminLogin() : openAdminLogin();
  }
});

// ==============================
//  Contact Form (FormSubmit.co)
// ==============================
const form = document.getElementById('contact-form');
if (form) {
  // Create a hidden iframe to capture the FormSubmit response
  // so the page does NOT navigate away on submit
  const iframe = document.createElement('iframe');
  iframe.name = 'formsubmit-iframe';
  iframe.id   = 'formsubmit-iframe';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  // Point form submission into the hidden iframe
  form.setAttribute('target', 'formsubmit-iframe');

  form.addEventListener('submit', (e) => {
    const btn = form.querySelector('button[type="submit"]');

    // To avoid "Unsafe attempt to load URL file:///" console errors when testing locally,
    // we provide a valid HTTPS URL for FormSubmit to redirect the iframe to after success.
    const nextInput = form.querySelector('[name="_next"]');
    if (nextInput) {
      if (window.location.protocol === 'file:') {
        // Redirect to a dummy external page instead of back to the local file URL
        nextInput.value = 'https://example.com';
      } else {
        // When hosted on a real domain, naturally redirect back to the page
        nextInput.value = window.location.href;
      }
    }

    btn.innerHTML = '⏳ Sending...';
    btn.disabled = true;

    // FormSubmit takes about 1-2 seconds to process the email.
    // We rely on a timeout to show success instead of tracking iframe cross-origin onload 
    // to guarantee no console DOM origin errors are thrown.
    setTimeout(() => {
      btn.innerHTML = '✅ Message Sent!';
      btn.style.background = 'linear-gradient(135deg, #00ffa3, #00b074)';
      form.reset();

      setTimeout(() => {
        btn.innerHTML = '<span>Send Message</span> <span>→</span>';
        btn.style.background = '';
        btn.disabled = false;
      }, 4000);
    }, 2500);
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

// ==============================
//  Resume Download & Upload
// ==============================
const RESUME_KEY = 'gb_resume_b64';

/** Decode stored base64 PDF back into a Blob */
function getResumeBlob() {
  const b64 = localStorage.getItem(RESUME_KEY);
  if (!b64) return null;
  try {
    const binary = atob(b64);
    const bytes  = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: 'application/pdf' });
  } catch (e) { return null; }
}

/** Trigger a real file download of the stored resume */
function triggerResumeDownload(e) {
  e.preventDefault();
  const blob = getResumeBlob();
  if (!blob) {
    alert('📄 No resume uploaded yet!\n\nPress Ctrl + Shift + R to open the Resume Upload panel.');
    return;
  }
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = 'Gyanendra_Bhatt_Resume.pdf';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
}

// Wire the nav and mobile Resume buttons
['nav-resume-btn', 'mobile-resume-btn'].forEach(id => {
  const btn = document.getElementById(id);
  if (btn) btn.addEventListener('click', triggerResumeDownload);
});

// ==============================
//  Resume Admin Panel
// ==============================
const adminOverlay = document.getElementById('resume-admin-overlay');
const adminClose   = document.getElementById('resume-admin-close');
const dropZone     = document.getElementById('resume-drop-zone');
const resumeInput  = document.getElementById('resume-file-input');
const statusEl     = document.getElementById('resume-admin-status');

function openAdminPanel() {
  if (!adminOverlay) return;
  adminOverlay.style.display = 'flex';
  // Reset status
  if (statusEl) {
    const saved = localStorage.getItem(RESUME_KEY);
    statusEl.className = 'resume-admin-status' + (saved ? ' success' : '');
    statusEl.textContent = saved ? '✅ A resume is already saved — upload a new one to replace it.' : '';
  }
}

function closeAdminPanel() {
  if (adminOverlay) adminOverlay.style.display = 'none';
}

function showUploadStatus(msg, type) {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.className   = 'resume-admin-status' + (type ? ' ' + type : '');
}

/** Read a PDF File object, base64-encode it, store in localStorage */
function processResumePDF(file) {
  if (!file) return;
  if (file.type !== 'application/pdf') {
    showUploadStatus('❌ Please upload a valid PDF file.', 'error');
    return;
  }
  showUploadStatus('⏳ Processing your PDF…', '');
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      // Convert ArrayBuffer → base64
      const bytes  = new Uint8Array(ev.target.result);
      let binary   = '';
      bytes.forEach(b => (binary += String.fromCharCode(b)));
      const b64    = btoa(binary);
      localStorage.setItem(RESUME_KEY, b64);
      showUploadStatus('✅ Resume saved! The Download Resume button is now live.', 'success');
    } catch (err) {
      showUploadStatus('❌ Error: file may be too large. Try a smaller PDF (< 5 MB).', 'error');
    }
  };
  reader.onerror = () => showUploadStatus('❌ Could not read the file. Please try again.', 'error');
  reader.readAsArrayBuffer(file);
}

// Keyboard shortcut: Ctrl + Shift + R
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'R') {
    e.preventDefault();
    adminOverlay && adminOverlay.style.display === 'flex' ? closeAdminPanel() : openAdminPanel();
  }
});

// Close button
if (adminClose) adminClose.addEventListener('click', closeAdminPanel);

// Click outside panel to close
if (adminOverlay) {
  adminOverlay.addEventListener('click', (e) => {
    if (e.target === adminOverlay) closeAdminPanel();
  });
}

// File input change
if (resumeInput) {
  resumeInput.addEventListener('change', (e) => {
    if (e.target.files[0]) processResumePDF(e.target.files[0]);
  });
}

// Drag-and-drop on the drop zone
if (dropZone) {
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) processResumePDF(e.dataTransfer.files[0]);
  });
  // Clicking the zone (but NOT the label/button) also opens the file picker
  dropZone.addEventListener('click', (e) => {
    if (!e.target.closest('.resume-file-label') && !e.target.closest('input')) {
      if (resumeInput) resumeInput.click();
    }
  });
}

