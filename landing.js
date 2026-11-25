(() => {
  const landing = document.getElementById('landing');
  const login = document.getElementById('login');

  document.querySelectorAll('.app>header>img').forEach(logo => {
    const lockup = document.createElement('span');
    lockup.className = 'app-header-lockup';
    const divider = document.createElement('span');
    divider.className = 'app-header-divider';
    divider.setAttribute('aria-hidden', 'true');
    divider.textContent = '\u00d7';
    const name = document.createElement('span');
    name.className = 'app-header-name';
    name.textContent = 'Shift Hero';
    lockup.append(divider, name);
    logo.insertAdjacentElement('afterend', lockup);
  });

  function enterApp() {
    document.body.classList.remove('landing-active');
    window.scrollTo(0, 0);
    const email = document.getElementById('u');
    if (email) email.focus({ preventScroll: true });
  }

  if (location.hash === '#login' || login.classList.contains('hidden')) {
    document.body.classList.remove('landing-active');
  }

  landing.querySelectorAll('[data-enter-app]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      if (location.hash !== '#login') history.pushState(null, '', '#login');
      enterApp();
    });
  });

  function setupTabs(tablist) {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    function selectTab(tab) {
      tabs.forEach(item => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
        document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
      });
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectTab(tab));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        selectTab(tabs[next]);
        tabs[next].focus();
      });
    });
  }
  setupTabs(landing.querySelector('.journey-evolution-tabs'));
  setupTabs(landing.querySelector('.journey-product-tabs'));
  const perspectiveTabs = landing.querySelector('.journey-perspective-tabs');
  setupTabs(perspectiveTabs);
  const updatePerspectiveTabOrientation = () => {
    perspectiveTabs.setAttribute('aria-orientation', window.matchMedia('(max-width: 600px)').matches ? 'horizontal' : 'vertical');
  };
  updatePerspectiveTabOrientation();
  window.addEventListener('resize', updatePerspectiveTabOrientation);

  const tracker = landing.querySelector('.journey-tracker');
  const journeyLinks = [...tracker.querySelectorAll('[data-stage]')];
  const journeySections = journeyLinks.map(link => document.getElementById(link.getAttribute('href').slice(1)));
  const fragments = landing.querySelector('.journey-fragments');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const productReveal = landing.querySelector('#journey-iterate');
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    productReveal.classList.add('journey-reveal-enabled');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          productReveal.classList.add('journey-revealed');
          revealObserver.unobserve(productReveal);
        }
      });
    }, { threshold: 0.12 });
    revealObserver.observe(productReveal);
  }
  const discoveryToggles = [...fragments.querySelectorAll('.journey-note-toggle')];
  discoveryToggles.forEach(toggle => {
    const note = toggle.closest('li');
    const details = document.getElementById(toggle.getAttribute('aria-controls'));
    note.addEventListener('click', event => {
      if (!toggle.contains(event.target) && !details.contains(event.target)) toggle.click();
    });
    toggle.addEventListener('click', () => {
      const opening = toggle.getAttribute('aria-expanded') === 'false';
      discoveryToggles.forEach(item => {
        const expanded = item === toggle && opening;
        const details = document.getElementById(item.getAttribute('aria-controls'));
        item.setAttribute('aria-expanded', String(expanded));
        details.setAttribute('aria-hidden', String(!expanded));
        details.inert = !expanded;
      });
      scheduleJourneyUpdate();
    });
  });
  fragments.addEventListener('transitionend', event => {
    if (event.target.classList.contains('journey-note-details') && event.propertyName === 'grid-template-rows') {
      scheduleJourneyUpdate();
    }
  });
  let trackingScheduled = false;
  let previousActive = -1;
  function updateJourney() {
    trackingScheduled = false;
    if (!document.body.classList.contains('landing-active')) return;
    const board = fragments.getBoundingClientRect();
    const organized = Math.max(0, Math.min(1, (window.innerHeight * 0.7 - board.top) / (board.height + window.innerHeight * 0.25)));
    fragments.style.setProperty('--disorder', String(reducedMotion.matches ? 0 : 1 - organized));
    const marker = window.innerHeight * 0.4;
    const positions = journeySections.map(section => section.getBoundingClientRect().top);
    let active = -1;
    positions.forEach((top, index) => {
      if (top <= marker) active = index;
    });
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2 && active >= 0) {
      active = journeySections.length - 1;
    }
    let progress = 0;
    if (active >= 0) {
      const current = positions[active];
      const next = positions[active + 1];
      const fraction = next === undefined ? 0 : Math.max(0, Math.min(1, (marker - current) / (next - current)));
      progress = (active + fraction) / (journeySections.length - 1);
    }
    tracker.style.setProperty('--journey-progress', String(progress));
    journeyLinks.forEach((link, index) => {
      link.parentElement.classList.toggle('is-current', index === active);
      link.parentElement.classList.toggle('is-complete', index < active);
      if (index === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (active !== previousActive && getComputedStyle(tracker).position === 'sticky') {
      const list = tracker.querySelector('ol');
      if (active < 0) {
        list.scrollLeft = 0;
      } else {
        const link = journeyLinks[active];
        const listRect = list.getBoundingClientRect();
        const linkRect = link.getBoundingClientRect();
        if (linkRect.left < listRect.left || linkRect.right > listRect.right) {
          list.scrollLeft += linkRect.left - listRect.left - (list.clientWidth - linkRect.width) / 2;
        }
      }
    }
    previousActive = active;
  }
  function scheduleJourneyUpdate() {
    if (!trackingScheduled) {
      trackingScheduled = true;
      requestAnimationFrame(updateJourney);
    }
  }
  window.addEventListener('scroll', scheduleJourneyUpdate, { passive: true });
  window.addEventListener('resize', scheduleJourneyUpdate);
  reducedMotion.addEventListener('change', scheduleJourneyUpdate);
  scheduleJourneyUpdate();

  const backToProject = document.getElementById('backToProject');
  backToProject.addEventListener('click', event => {
    event.preventDefault();
    if (location.hash !== '#project-overview') history.pushState(null, '', '#project-overview');
    document.body.classList.add('landing-active');
    window.scrollTo(0, 0);
    landing.querySelector('h1').focus({ preventScroll: true });
    scheduleJourneyUpdate();
  });

  window.addEventListener('popstate', () => {
    if (location.hash === '#login') {
      if (!login.classList.contains('hidden')) enterApp();
    } else if (!login.classList.contains('hidden')) {
      document.body.classList.add('landing-active');
      scheduleJourneyUpdate();
    }
  });
})();
