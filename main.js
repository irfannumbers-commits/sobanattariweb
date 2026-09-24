(function () {
  // Absolute clean URLs (Vercel rewrites map these to the underlying .html
  // files) — they work identically no matter how deep the current page is,
  // so there's no more "root"/relative-path calculation needed.
  const home = '/';
  const about = '/soban-attari-biography/';
  const updates = '/updates/';
  const projects = '/activities/';
  const videos = '/videos/';
  const books = '/books/';

  // Small pulsing live-dot next to "Updates" — desktop nav, every page,
  // same treatment as the home page (the old hand-drawn circle is retired).
  const updatesScribble = '';
  const updatesDot = `<span class="updates-dot" aria-hidden="true"></span>`;

  const nav = document.getElementById('navbar');
  const mobileMenu = document.getElementById('mobile-menu');

  if (nav && mobileMenu) {
    nav.querySelector('.nav-inner').innerHTML = `
      <a href="${home}" class="site-logo" aria-label="Soban Attari Home">
        <span class="logo-mark"><span class="logo-line-1">SOBAN</span><span class="logo-line-2">ATTARI</span></span>
      </a>
      <div class="nav-links" id="nav-links">
        <a href="${home}" data-nav="home">Home</a>
        <a href="${about}" data-nav="about">About</a>
        <a href="${updates}" data-nav="updates"><span class="updates-shine"></span>Updates${updatesDot}${updatesScribble}</a>
        <a href="${projects}" data-nav="projects">Projects</a>
        <a href="${videos}" data-nav="videos">Videos</a>
        <a href="${books}" data-nav="books">Books</a>
        <a href="${home}#contact" data-nav="contact">Contact</a>
        <a href="${home}#book-session" class="nav-cta">Book a Session</a>
      </div>
      <button class="nav-hamburger" id="nav-hamburger" onclick="toggleMenu()" aria-label="Open menu" aria-controls="mobile-menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>`;

    mobileMenu.innerHTML = `
      <div class="nav-mobile-header"><span class="nav-mobile-title">Menu</span><button class="nav-mobile-close" type="button" onclick="closeMenu()" aria-label="Close menu">&times;</button></div>
      <a href="${home}" data-nav="home" onclick="closeMenu()">Home</a>
      <a href="${about}" data-nav="about" onclick="closeMenu()">About</a>
      <a href="${updates}" data-nav="updates" onclick="closeMenu()"><span class="updates-shine"></span>Updates</a>
      <a href="${projects}" data-nav="projects" onclick="closeMenu()">Projects</a>
      <a href="${videos}" data-nav="videos" onclick="closeMenu()">Videos</a>
      <a href="${books}" data-nav="books" onclick="closeMenu()">Books</a>
      <a href="${home}#contact" data-nav="contact" onclick="closeMenu()">Contact</a>
      <a href="${home}#book-session" onclick="closeMenu()">Book a Session</a>`;

    /* ---- active / current link ---- */
    // Read the first path segment. Works for clean URLs ("/programs/x/" ->
    // "programs") and still degrades safely for a raw "/programs/x.html"
    // fallback during local file testing.
    const segments = window.location.pathname.split('/').filter(Boolean);
    const first = (segments[0] || '').toLowerCase().replace(/\.html$/, '');
    const PAGE_NAV = {
      '': 'home',
      'soban-attari-biography': 'about',
      'updates': 'updates',
      'activities': 'projects',
      'programs': 'projects',
      'events': 'updates',
      'videos': 'videos',
      'books': 'books',
      'seerat-mustafa-modern-science': 'books',
      // local .html fallback (pre-rewrite / file:// testing)
      'index': 'home',
      'biography': 'about',
      'projects': 'projects'
    };
    const navKey = PAGE_NAV[first] || '';
    if (navKey) {
      document.querySelectorAll('[data-nav="' + navKey + '"]').forEach(function (el) {
        el.classList.add('active');
        el.setAttribute('aria-current', 'page');
      });
    }

    /* ---- Home page only: "Contact" nav link takes over the active/underline
           state while the #contact section is in view, and hands it back to
           "Home" once the visitor scrolls elsewhere on the page. ---- */
    const contactSection = navKey === 'home' ? document.getElementById('contact') : null;
    if (contactSection) {
      const homeLinks = document.querySelectorAll('[data-nav="home"]');
      const contactLinks = document.querySelectorAll('[data-nav="contact"]');
      const setActiveGroup = function (links, isActive) {
        links.forEach(function (el) {
          el.classList.toggle('active', isActive);
          if (isActive) el.setAttribute('aria-current', 'page');
          else el.removeAttribute('aria-current');
        });
      };
      const contactSpy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          setActiveGroup(contactLinks, entry.isIntersecting);
          setActiveGroup(homeLinks, !entry.isIntersecting);
        });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
      contactSpy.observe(contactSection);
    }

    /* ---- Mobile drawer: single source of truth for open/close, with a focus
            trap, focus restore, inert page behind it, and auto-close when the
            viewport grows back to desktop. Overrides any per-page copies. ---- */
    (function setupMobileMenu() {
      const backdrop = document.getElementById('mobile-menu-backdrop');
      const hamburger = document.getElementById('nav-hamburger');
      const DESKTOP_BP = 880; // must match the CSS breakpoint
      let lastFocused = null;

      function setPageInert(on) {
        Array.prototype.forEach.call(document.body.children, function (el) {
          if (el === mobileMenu || el === backdrop) return;
          if (on) el.setAttribute('inert', '');
          else el.removeAttribute('inert');
        });
      }

      function trapTab(e) {
        if (e.key === 'Escape') { closeMenu(); return; }
        if (e.key !== 'Tab') return;
        const items = mobileMenu.querySelectorAll('a[href], button:not([disabled])');
        if (!items.length) return;
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }

      function openMenu() {
        if (mobileMenu.classList.contains('open')) return;
        lastFocused = document.activeElement;
        mobileMenu.classList.add('open');
        if (backdrop) backdrop.classList.add('open');
        mobileMenu.setAttribute('aria-hidden', 'false');
        if (hamburger) hamburger.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open');
        setPageInert(true);
        document.addEventListener('keydown', trapTab, true);
        const close = mobileMenu.querySelector('.nav-mobile-close');
        if (close) close.focus();
      }

      function closeMenu() {
        if (!mobileMenu.classList.contains('open')) return;
        mobileMenu.classList.remove('open');
        if (backdrop) backdrop.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
        setPageInert(false);
        document.removeEventListener('keydown', trapTab, true);
        if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
        else if (hamburger) hamburger.focus();
      }

      function toggleMenu() {
        (mobileMenu.classList.contains('open') ? closeMenu : openMenu)();
      }

      window.toggleMenu = toggleMenu;
      window.closeMenu = closeMenu;

      let resizeTimer;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          if (window.innerWidth > DESKTOP_BP && mobileMenu.classList.contains('open')) closeMenu();
        }, 120);
      });
    })();
  }

  /* ---- Booking: every "Book a Session" CTA (navbar, hero, mobile menu,
         and any future one) opens a small popup with exactly two options.
         The site collects no registration data itself — University/
         Corporate hands straight off to its Google Form in a new tab;
         One-to-One isn't open for booking yet, so it's shown but inert. ---- */
  (function setupBooking() {
    const OPTIONS = [
      {
        title: 'University / Corporate Session',
        desc: 'Invite Soban Attari to speak at your campus, company, or organization.',
        href: 'https://forms.gle/5jdV6iNP5XoudCB8A'
      },
      {
        title: 'One-to-One Session',
        desc: 'A personal online session with Soban Attari.',
        soon: true
      }
    ];

    let modal, lastFocused;

    function build() {
      modal = document.createElement('div');
      modal.id = 'booking-modal';
      modal.className = 'terms-modal-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'bk-title');
      modal.setAttribute('aria-hidden', 'true');
      modal.style.display = 'none';
      modal.innerHTML = `
        <div class="terms-modal-box channels-modal-box">
          <button type="button" class="bk-close" aria-label="Close">&times;</button>
          <div class="terms-modal-header">
            <span class="terms-badge">Book</span>
            <h2 id="bk-title">Book a Session</h2>
          </div>
          <div class="channels-list">
            ${OPTIONS.map(function (o) {
              if (o.soon) {
                return `
            <div class="channels-row is-disabled" aria-disabled="true">
              <span class="channels-info"><b>${o.title}<span class="channels-soon-tag">Coming Soon</span></b><small>${o.desc}</small></span>
            </div>`;
              }
              return `
            <a class="channels-row" href="${o.href}" target="_blank" rel="noopener">
              <span class="channels-info"><b>${o.title}</b><small>${o.desc}</small></span>
              <span class="channels-arrow" aria-hidden="true">&rarr;</span>
            </a>`;
            }).join('')}
          </div>
        </div>`;
      document.body.appendChild(modal);

      modal.querySelector('.bk-close').addEventListener('click', closeModal);
      modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
      });
    }

    function openModal() {
      if (!modal) build();
      lastFocused = document.activeElement;
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      modal.setAttribute('aria-hidden', 'false');
      modal.querySelector('.bk-close').focus();
    }
    function closeModal() {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      modal.setAttribute('aria-hidden', 'true');
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    /* delegated so every "Book a Session" CTA opens the popup — current or
       added later, on any page. */
    document.addEventListener('click', function (e) {
      const trigger = e.target.closest('a[href*="book-session"], .card-cta, [data-book-trigger]');
      if (!trigger || (modal && modal.contains(trigger))) return;
      e.preventDefault();
      openModal();
    });
  })();

  /* ---- Combined platform cards (homepage) — a single tile shows a
     platform's total audience; clicking it opens a popup listing each
     of that platform's individual accounts. Shared by YouTube & Instagram. ---- */
  function setupChannelsPopup(cfg) {
    const trigger = document.getElementById(cfg.triggerId);
    if (!trigger) return;

    let modal, lastFocused;

    function build() {
      modal = document.createElement('div');
      modal.id = cfg.modalId;
      modal.className = 'terms-modal-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', cfg.modalId + '-title');
      modal.setAttribute('aria-hidden', 'true');
      modal.style.display = 'none';
      modal.innerHTML = `
        <div class="terms-modal-box channels-modal-box">
          <button type="button" class="bk-close" aria-label="Close">&times;</button>
          <div class="terms-modal-header">
            <span class="terms-badge">${cfg.badge}</span>
            <h2 id="${cfg.modalId}-title">${cfg.title}</h2>
            <p class="terms-intro">${cfg.intro}</p>
          </div>
          <div class="channels-list">
            ${cfg.channels.map(function (c) { return `
            <a class="channels-row" href="${c.href}" target="_blank" rel="noopener">
              <span class="channels-icon">${c.icon || cfg.icon}</span>
              <span class="channels-info"><b>${c.name}</b><small>${c.count} followers</small></span>
              <span class="channels-arrow" aria-hidden="true">&rarr;</span>
            </a>`; }).join('')}
          </div>
        </div>`;
      document.body.appendChild(modal);

      modal.querySelector('.bk-close').addEventListener('click', closeModal);
      modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
      });
    }

    function openModal() {
      if (!modal) build();
      lastFocused = document.activeElement;
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      modal.setAttribute('aria-hidden', 'false');
      modal.querySelector('.bk-close').focus();
    }
    function closeModal() {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      modal.setAttribute('aria-hidden', 'true');
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    trigger.addEventListener('click', openModal);
  }

  const YT_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28"><path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>';
  setupChannelsPopup({
    triggerId: 'yt-combined-card',
    modalId: 'yt-modal',
    badge: 'YouTube',
    title: 'Our YouTube Channels',
    intro: 'Lectures, shorts &amp; speeches &mdash; three channels, one message.',
    icon: YT_ICON,
    channels: [
      { name: 'Soban Attari', count: '1M', href: 'https://www.youtube.com/@SobanAttari26' },
      { name: 'Soban Attari Shorts', count: '140K', href: 'https://www.youtube.com/@sobanattarishorts26' },
      { name: 'Soban Attari Speeches', count: '69K', href: 'https://www.youtube.com/@SobanAttariSpeeches26' }
    ]
  });

  const IG_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28"><defs><radialGradient id="ig-grad-modal" cx="30%" cy="107%" r="150%"><stop offset="0%" stop-color="#fdf497"/><stop offset="5%" stop-color="#fdf497"/><stop offset="45%" stop-color="#fd5949"/><stop offset="60%" stop-color="#d6249f"/><stop offset="90%" stop-color="#285AEB"/></radialGradient></defs><path fill="url(#ig-grad-modal)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>';
  setupChannelsPopup({
    triggerId: 'ig-combined-card',
    modalId: 'ig-modal',
    badge: 'Instagram',
    title: 'Our Instagram Accounts',
    intro: 'Daily reminders &amp; reflections &mdash; two accounts, one message.',
    icon: IG_ICON,
    channels: [
      { name: 'Soban Attari', count: '545K', href: 'https://www.instagram.com/sobanattari26/' },
      { name: 'Youth Talk', count: '24.3K', href: 'https://www.instagram.com/youthtalk.official/' }
    ]
  });

  // ---- YouTube click-to-load facades (videos page) ----
  // Swaps a thumbnail + play button for a real iframe only on click, so a
  // page with many embeds doesn't fire them all at once on load. Starting a
  // new video stops whichever one was already playing, so only one plays
  // at a time.
  const ytFacades = document.querySelectorAll('.yt-facade');
  if (ytFacades.length) {
    const YT_PLAY_ICON = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';

    function buildYtFacade(id, title) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'yt-facade';
      btn.dataset.ytId = id;
      btn.dataset.ytTitle = title;
      btn.setAttribute('aria-label', 'Play video: ' + title);
      btn.innerHTML = `<img class="yt-facade-thumb" src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy" /><span class="yt-facade-play" aria-hidden="true">${YT_PLAY_ICON}</span>`;
      btn.addEventListener('click', function () { playYtFacade(btn); });
      return btn;
    }

    function stopYtVideo(iframe) {
      iframe.replaceWith(buildYtFacade(iframe.dataset.ytId, iframe.dataset.ytTitle));
    }

    // Re-warm YouTube's connections right as the user reaches for a facade
    // (hover on desktop, touch on mobile) — the static <link rel="preconnect">
    // tags in <head> cover the first few seconds after page load, but a
    // browser drops an idle preconnection after ~10s, so a visitor who
    // waits before clicking would otherwise pay the full DNS/TLS cost again.
    let ytWarmed = false;
    function warmYtConnections() {
      if (ytWarmed) return;
      ytWarmed = true;
      ['https://www.youtube.com', 'https://www.google.com', 'https://googlevideo.com'].forEach(function (origin) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = origin;
        document.head.appendChild(link);
      });
    }

    function playYtFacade(facade) {
      warmYtConnections();
      document.querySelectorAll('.yt-facade-iframe').forEach(stopYtVideo);
      const id = facade.dataset.ytId;
      const title = facade.dataset.ytTitle;
      const iframe = document.createElement('iframe');
      iframe.className = 'yt-facade-iframe';
      iframe.dataset.ytId = id;
      iframe.dataset.ytTitle = title;
      iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
      iframe.title = title;
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      facade.replaceWith(iframe);
    }

    ytFacades.forEach(function (facade) {
      facade.addEventListener('pointerenter', warmYtConnections, { once: true });
      facade.addEventListener('touchstart', warmYtConnections, { once: true, passive: true });
      facade.addEventListener('click', function () { playYtFacade(facade); });
    });
  }

  // ---- Floating "Contact Us" button — every page, always reachable ----
  // The full #contact section (home page only) and the "Contact" nav link
  // are otherwise the only ways to reach out, and on mobile that means
  // opening the hamburger menu first. This stays pinned bottom-right on
  // every page so Email is always one tap away.
  (function setupContactFab() {
    const MAIL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
    const CHAT_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
    const CLOSE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';

    const wrap = document.createElement('div');
    wrap.className = 'contact-fab-wrap';
    wrap.innerHTML = `
      <div class="contact-fab-panel" id="contact-fab-panel" role="dialog" aria-modal="false" aria-labelledby="contact-fab-title" aria-hidden="true">
        <div class="contact-fab-panel-head">
          <span id="contact-fab-title">Get in Touch</span>
          <button type="button" class="contact-fab-close" aria-label="Close contact options">&times;</button>
        </div>
        <div class="contact-fab-links">
          <a class="contact-fab-link" href="mailto:team@sobanattari.com">
            <span class="contact-fab-link-icon">${MAIL_ICON}</span>
            <span class="contact-fab-link-text"><b>Email</b><small>team@sobanattari.com</small></span>
          </a>
        </div>
      </div>
      <button type="button" class="contact-fab-btn" aria-haspopup="dialog" aria-expanded="false" aria-controls="contact-fab-panel" aria-label="Contact us">
        <span class="contact-fab-icon-open" aria-hidden="true">${CHAT_ICON}</span>
        <span class="contact-fab-icon-close" aria-hidden="true">${CLOSE_ICON}</span>
      </button>`;
    document.body.appendChild(wrap);

    const btn = wrap.querySelector('.contact-fab-btn');
    const panel = wrap.querySelector('.contact-fab-panel');
    const closeBtn = wrap.querySelector('.contact-fab-close');

    function open() {
      wrap.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');
    }
    function close() {
      wrap.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
    }

    btn.addEventListener('click', function () {
      if (wrap.classList.contains('is-open')) close(); else open();
    });
    closeBtn.addEventListener('click', function () { close(); btn.focus(); });
    document.addEventListener('click', function (e) {
      if (wrap.classList.contains('is-open') && !wrap.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && wrap.classList.contains('is-open')) { close(); btn.focus(); }
    });
  })();
})();
