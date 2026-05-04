(function () {
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function isValidEmail(value) {
    return EMAIL_RE.test(value.trim());
  }

  async function submitToFormspree(email, source) {
    var endpoint = window.FORMSPREE_ENDPOINT;
    if (!endpoint) {
      // No endpoint configured — succeed silently after a short delay (dev mode).
      await new Promise(function (r) { return setTimeout(r, 500); });
      return;
    }
    var res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, source: source, page: 'boom-catcher-landing' }),
    });
    if (!res.ok) throw new Error('Formspree returned status ' + res.status);
  }

  // ─── Hero form ───
  function initHeroForm() {
    var form = document.getElementById('hero-form');
    var input = document.getElementById('hero-email');
    var meta = document.getElementById('hero-meta');
    var btn = document.getElementById('hero-submit');
    if (!form) return;

    var state = 'idle';

    input.addEventListener('input', function () {
      if (state === 'error') {
        state = 'idle';
        form.classList.remove('is-error');
        meta.classList.remove('is-error');
        meta.textContent = 'BETA LAUNCHING Q3 2026 · iOS & ANDROID · FREE DURING BETA';
      }
    });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (state === 'loading' || state === 'success') return;
      var email = input.value.trim();
      if (!isValidEmail(email)) {
        state = 'error';
        form.classList.add('is-error');
        meta.classList.add('is-error');
        meta.textContent = "That email doesn't look real. Try again.";
        return;
      }
      state = 'loading';
      btn.textContent = 'Signing…';
      try {
        await submitToFormspree(email, 'hero');
        state = 'success';
        renderHeroSuccess(form);
      } catch (err) {
        state = 'error';
        form.classList.add('is-error');
        meta.classList.add('is-error');
        meta.textContent = 'Something went wrong. Try again?';
        btn.textContent = 'Join Beta →';
      }
    });
  }

  function renderHeroSuccess(form) {
    var success = document.createElement('div');
    success.className = 'signup-success';
    success.innerHTML =
      '<div class="check" aria-hidden="true">✓</div>' +
      '<div>' +
        '<div class="msg-line1">You\'re on the list.</div>' +
        '<div class="msg-line2">BETA · Q3 2026 · iOS + ANDROID</div>' +
      '</div>';
    form.parentNode.replaceChild(success, form);
    var meta = document.getElementById('hero-meta');
    if (meta) meta.style.display = 'none';
    var fineprint = document.querySelector('.form-fineprint');
    if (fineprint) fineprint.style.display = 'none';
  }

  // ─── Sticky bar ───
  function initStickyBar() {
    var bar = document.getElementById('sticky-signup');
    var dismiss = document.getElementById('sticky-dismiss');
    var form = document.getElementById('sticky-form');
    var input = document.getElementById('sticky-email');
    var headline = document.getElementById('sticky-headline-text');
    if (!bar || !form) return;

    var state = 'idle';

    function onScroll() {
      if (bar.classList.contains('is-dismissed')) return;
      if (window.scrollY > window.innerHeight * 0.85) {
        bar.classList.add('is-visible');
        bar.setAttribute('aria-hidden', 'false');
      } else {
        bar.classList.remove('is-visible');
        bar.setAttribute('aria-hidden', 'true');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    dismiss.addEventListener('click', function () {
      bar.classList.add('is-dismissed');
      bar.classList.remove('is-visible');
    });

    input.addEventListener('input', function () {
      if (state === 'error') {
        state = 'idle';
        form.classList.remove('is-error');
      }
    });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (state === 'loading' || state === 'success') return;
      var email = input.value.trim();
      if (!isValidEmail(email)) {
        state = 'error';
        form.classList.add('is-error');
        return;
      }
      state = 'loading';
      try {
        await submitToFormspree(email, 'sticky');
        state = 'success';
        var formWrap = form.parentNode;
        var success = document.createElement('div');
        success.className = 'sticky-success';
        success.textContent = '✓ ON THE LIST · CHECK YOUR INBOX';
        formWrap.replaceChild(success, form);
        if (headline) {
          headline.innerHTML = 'Seen enough? <em>Welcome in.</em>';
        }
      } catch (err) {
        state = 'error';
        form.classList.add('is-error');
      }
    });
  }

  // ─── Share buttons ───
  function initShare() {
    var SHARE_URL = 'https://boomcatcher.app/';
    var SHARE_TITLE = 'Boom Catcher — Take back your street.';
    var SHARE_TEXT = "Tortured by loud cars or bikes? Boom Catcher catches them on video the moment they bust 88 dB. Receipts for your city council.";

    var nativeBtn = document.getElementById('share-native');
    var copyBtn = document.getElementById('share-copy');
    var copyLabel = document.getElementById('share-copy-label');
    var xLink = document.getElementById('share-x');
    var fbLink = document.getElementById('share-fb');
    var waLink = document.getElementById('share-wa');
    var smsLink = document.getElementById('share-sms');

    var u = encodeURIComponent(SHARE_URL);
    var t = encodeURIComponent(SHARE_TEXT);
    var combined = encodeURIComponent(SHARE_TEXT + ' ' + SHARE_URL);

    if (xLink) xLink.href = 'https://twitter.com/intent/tweet?text=' + t + '&url=' + u;
    if (fbLink) fbLink.href = 'https://www.facebook.com/sharer/sharer.php?u=' + u;
    if (waLink) waLink.href = 'https://wa.me/?text=' + combined;
    if (smsLink) {
      // iOS uses ?body=, Android uses ?body= too — universal form
      smsLink.href = 'sms:?&body=' + combined;
    }

    if (nativeBtn) {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        nativeBtn.addEventListener('click', function () {
          navigator.share({
            title: SHARE_TITLE,
            text: SHARE_TEXT,
            url: SHARE_URL,
          }).catch(function () { /* user cancelled — ignore */ });
        });
      } else {
        nativeBtn.classList.add('is-hidden');
      }
    }

    if (copyBtn && copyLabel) {
      copyBtn.addEventListener('click', async function () {
        try {
          await navigator.clipboard.writeText(SHARE_URL);
        } catch (err) {
          // Fallback for old browsers
          var ta = document.createElement('textarea');
          ta.value = SHARE_URL;
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); } catch (e) {}
          document.body.removeChild(ta);
        }
        copyBtn.classList.add('is-copied');
        copyLabel.textContent = 'Copied ✓';
        setTimeout(function () {
          copyBtn.classList.remove('is-copied');
          copyLabel.textContent = 'Copy link';
        }, 1800);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeroForm();
    initStickyBar();
    initShare();
  });
})();
