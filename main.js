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

  // ---- Site data: update these when events change ----
  // upcomingCount feeds the Updates page "Live Updates" badge.
  const SITE_DATA = {
    upcomingCount: 3
  };

  // ---- Home page: horizontal rail of university session recaps ----
  // Each entry links to /blog/<slug>/ and uses brand_assets/sessions/<slug>-1-opt.webp.
  const HOME_RECAPS = [
    { slug: 'uet-lahore', uni: 'UET Lahore', title: 'Seerat Seminar and Ilm-o-Iftar at UET Lahore', text: 'A packed main auditorium of professors and students.' },
    { slug: 'bahria-university-karachi', uni: 'Bahria University Karachi', title: 'International Seerah Conference and “Confusion to Clarity”', text: 'Finding your purpose in life, with future doctors and faculty.' },
    { slug: 'arid-university-gujrat', uni: 'Arid University Gujrat', title: 'Istiqbal-e-Ramadan Seminar at Arid University', text: 'Welcoming the holy month with professors and students.' },
    { slug: 'punjab-university', uni: 'Punjab University · Lahore', title: 'Seerah & Business Seminar, Milaad and Plantation Drive', text: 'Sessions across departments, from HCBF to Space Science.' }
  ];
  (function renderHomeRecaps() {
    const rail = document.getElementById('home-recaps');
    if (!rail) return;
    const arrow = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    rail.innerHTML = HOME_RECAPS.map(function (r) {
      const img = '/brand_assets/sessions/' + r.slug + '-1-opt.webp';
      return '<a class="recap-card" role="listitem" href="/blog/' + r.slug + '/">' +
        '<span class="recap-media"><img class="sp-bg" src="' + img + '" alt="" aria-hidden="true" loading="lazy" />' +
        '<img class="sp-fg" src="' + img + '" alt="Soban Attari at ' + r.uni + '" loading="lazy" /></span>' +
        '<span class="recap-body"><span class="recap-uni">' + r.uni + '</span>' +
        '<span class="recap-title">' + r.title + '</span>' +
        '<span class="recap-text">' + r.text + '</span>' +
        '<span class="recap-more">Read recap ' + arrow + '</span></span></a>';
    }).join('') +
      '<a class="recap-card recap-card-all" role="listitem" href="/blog/"><span class="recap-all-inner">' +
      '<span class="recap-title">Explore all university sessions</span>' +
      '<span class="recap-more">View all ' + arrow + '</span></span></a>';

    const wrap = rail.closest('.recap-rail-wrap');
    const prev = wrap.querySelector('.recap-nav[data-dir="-1"]');
    const next = wrap.querySelector('.recap-nav[data-dir="1"]');
    function step() {
      const card = rail.querySelector('.recap-card');
      return card ? card.getBoundingClientRect().width + 20 : rail.clientWidth * 0.8;
    }
    function update() {
      const max = rail.scrollWidth - rail.clientWidth - 2;
      prev.disabled = rail.scrollLeft <= 2;
      next.disabled = rail.scrollLeft >= max;
      wrap.classList.toggle('at-start', rail.scrollLeft <= 2);
      wrap.classList.toggle('at-end', rail.scrollLeft >= max);
    }
    [prev, next].forEach(function (b) {
      b.addEventListener('click', function () {
        rail.scrollBy({ left: step() * Number(b.dataset.dir), behavior: 'smooth' });
      });
    });
    rail.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  document.querySelectorAll('[data-upcoming-count]').forEach(function (el) {
    el.textContent = SITE_DATA.upcomingCount;
  });


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

    /* ---- Mobile drawer: brand header, numbered links, pinned CTA + socials ---- */
    const MOBILE_LINKS = [
      { href: home, nav: 'home', label: 'Home' },
      { href: about, nav: 'about', label: 'About' },
      { href: updates, nav: 'updates', label: 'Updates', live: true },
      { href: projects, nav: 'projects', label: 'Projects' },
      { href: videos, nav: 'videos', label: 'Videos' },
      { href: books, nav: 'books', label: 'Books' },
      { href: home + '#contact', nav: 'contact', label: 'Contact' }
    ];
    const MOBILE_SOCIALS = [
      { label: 'YouTube', href: 'https://www.youtube.com/@SobanAttari26', path: 'M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z' },
      { label: 'Instagram', href: 'https://www.instagram.com/sobanattari26', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z' },
      { label: 'Facebook', href: 'https://www.facebook.com/sobanattari', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
      { label: 'X', href: 'https://twitter.com/SobanAttari26', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sobanattari', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' }
    ];
    const ARROW_ICON = '<svg class="nm-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';

    mobileMenu.innerHTML = `
      <div class="nav-mobile-header">
        <a href="${home}" class="site-logo" onclick="closeMenu()" aria-label="Soban Attari Home">
          <span class="logo-mark"><span class="logo-line-1">SOBAN</span><span class="logo-line-2">ATTARI</span></span>
        </a>
        <button class="nav-mobile-close" type="button" onclick="closeMenu()" aria-label="Close menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>
      </div>
      <nav class="nav-mobile-links" aria-label="Main menu">
        ${MOBILE_LINKS.map(function (l, i) {
          return `<a href="${l.href}" data-nav="${l.nav}" onclick="closeMenu()">
            <span class="nm-index" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
            <span class="nm-label">${l.label}${l.live ? '<span class="nm-live" aria-hidden="true"></span>' : ''}</span>
            ${ARROW_ICON}
          </a>`;
        }).join('')}
      </nav>
      <div class="nav-mobile-footer">
        <a href="${home}#book-session" class="nav-mobile-cta" onclick="closeMenu()">Book a Session${ARROW_ICON}</a>
        <div class="nav-mobile-socials">
          ${MOBILE_SOCIALS.map(function (s) {
            return `<a href="${s.href}" target="_blank" rel="noopener" aria-label="${s.label}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${s.path}"/></svg></a>`;
          }).join('')}
        </div>
        <a href="mailto:team@sobanattari.com" class="nav-mobile-email">team@sobanattari.com</a>
      </div>`;

    /* ---- Pages that open on a light breadcrumb bar (no dark hero) start
            with the solid white navbar so the links are readable. ---- */
    if (document.querySelector('.breadcrumb-bar')) nav.classList.add('scrolled');

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
        if (hamburger) { hamburger.setAttribute('aria-expanded', 'true'); hamburger.setAttribute('aria-label', 'Close menu'); }
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
        if (hamburger) { hamburger.setAttribute('aria-expanded', 'false'); hamburger.setAttribute('aria-label', 'Open menu'); }
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
    // Event detail pages keep the screen for their sticky Register / Directions bar
    if (location.pathname.indexOf('/events/') === 0) return;
    const EMAIL = 'team@sobanattari.com';
    const HINT_KEY = 'sa-email-hint-seen';
    const MAIL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>';
    const CLOSE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
    const SEND_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';

    // Compact email bubble: a click toggles a small "Email us" pill with the
    // address; a one-time hint (and a hover label on desktop) explains it.
    const wrap = document.createElement('div');
    wrap.className = 'contact-fab-wrap';
    wrap.innerHTML = `
      <a class="contact-fab-panel" id="contact-fab-panel" href="mailto:${EMAIL}" aria-hidden="true" tabindex="-1">
        <span class="cfp-text"><small>Email us</small><b>${EMAIL}</b></span>
        <span class="cfp-go">${SEND_ICON}</span>
      </a>
      <div class="contact-fab-hint" role="status" aria-live="polite"></div>
      <button type="button" class="contact-fab-btn" aria-expanded="false" aria-controls="contact-fab-panel" aria-label="Email us">
        <span class="contact-fab-icon-open" aria-hidden="true">${MAIL_ICON}</span>
        <span class="contact-fab-icon-close" aria-hidden="true">${CLOSE_ICON}</span>
      </button>`;
    document.body.appendChild(wrap);

    const btn = wrap.querySelector('.contact-fab-btn');
    const panel = wrap.querySelector('.contact-fab-panel');
    const hint = wrap.querySelector('.contact-fab-hint');
    hint.dataset.label = 'Email us';

    function hideHint() { wrap.classList.remove('show-hint'); }
    function open() {
      hideHint();
      wrap.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Hide email');
      panel.setAttribute('aria-hidden', 'false');
      panel.removeAttribute('tabindex');
    }
    function close() {
      wrap.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Email us');
      panel.setAttribute('aria-hidden', 'true');
      panel.setAttribute('tabindex', '-1');
    }

    btn.addEventListener('click', function () {
      if (wrap.classList.contains('is-open')) close(); else open();
    });
    hint.addEventListener('click', open);
    document.addEventListener('click', function (e) {
      if (wrap.classList.contains('is-open') && !wrap.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && wrap.classList.contains('is-open')) { close(); btn.focus(); }
    });

    // First-visit hint: "Questions? Email us" pops out once, then never again.
    let hintScheduled = false;
    function scheduleHint() {
      if (hintScheduled) return;
      hintScheduled = true;
      let seen = false;
      try { seen = localStorage.getItem(HINT_KEY) === '1'; } catch (err) { /* storage blocked: show it */ }
      if (seen) return;
      setTimeout(function () {
        if (wrap.classList.contains('is-open') || wrap.classList.contains('is-hidden')) { hintScheduled = false; return; }
        hint.textContent = 'Questions? Email us';
        wrap.classList.add('show-hint');
        try { localStorage.setItem(HINT_KEY, '1'); } catch (err) { /* ignore */ }
        setTimeout(hideHint, 5000);
      }, 2000);
    }

    // Home page: stay out of the way while the hero (and the purpose strip
    // right under it) fills the screen; appear once the hero scrolls away.
    const hero = document.getElementById('hero');
    if (hero && 'IntersectionObserver' in window) {
      wrap.classList.add('is-hidden');
      new IntersectionObserver(function (entries) {
        const heroVisible = entries[0].intersectionRatio >= 0.35;
        wrap.classList.toggle('is-hidden', heroVisible);
        if (heroVisible) { close(); hideHint(); } else scheduleHint();
      }, { threshold: [0, 0.35] }).observe(hero);
    } else {
      scheduleHint();
    }
  })();

  // ---- Event pages: sticky mobile action bar ----
  // On phones the poster + details push the Register / Directions button
  // below the fold. This pins a compact copy of the page's primary action
  // (with event name + date/time) to the bottom of the screen, and hides it
  // whenever the real buttons or the footer are on screen. Built from the
  // page's own markup, so each event page needs no extra HTML.
  (function setupEventStickyCta() {
    const actions = document.querySelector('.event-hero-actions');
    const primary = actions && actions.querySelector('.btn');
    const title = document.querySelector('.event-header h1');
    if (!primary || !title || !('IntersectionObserver' in window)) return;

    const facts = Array.from(document.querySelectorAll('.event-meta-bar .event-meta-pill'))
      .slice(0, 2)
      .map(function (pill) {
        // "Monday, 28 September 2026" → "28 Sep" so the time still fits
        return pill.textContent.trim()
          .replace(/^[A-Za-z]+,\s*/, '')
          .replace(/\s*\d{4}$/, '')
          .replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/,
            function (m) { return m.slice(0, 3); });
      })
      .join(' · ');

    const bar = document.createElement('div');
    bar.className = 'event-sticky-cta';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Event quick action');
    bar.innerHTML = '<div class="event-sticky-info"><strong></strong><span></span></div>';
    bar.querySelector('strong').textContent = title.textContent.trim();
    bar.querySelector('span').textContent = facts;

    const cta = primary.cloneNode(true);
    cta.classList.add('event-sticky-btn');
    bar.appendChild(cta);
    document.body.appendChild(bar);

    const hiddenBy = new Set();
    function sync() {
      const show = hiddenBy.size === 0;
      bar.classList.toggle('is-visible', show);
      bar.setAttribute('aria-hidden', String(!show));
      cta.tabIndex = show ? 0 : -1;
    }

    const watch = [actions, document.getElementById('footer')].filter(Boolean);
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) hiddenBy.add(e.target); else hiddenBy.delete(e.target);
      });
      sync();
    });
    watch.forEach(function (el) { io.observe(el); });
  })();

  // ---- Hero video: attach the 4.4 MB source only after the page has loaded ----
  // The poster paints first; the video never competes with CSS, fonts or
  // images. Skipped on Save-Data, 2G, reduced motion, and on phones that
  // aren't on 4G (effectiveType is a rough estimate, so desktops only bail on 2G).
  (function lazyHeroVideo() {
    const videos = document.querySelectorAll('video[data-src]');
    if (!videos.length) return;
    const conn = navigator.connection;
    const type = (conn && conn.effectiveType) || '';
    const isPhone = window.matchMedia('(max-width: 768px)').matches;
    if (conn && (conn.saveData || /2g$/.test(type) || (isPhone && type === '3g'))) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function attach() {
      videos.forEach(function (video) {
        const source = document.createElement('source');
        source.src = video.dataset.src;
        source.type = 'video/mp4';
        video.appendChild(source);
        video.removeAttribute('data-src');
        video.preload = 'auto';
        video.load();
        const p = video.play();
        if (p && p.catch) p.catch(function () {});
      });
    }
    function schedule() {
      if ('requestIdleCallback' in window) requestIdleCallback(attach, { timeout: 2000 });
      else setTimeout(attach, 200);
    }
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
  })();
})();
