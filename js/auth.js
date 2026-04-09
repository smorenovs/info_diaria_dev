/* VS Ingeniería — Auth (client-side, static site) */

const USERS = {
  'adrian':   '4ca8f3f82873789b65f34c3e6a1dc5e3c7bab94c2e995c45358ece778288df7a',
  'santiago': '4ca8f3f82873789b65f34c3e6a1dc5e3c7bab94c2e995c45358ece778288df7a',
  'pablo': '4ca8f3f82873789b65f34c3e6a1dc5e3c7bab94c2e995c45358ece778288df7a'
};

const SESSION_KEY = 'vs_auth_user';

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getSession() {
  return sessionStorage.getItem(SESSION_KEY);
}

function setSession(username) {
  sessionStorage.setItem(SESSION_KEY, username);
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

async function attemptLogin(username, password) {
  const hash = await sha256(password);
  const stored = USERS[username.toLowerCase().trim()];
  if (stored && stored === hash) {
    setSession(username.toLowerCase().trim());
    return true;
  }
  return false;
}

/* ─── Overlay de login ───────────────────────────────────────── */
function buildLoginOverlay() {
  const div = document.createElement('div');
  div.id = 'login-overlay';
  div.innerHTML = `
    <div class="login-box">
      <div class="login-logo">
        <img src="assets/media/logo_vs.png" alt="VS" class="topbar-logo-img" style="width:250px;height:250px;object-fit:contain;margin-bottom:var(--space-3);">
      </div>
      <div></div>
      <div class="login-subtitle">Estado del Equipo de Desarrollo</div>
      <form id="login-form" autocomplete="off">
        <div class="login-field">
          <label class="label" for="login-user">Usuario</label>
          <input class="input" type="text" id="login-user" autocomplete="username"
                 placeholder="Tu usuario" spellcheck="false">
        </div>
        <div class="login-field">
          <label class="label" for="login-pass">Contraseña</label>
          <input class="input" type="password" id="login-pass" autocomplete="current-password"
                 placeholder="••••••••">
        </div>
        <div id="login-error" class="login-error" hidden>Usuario o contraseña incorrectos</div>
        <button type="submit" class="btn btn-primary" style="width:100%;margin-top:var(--space-3);">
          Ingresar
        </button>
      </form>
    </div>`;
  return div;
}

function showLoginOverlay(onSuccess) {
  const overlay = buildLoginOverlay();
  document.body.appendChild(overlay);
  // Forzar visibilidad total: ocultar el resto del contenido
  document.body.classList.add('auth-locked');

  const form    = overlay.querySelector('#login-form');
  const errEl   = overlay.querySelector('#login-error');
  const userEl  = overlay.querySelector('#login-user');
  const passEl  = overlay.querySelector('#login-pass');

  userEl.focus();

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errEl.hidden = true;
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Verificando…';

    const ok = await attemptLogin(userEl.value, passEl.value);
    if (ok) {
      overlay.classList.add('login-out');
      document.body.classList.remove('auth-locked');
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
      onSuccess();
    } else {
      errEl.hidden = false;
      passEl.value = '';
      passEl.focus();
      btn.disabled = false;
      btn.textContent = 'Ingresar';
    }
  });
}

/* ─── Punto de entrada ───────────────────────────────────────── */
function requireAuth(onReady) {
  if (getSession()) {
    onReady();
  } else {
    // Esperar a que el DOM esté listo para insertar el overlay
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => showLoginOverlay(onReady));
    } else {
      showLoginOverlay(onReady);
    }
  }
}
