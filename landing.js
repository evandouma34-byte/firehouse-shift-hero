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

  const roleTabs = [...landing.querySelectorAll('.lp-role-selector [role="tab"]')];
  function selectRole(tab) {
    roleTabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
  }
  roleTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectRole(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % roleTabs.length;
      else if (event.key === 'ArrowLeft') next = (index + roleTabs.length - 1) % roleTabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = roleTabs.length - 1;
      else return;
      event.preventDefault();
      selectRole(roleTabs[next]);
      roleTabs[next].focus();
    });
  });

  const backToProject = document.getElementById('backToProject');
  backToProject.addEventListener('click', event => {
    event.preventDefault();
    if (location.hash !== '#project-overview') history.pushState(null, '', '#project-overview');
    document.body.classList.add('landing-active');
    window.scrollTo(0, 0);
    landing.querySelector('h1').focus({ preventScroll: true });
  });

  window.addEventListener('popstate', () => {
    if (location.hash === '#login') {
      if (!login.classList.contains('hidden')) enterApp();
    } else if (!login.classList.contains('hidden')) {
      document.body.classList.add('landing-active');
    }
  });
})();
