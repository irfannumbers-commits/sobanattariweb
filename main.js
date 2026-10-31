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

  // ---- Upcoming events: when each one ENDS (Pakistan time, +05:00) ----
  // Once that moment passes, every card linking to the event (Updates page,
  // "More Upcoming Events" strips, course spotlights) is removed on page
  // load and the remaining cards close up. Add a line here for every new
  // event; events without an entry (e.g. dates not announced yet) never expire.
  const EVENT_ENDS = {
    '/events/females-session-oct-2026/':    '2026-11-06T23:00:00+05:00',
    'https://forms.gle/Vp3K99RhSAoMdHGQ8':   '2026-10-21T23:00:00+05:00'
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

  (function removeEndedEvents() {
    const now = Date.now();
    const ended = Object.keys(EVENT_ENDS).filter(function (path) {
      return Date.parse(EVENT_ENDS[path]) <= now;
    });
    const grids = new Set();

    document.querySelectorAll('[data-event-end]').forEach(function (card) {
      if (Date.parse(card.dataset.eventEnd) <= now) {
        if (card.parentElement) grids.add(card.parentElement);
        card.remove();
      }
    });

    ended.forEach(function (path) {
      // Plain event cards are the link itself; a course spotlight holds the
      // link inside it, and may sit in a wrapper that only exists for it.
      document.querySelectorAll('a.event-teaser-link[href="' + path + '"]').forEach(function (card) {
        if (card.parentElement) grids.add(card.parentElement);
        card.remove();
      });
      document.querySelectorAll('.course-spotlight-media[href="' + path + '"]').forEach(function (link) {
        const card = link.closest('.course-spotlight');
        const wrap = card.closest('[data-event-wrap]');
        if (card.parentElement) grids.add(card.parentElement);
        (wrap || card).remove();
      });
    });

    // Close up the grids that lost cards
    grids.forEach(function (grid) {
      if (!grid.classList.contains('event-teasers') || !document.contains(grid)) return;
      const left = grid.children.length;
      if (left === 0) {
        if (grid.closest('.updates-section')) {
          grid.outerHTML = '<p class="updates-empty">No upcoming events right now &mdash; check back soon.</p>';
        } else {
          // "More Upcoming Events" strip with nothing left to show
          const section = grid.closest('section');
          if (section) section.remove();
        }
      } else if (left === 1) {
        grid.classList.remove('event-teasers-2up');
        grid.classList.add('event-teasers-1up');
      } else if (left === 2 && !grid.classList.contains('event-teasers-1up')) {
        grid.classList.add('event-teasers-2up');
      }
    });

    // e.g. "1 upcoming · 9 coming soon" — cards with no date yet are "coming soon"
    const cards = document.querySelectorAll('.updates-section .event-teasers > *');
    const soon = document.querySelectorAll('.updates-section .event-teasers > .is-disabled, .updates-section .event-teasers > .is-soon').length;
    const upcoming = cards.length - soon;
    const parts = [];
    if (upcoming) parts.push(upcoming + ' upcoming');
    if (soon) parts.push(soon + ' coming soon');
    document.querySelectorAll('[data-upcoming-count]').forEach(function (el) {
      el.textContent = parts.join(' \u00b7 ') || 'No upcoming events';
    });
  })();


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

    // A shared link to /#book-session opens the popup straight away
    if (location.hash === '#book-session') openModal();
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
              <span class="channels-info"><b>${c.name}</b><small>${c.count} ${cfg.unit || 'followers'}</small></span>
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
    unit: 'subscribers',
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
      // A video that was still loading also has its spinner thumbnail on top
      const loading = iframe.parentElement && iframe.parentElement.querySelector('.yt-facade.is-loading');
      if (loading) loading.remove();
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

    // The thumbnail stays on top with a spinner while the player loads
    // underneath (on a slow network that's otherwise a blank black box), and
    // fades away once YouTube reports the video is playing. If autoplay is
    // blocked it never reports "playing", so the player is revealed shortly
    // after it has loaded and the visitor can press its own play button.
    const YT_ORIGIN = 'https://www.youtube.com';
    const YT_REVEAL_FALLBACK_MS = 2500;

    function playYtFacade(facade) {
      if (facade.classList.contains('is-loading')) return;
      warmYtConnections();
      document.querySelectorAll('.yt-facade-iframe').forEach(stopYtVideo);
      const id = facade.dataset.ytId;
      const title = facade.dataset.ytTitle;
      const iframe = document.createElement('iframe');
      iframe.className = 'yt-facade-iframe';
      iframe.dataset.ytId = id;
      iframe.dataset.ytTitle = title;
      iframe.src = `${YT_ORIGIN}/embed/${id}?autoplay=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
      iframe.title = title;
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';

      facade.classList.add('is-loading');
      facade.setAttribute('aria-busy', 'true');
      facade.setAttribute('aria-label', 'Loading video: ' + title);
      facade.insertAdjacentHTML('beforeend', '<span class="yt-facade-spinner" aria-hidden="true"></span>');
      facade.before(iframe);

      let revealed = false;
      let fallbackTimer = null;
      function reveal() {
        if (revealed) return;
        revealed = true;
        clearTimeout(fallbackTimer);
        window.removeEventListener('message', onMessage);
        if (!facade.isConnected) return;
        facade.classList.add('is-revealing');
        facade.addEventListener('transitionend', function () { facade.remove(); }, { once: true });
        setTimeout(function () { facade.remove(); }, 600); // in case transitions are off
      }
      function onMessage(e) {
        if (e.origin !== YT_ORIGIN || e.source !== iframe.contentWindow) return;
        let data;
        try { data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (err) { return; }
        const state = data && (data.event === 'onStateChange' ? data.info : data.info && data.info.playerState);
        if (state === 1) reveal(); // 1 = playing
      }
      window.addEventListener('message', onMessage);
      iframe.addEventListener('load', function () {
        // Ask the player to post its state changes back to this page
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: id }), YT_ORIGIN);
        fallbackTimer = setTimeout(reveal, YT_REVEAL_FALLBACK_MS);
      }, { once: true });
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
    // Event and course detail pages keep the screen for their sticky Register / Directions bar
    if (location.pathname.indexOf('/events/') === 0 || document.querySelector('.event-hero-actions')) return;
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
    // Every page: also step aside at the footer, so it never covers the
    // footer's own links or the last lines of text on a phone.
    const hero = document.getElementById('hero');
    const footer = document.getElementById('footer');
    let heroVisible = false;
    let footerVisible = false;
    function syncHidden() {
      const hidden = heroVisible || footerVisible;
      wrap.classList.toggle('is-hidden', hidden);
      if (hidden) { close(); hideHint(); } else scheduleHint();
    }
    if ('IntersectionObserver' in window) {
      if (hero) {
        heroVisible = true;
        wrap.classList.add('is-hidden');
        new IntersectionObserver(function (entries) {
          heroVisible = entries[0].intersectionRatio >= 0.35;
          syncHidden();
        }, { threshold: [0, 0.35] }).observe(hero);
      } else {
        scheduleHint();
      }
      if (footer) {
        new IntersectionObserver(function (entries) {
          footerVisible = entries[0].isIntersecting;
          syncHidden();
        }).observe(footer);
      }
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

  // ---- Hero video: always plays, with a loader while it buffers ----
  // The poster (preloaded) paints instantly; the video starts streaming right
  // away on every connection (the MP4 is faststart, so it plays while it
  // downloads). A slim gold bar + "Loading video" chip sit over the poster
  // until the first frame plays, and come back if playback stalls to buffer.
  // Only skipped for people who turned on "reduce motion" in their OS.
  (function heroVideo() {
    const videos = document.querySelectorAll('video[data-src]');
    if (!videos.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    videos.forEach(function (video) {
      const host = video.parentElement;
      const loader = document.createElement('div');
      loader.className = 'video-loader';
      loader.setAttribute('aria-hidden', 'true');
      loader.innerHTML =
        '<span class="video-loader-chip"><span class="video-loader-ring"></span>Loading video</span>' +
        '<span class="video-loader-bar"></span>';
      host.appendChild(loader);

      // The loader only appears if the wait is long enough to notice — on a
      // good connection the video starts first and the loader never flashes.
      // Once shown it stays at least 700ms, so it never blinks on and off.
      let showTimer = null;
      let shownAt = 0;
      function showLoaderSoon(delay) {
        clearTimeout(showTimer);
        showTimer = setTimeout(function () {
          shownAt = Date.now();
          loader.classList.add('is-active');
        }, delay);
      }
      function hideLoader() {
        clearTimeout(showTimer);
        if (!loader.classList.contains('is-active')) return;
        showTimer = setTimeout(function () {
          loader.classList.remove('is-active');
        }, Math.max(0, 700 - (Date.now() - shownAt)));
      }

      video.addEventListener('playing', function () {
        hideLoader();
        host.classList.add('video-ready');
      });
      // brief stalls are normal; only show the loader if one lasts
      video.addEventListener('waiting', function () { showLoaderSoon(800); });
      video.addEventListener('error', hideLoader, true);

      let retryArmed = false;
      function play() {
        const p = video.play();
        if (p && p.catch) {
          p.catch(function () {
            // autoplay refused (e.g. iOS Low Power Mode): keep the poster,
            // drop the loader, and start on the visitor's first interaction
            hideLoader();
            if (retryArmed) return;
            retryArmed = true;
            const types = ['pointerdown', 'touchstart', 'keydown'];
            function retry() {
              types.forEach(function (t) { window.removeEventListener(t, retry); });
              retryArmed = false;
              play();
            }
            types.forEach(function (t) { window.addEventListener(t, retry, { passive: true }); });
          });
        }
      }

      function start() {
        const source = document.createElement('source');
        source.src = video.dataset.src;
        source.type = 'video/mp4';
        video.appendChild(source);
        video.removeAttribute('data-src');
        video.preload = 'auto';
        video.load();
        showLoaderSoon(600);
        play();
      }
      // Let the headline fonts land first (they're small) so the video never
      // delays them on a slow line; capped so the video is never held back long.
      let started = false;
      function startOnce() { if (!started) { started = true; start(); } }
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(startOnce);
      setTimeout(startOnce, 1200);

      // pause while scrolled out of view — saves battery and data on phones
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          if (!started) return;
          if (entries[0].isIntersecting) { if (video.paused) play(); }
          else if (!video.paused) video.pause();
        }).observe(host);
      }
    });
  })();

  // ---- Image loading: shimmer skeleton, then a soft fade-in ----
  // Images that aren't loaded yet get a shimmering placeholder in their box
  // (tinted for light or dark cards) instead of a flat empty block. Images
  // already in the cache skip all of this, so nothing flickers on revisit.
  (function imageSkeletons() {
    function isDark(el) {
      while (el && el !== document.documentElement) {
        const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
        if (m && (m[3] === undefined || +m[3] > 0.5)) return (+m[0] * 299 + +m[1] * 587 + +m[2] * 114) / 1000 < 128;
        el = el.parentElement;
      }
      return false;
    }
    function addSkeleton(host) {
      const sk = document.createElement('span');
      sk.className = 'img-skeleton' + (isDark(host) ? ' img-skeleton-dark' : '');
      sk.setAttribute('aria-hidden', 'true');
      host.classList.add('img-skeleton-host');
      host.insertBefore(sk, host.firstChild);
      return sk;
    }
    function done(sk, img) {
      if (img) img.classList.add('img-reveal');
      sk.classList.add('is-done');
      setTimeout(function () { sk.remove(); }, 600);
    }

    document.querySelectorAll('img').forEach(function (img) {
      if (img.complete && img.naturalWidth) return;
      if (img.closest('footer, nav, .navbar, .nav-mobile, [data-no-skeleton]')) return;
      const host = img.parentElement;
      // the blurred backdrop + sharp foreground pairs share one skeleton
      if (host.querySelector(':scope > .img-skeleton')) {
        img.addEventListener('load', function () { img.classList.add('img-reveal'); }, { once: true });
        return;
      }
      const sk = addSkeleton(host);
      img.addEventListener('load', function () { done(sk, img); }, { once: true });
      img.addEventListener('error', function () { done(sk); }, { once: true });
    });

    // cards that paint their photo as an inline background-image
    document.querySelectorAll('[style*="background-image"]').forEach(function (el) {
      const m = el.style.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
      if (!m) return;
      const probe = new Image();
      probe.src = m[1];
      if (probe.complete && probe.naturalWidth) return;
      const sk = addSkeleton(el);
      probe.onload = probe.onerror = function () { done(sk); };
    });
  })();
  // ---- Home page: floating event cards ----
  // Each event below floats as its own ticket-shaped card on the home page,
  // SHOW_DELAY_MS after the page opens, stacked at the bottom-left (desktop)
  // or bottom of the screen (phones). You decide exactly when each one shows:
  //   showFrom  → first moment it may appear   (Pakistan time, +05:00)
  //   showUntil → it disappears from this moment on
  // Outside that window the card is simply not shown. Remove an entry (or
  // set showUntil in the past) to stop showing it.
  //   start → the event's own start time; drives the date on the card and
  //           the "In 3 days" / "Tomorrow" / "Today" chip, which is worked
  //           out live from the visitor's current date (Pakistan calendar
  //           days) up to the event date.
  //   theme → colour scheme: 'gold' or 'rose' (add more in styles.css,
  //           see "Floating event cards — themes").
  //   icon  → big stub icon: 'mic', 'woman', 'hijab', 'laptop', 'users' — or any
  //           emoji (e.g. '🧕'), shown in full colour on a white circle
  //   meta  → short facts with icons ('clock', 'pin', 'laptop', 'users', 'ticket')
  //   href  → where tapping the card itself goes
  // The cards appear on every visit to the home page (after the delay).
  // Visitors hide a card with ✕, Esc, or by swiping it sideways — for that
  // page view only. Once all are hidden, a small round button (bottom-left)
  // brings them back.
  // Testing: add ?events-preview to the URL to ignore the time windows and
  // the delay.
  const FLOAT_EVENTS = [
    {
      id: 'females-session-nov-2026',
      showFrom:  '2026-11-01T00:00:00+05:00',
      showUntil: '2026-11-06T21:00:00+05:00',
      start:     '2026-11-06T21:00:00+05:00',
      theme: 'rose',
      icon: 'hijab',
      title: 'Online Females Session',
      meta: [{ icon: 'clock', text: 'Fri 9:00 PM' }, { icon: 'laptop', text: 'Online' }],
      note: 'For women · Join from home · Free',
      href: '/events/females-session-oct-2026/',
      primary: { label: 'Register', href: 'https://forms.gle/DYNALWJ3yo8Tnk9N9', external: true },
      secondary: { label: 'Details', href: '/events/females-session-oct-2026/' }
    }
  ];
  const SHOW_DELAY_MS = 4000;

  (function setupFloatingEvents() {
    const path = location.pathname;
    if (path !== '/' && path !== '/index.html') return;

    const preview = /[?&]events-preview\b/.test(location.search);
    const now = Date.now();
    const eligible = FLOAT_EVENTS.filter(function (ev) {
      return preview || (Date.parse(ev.showFrom) <= now && now < Date.parse(ev.showUntil));
    });
    if (!eligible.length) return;

    // ---- icons (stroke, 24×24) ----
    const ICONS = {
      mic: '<rect x="9" y="2.5" width="6" height="11.5" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>',
      woman: '<circle cx="12" cy="5" r="2.6"/><path d="M9.3 9.6h5.4l3.1 7.6H6.2z"/><path d="M10.4 17.2v4M13.6 17.2v4"/>',
      laptop: '<rect x="4" y="5" width="16" height="11" rx="1.6"/><path d="M2.5 19h19"/>',
      users: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19.5c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="16.8" cy="9" r="2.5"/><path d="M15.8 14.6c2.3.2 4 1.8 4.6 4.4"/>',
      clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
      pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
      ticket: '<path d="M3.5 8V6.5h17V8a2.5 2.5 0 0 0 0 5v1.5h-17V13a2.5 2.5 0 0 0 0-5z"/>',
      close: '<path d="M6 6l12 12M18 6L6 18"/>'
    };
    // Filled icons (whole SVGs, coloured with currentColor). The hijab's
    // face and folds are cut out with a mask, so the stub colour shows through.
    let hijabMaskN = 0;
    const FILLED_ICONS = {
      hijab: function (size) {
        const id = 'evf-hijab-cut-' + (++hijabMaskN);
        return '<svg viewBox="40 20 620 670" width="' + size + '" height="' + size + '" aria-hidden="true">' +
          '<defs><mask id="' + id + '" maskUnits="userSpaceOnUse" x="40" y="20" width="620" height="670">' +
            '<path fill="#fff" d="M232 150 C 245 70 300 36 365 36 C 432 36 488 72 505 150 L 628 535 C 634 552 626 562 610 566 L 330 664 C 300 674 280 670 258 660 L 78 562 C 62 552 60 540 68 528 Z"/>' +
            '<g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round">' +
              '<path stroke-width="23" d="M247 272 C 247 196 282 152 322 141 Q 360 124 398 141 C 440 152 476 196 476 272 C 476 360 424 410 361 410 C 298 410 247 360 247 272 Z"/>' +
              '<path stroke-width="20" d="M210 345 C 216 430 270 482 352 486 C 420 488 470 448 492 345"/>' +
              '<path stroke-width="20" d="M214 410 C 238 500 300 540 362 543 C 410 545 448 528 474 508"/>' +
              '<path stroke-width="13" d="M404 492 L 516 456"/>' +
              '<path stroke-width="17" d="M196 512 C 204 572 222 622 240 652"/>' +
            '</g>' +
          '</mask></defs>' +
          '<rect x="40" y="20" width="620" height="670" fill="currentColor" mask="url(#' + id + ')"/>' +
        '</svg>';
      }
    };

    function icon(name, size, cls) {
      return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
    }

    // ---- small helpers ----
    function pkPart(iso, opts) {
      return new Intl.DateTimeFormat('en-GB', Object.assign({ timeZone: 'Asia/Karachi' }, opts)).format(new Date(iso));
    }
    function countdown(startIso) {
      const pkDay = function (t) { return Math.floor((t + 5 * 3600000) / 86400000); };
      const start = Date.parse(startIso);
      const diff = pkDay(start) - pkDay(Date.now());
      if (start <= Date.now()) return 'Now';
      if (diff <= 0) return 'Today';
      if (diff === 1) return 'Tomorrow';
      return 'In ' + diff + ' days';
    }
    function esc(s) {
      return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
    }
    function link(a, cls) {
      const ext = a.external ? ' target="_blank" rel="noopener"' : '';
      return '<a class="' + cls + '" href="' + esc(a.href) + '"' + ext + '>' + esc(a.label) +
        (a.external ? '<span class="evf-sr"> (opens in a new tab)</span>' : '') + '</a>';
    }

    function cardHtml(ev) {
      const tid = 'evf-t-' + ev.id;
      const meta = (ev.meta || []).map(function (m, i) {
        return '<span class="evf-fact' + (i === 0 ? ' evf-fact-keep' : '') + '">' + icon(m.icon, 14) + '<span>' + esc(m.text) + '</span></span>';
      }).join('');
      return '<article class="evf-item" data-id="' + esc(ev.id) + '" data-theme="' + esc(ev.theme || 'gold') + '"' +
          (ev.href ? ' data-href="' + esc(ev.href) + '"' : '') + ' aria-labelledby="' + tid + '">' +
        '<div class="evf-ticket">' +
          '<div class="evf-stub" aria-hidden="true">' +
            (FILLED_ICONS[ev.icon]
              ? '<span class="evf-stub-icon">' + FILLED_ICONS[ev.icon](30) + '</span>'
              : ICONS[ev.icon || 'ticket']
              ? '<span class="evf-stub-icon">' + icon(ev.icon || 'ticket', 26) + '</span>'
              : '<span class="evf-stub-icon is-emoji"><span class="evf-emoji">' + esc(ev.icon) + '</span></span>') +
            '<span class="evf-day">' + pkPart(ev.start, { day: 'numeric' }) + '</span>' +
            '<span class="evf-month">' + pkPart(ev.start, { month: 'short' }) + '</span>' +
          '</div>' +
          '<div class="evf-body">' +
            '<div class="evf-head">' +
              '<h3 class="evf-title" id="' + tid + '">' + esc(ev.title) + '</h3>' +
              '<button type="button" class="evf-close" aria-label="Hide ' + esc(ev.title) + '">' + icon('close', 15) + '</button>' +
            '</div>' +
            '<p class="evf-meta"><span class="evf-chip" data-start="' + esc(ev.start) + '">' + countdown(ev.start) + '</span>' +
              '<span class="evf-sr">' + pkPart(ev.start, { weekday: 'long', day: 'numeric', month: 'long' }) + ', </span>' + meta + '</p>' +
            (ev.note ? '<p class="evf-note">' + esc(ev.note) + '</p>' : '') +
            '<div class="evf-actions">' + link(ev.primary, 'evf-btn') + (ev.secondary ? link(ev.secondary, 'evf-link') : '') + '</div>' +
          '</div>' +
        '</div>' +
      '</article>';
    }

    // ---- DOM: dock (stack of cards) and the launcher button ----
    const dock = document.createElement('aside');
    dock.className = 'evf-dock';
    dock.setAttribute('aria-label', 'Upcoming events');
    dock.hidden = true;

    const launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'evf-launcher';
    launcher.hidden = true;
    launcher.setAttribute('aria-label', 'Show upcoming events (' + eligible.length + ')');
    launcher.innerHTML = icon('ticket', 22) + '<span class="evf-badge" aria-hidden="true">' + eligible.length + '</span>';

    document.body.appendChild(dock);
    document.body.appendChild(launcher);

    // Launcher stays tucked away while the hero (which has its own events
    // button) fills the screen — same rule as the contact button.
    const heroEl = document.getElementById('hero');
    if (heroEl && 'IntersectionObserver' in window) {
      launcher.classList.add('is-tucked');
      new IntersectionObserver(function (entries) {
        launcher.classList.toggle('is-tucked', entries[0].intersectionRatio >= 0.35);
      }, { threshold: [0, 0.35] }).observe(heroEl);
    }

    // ---- show / hide ----
    function showCards(list) {
      if (!list.length) { launcher.hidden = false; return; }
      dock.innerHTML = list.map(cardHtml).join('');
      launcher.hidden = true;
      dock.hidden = false;
      document.documentElement.classList.add('evf-active');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { dock.classList.add('is-in'); });
      });
    }

    // Keep the "In 3 days" chips right if the page stays open past midnight
    setInterval(function () {
      dock.querySelectorAll('.evf-chip[data-start]').forEach(function (chip) {
        chip.textContent = countdown(chip.dataset.start);
      });
    }, 60000);

    function dismiss(item, dir) {
      if (!item || item.classList.contains('is-leaving')) return;
      const hadFocus = item.contains(document.activeElement);
      item.style.transform = '';
      item.style.opacity = '';
      item.classList.add('is-leaving', dir === 'left' ? 'to-left' : 'to-right');
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setTimeout(function () {
        const next = item.nextElementSibling || item.previousElementSibling;
        item.remove();
        if (!dock.children.length) {
          dock.classList.remove('is-in');
          dock.hidden = true;
          document.documentElement.classList.remove('evf-active');
          launcher.hidden = false;
          return;
        }
        const btn = next && next.querySelector('.evf-close');
        if (hadFocus && btn) btn.focus({ preventScroll: true });
      }, reduce ? 0 : 300);
    }

    // Tap ✕ to hide; tap anywhere else on the card (not a link) to open it.
    dock.addEventListener('click', function (e) {
      const item = e.target.closest('.evf-item');
      if (!item) return;
      if (e.target.closest('.evf-close')) { dismiss(item); return; }
      if (e.target.closest('a')) return;
      if (item.dataset.href && !item.dataset.swiped) location.href = item.dataset.href;
    });
    dock.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') dismiss(e.target.closest('.evf-item'));
    });

    // Swipe a card sideways to hide it (like dismissing a notification).
    let sw = null;
    dock.addEventListener('touchstart', function (e) {
      const item = e.target.closest('.evf-item');
      if (!item || e.touches.length !== 1) return;
      delete item.dataset.swiped;
      sw = { item: item, x: e.touches[0].clientX, y: e.touches[0].clientY, dx: 0, horizontal: null };
    }, { passive: true });
    dock.addEventListener('touchmove', function (e) {
      if (!sw) return;
      const dx = e.touches[0].clientX - sw.x;
      const dy = e.touches[0].clientY - sw.y;
      if (sw.horizontal === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) sw.horizontal = Math.abs(dx) > Math.abs(dy);
      if (!sw.horizontal) return;
      e.preventDefault();
      sw.dx = dx;
      sw.item.dataset.swiped = '1';
      sw.item.classList.add('is-dragging');
      sw.item.style.transform = 'translateX(' + dx + 'px) rotate(' + (dx / 40) + 'deg)';
      sw.item.style.opacity = String(Math.max(0.3, 1 - Math.abs(dx) / 260));
    }, { passive: false });
    dock.addEventListener('touchend', function () {
      if (!sw) return;
      const s = sw; sw = null;
      s.item.classList.remove('is-dragging');
      if (!s.horizontal) return;
      if (Math.abs(s.dx) > 70) { dismiss(s.item, s.dx < 0 ? 'left' : 'right'); return; }
      s.item.style.transform = '';
      s.item.style.opacity = '';
      setTimeout(function () { delete s.item.dataset.swiped; }, 50);
    });

    launcher.addEventListener('click', function () {
      showCards(eligible);
      const first = dock.querySelector('.evf-close');
      if (first) first.focus({ preventScroll: true });
    });

    // Wait SHOW_DELAY_MS of the page actually being on screen, then float in.
    // Never on top of the Terms dialog.
    function whenReady() {
      if (document.hidden) {
        document.addEventListener('visibilitychange', function again() {
          if (document.hidden) return;
          document.removeEventListener('visibilitychange', again);
          setTimeout(whenReady, 1500);
        });
        return;
      }
      if (document.querySelector('.terms-modal-overlay')) { setTimeout(whenReady, 4000); return; }
      showCards(eligible);
    }
    setTimeout(whenReady, preview ? 600 : SHOW_DELAY_MS);
  })();

})();