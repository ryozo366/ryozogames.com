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
    <p>This website uses cookies and LocalStorage to improve your gaming experience.
       <a href="/datenschutz/">Learn more</a></p>
    <div class="cookie-buttons">
      <button class="cookie-accept" id="cookieAccept">Accept</button>
      <button class="cookie-reject" id="cookieReject">Essential only</button>
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
