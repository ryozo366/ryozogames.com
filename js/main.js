// ===== RyozoGames - Shared JS =====

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
    });

    // Close nav when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  // Cookie Consent
  showCookieConsent();
});

// Cookie Consent Banner
function showCookieConsent() {
  if (localStorage.getItem('ryozogames_cookies')) return;

  const banner = document.createElement('div');
  banner.id = 'cookieBanner';
  banner.innerHTML = `
    <p>Diese Website verwendet Cookies und LocalStorage, um dein Spielerlebnis zu verbessern.
       <a href="/datenschutz/">Mehr erfahren</a></p>
    <div class="cookie-buttons">
      <button class="cookie-accept" id="cookieAccept">Akzeptieren</button>
      <button class="cookie-reject" id="cookieReject">Nur notwendige</button>
    </div>
  `;
  document.body.appendChild(banner);

  document.getElementById('cookieAccept').addEventListener('click', () => {
    localStorage.setItem('ryozogames_cookies', 'all');
    banner.remove();
  });

  document.getElementById('cookieReject').addEventListener('click', () => {
    localStorage.setItem('ryozogames_cookies', 'necessary');
    banner.remove();
  });
}
