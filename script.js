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

