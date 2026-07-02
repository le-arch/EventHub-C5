const { chromium } = require('playwright');
const fs = require('fs');

const BASE = 'http://localhost:3099';
const API = 'http://localhost:8085/api/v1';

const ORG_EMAIL = 'org@test.com';
const ORG_PASS = 'password123';
const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASS = 'password123';

const ORG_EVENT_ID = 'aff2bb56-84d1-4c64-855f-d723d6377330';
const PUBLISHED_EVENT_ID = 'd3727882-0b8e-4c6e-bee6-908c30d26477';
const ORDER_ID = '82084946-9840-4bb3-bb8c-60e4d5834bd3';

const results = [];

function pass(page, msg) { results.push({ page, status: 'PASS', reason: msg }); }
function fail(page, msg) { results.push({ page, status: 'FAIL', reason: msg }); }
function warn(page, msg) { results.push({ page, status: 'WARN', reason: msg }); }

async function loginAndGetToken(email, pass) {
  const resp = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password_hash: pass }),
  });
  const data = await resp.json();
  if (!data.user || !data.user.token) {
    console.error(`Login failed for ${email}:`, JSON.stringify(data));
    return null;
  }
  return { token: data.user.token, refreshToken: data.user.refreshToken, user: data.user };
}

async function setupAuth(page, token, refreshToken) {
  await page.goto(BASE);
  await page.evaluate(({ t, rt }) => {
    localStorage.setItem('access_token', t);
    localStorage.setItem('refresh_token', rt);
  }, { t: token, rt: refreshToken });
}

async function navigateAndCapture(page, url, name) {
  const errors = [];
  let pageLoadError = null;

  const onConsole = (msg) => {
    if (msg.type() === 'error') errors.push(`CONSOLE ERROR: ${msg.text()}`);
  };
  const onPageError = (err) => {
    errors.push(`PAGE ERROR: ${err.message}`);
    pageLoadError = err.message;
  };

  page.on('console', onConsole);
  page.on('pageerror', onPageError);

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
  } catch (err) {
    errors.push(`NAVIGATION ERROR: ${err.message}`);
    pageLoadError = err.message;
  }

  const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  try {
    await page.screenshot({ path: `/tmp/test-screenshots/${safeName}.png`, fullPage: true });
  } catch (e) {
    // ignore screenshot errors
  }

  const text = await page.innerText('body').catch(() => '(empty)');

  page.removeListener('console', onConsole);
  page.removeListener('pageerror', onPageError);

  return { errors, text, pageLoadError };
}

async function testAuthPages(browser) {
  console.log('\n=== AUTH PAGES ===');

  for (const [url, name] of [['/login', 'login'], ['/register', 'register'], ['/forgot-password', 'forgot-password'], ['/verify-otp', 'verify-otp']]) {
    const page = await browser.newPage();
    const { errors, pageLoadError, text } = await navigateAndCapture(page, `${BASE}${url}`, name);
    if (pageLoadError) { fail(url, `Crash: ${pageLoadError}`); }
    else if (errors.length && !errors.every(e => e.includes('404') || e.includes('Failed to load'))) { warn(url, `Console errors: ${errors.length}`); pass(url, 'Renders'); }
    else { pass(url, 'Renders without errors'); }
    await page.close();
  }
}

async function testOrganizerPages(browser, authData) {
  console.log('\n=== ORGANIZER PAGES ===');
  const { token, refreshToken } = authData;

  const pages = [
    ['/organizer/events', 'organizer-events'],
    [`/organizer/events/${ORG_EVENT_ID}`, 'organizer-event-details'],
    ['/organizer/create', 'organizer-create'],
    [`/organizer/attendees/${ORG_EVENT_ID}`, 'organizer-attendees'],
    [`/organizer/checkin/${ORG_EVENT_ID}`, 'organizer-checkin'],
    [`/organizer/analytics/${ORG_EVENT_ID}`, 'organizer-analytics'],
    ['/organizer/settings', 'organizer-settings'],
  ];

  for (const [url, name] of pages) {
    const page = await browser.newPage();
    await setupAuth(page, token, refreshToken);
    const { errors, pageLoadError, text } = await navigateAndCapture(page, `${BASE}${url}`, name);

    const criticalErrors = errors.filter(e => {
      const ignorePatterns = ['404', 'Failed to load resource', '401', '429'];
      return !ignorePatterns.some(p => e.includes(p));
    });

    if (pageLoadError) {
      fail(url, `Page crash: ${pageLoadError}`);
    } else if (criticalErrors.length > 0 && !text.includes('undefine') && !text.includes('TypeError')) {
      fail(url, `Critical errors: ${criticalErrors.join('; ')}`);
    } else if (criticalErrors.length > 0) {
      fail(url, `Console errors: ${criticalErrors.join('; ')}`);
    } else {
      pass(url, 'Renders without errors');
    }

    // Check for undefined/null in rendered text
    if (text.includes('undefined') || text.includes('null') || text.includes('NaN')) {
      warn(url, 'Undefined/null/NaN value detected in rendered content');
    }

    await page.close();
  }
}

async function testPublicPages(browser) {
  console.log('\n=== PUBLIC PAGES ===');

  for (const [url, name] of [
    [`/e/${PUBLISHED_EVENT_ID}`, 'public-event'],
    [`/ticket/${ORDER_ID}`, 'ticket-page'],
  ]) {
    const page = await browser.newPage();
    const { errors, pageLoadError, text } = await navigateAndCapture(page, `${BASE}${url}`, name);
    const criticalErrors = errors.filter(e => !e.includes('404') && !e.includes('Failed to load'));
    if (pageLoadError) { fail(url, `Crash: ${pageLoadError}`); }
    else if (criticalErrors.length) { fail(url, `Errors: ${criticalErrors.join('; ')}`); }
    else { pass(url, 'Renders'); }

    if (text.includes('undefined') || text.includes('NaN')) warn(url, 'Undefined/NaN in content');
    await page.close();
  }
}

async function testAdminPages(browser, authData) {
  console.log('\n=== ADMIN PAGES ===');
  const { token, refreshToken } = authData;

  for (const [url, name] of [
    ['/admin/users', 'admin-users'],
    ['/admin/events', 'admin-events'],
    ['/admin/transactions', 'admin-transactions'],
    ['/admin/logs', 'admin-logs'],
    ['/admin/settings', 'admin-settings'],
  ]) {
    const page = await browser.newPage();
    await setupAuth(page, token, refreshToken);
    const { errors, pageLoadError, text } = await navigateAndCapture(page, `${BASE}${url}`, name);
    const criticalErrors = errors.filter(e => !e.includes('Failed to load'));
    if (pageLoadError) { fail(url, `Crash: ${pageLoadError}`); }
    else if (criticalErrors.length) { fail(url, `Errors: ${criticalErrors.join('; ')}`); }
    else { pass(url, 'Renders'); }

    if (text.includes('undefined') || text.includes('NaN')) warn(url, 'Undefined/NaN in content');
    await page.close();
  }
}

async function testStaticPages(browser) {
  console.log('\n=== STATIC PAGES ===');

  for (const [url, name] of [
    ['/', 'home'], ['/about', 'about'], ['/contact', 'contact'],
    ['/privacy', 'privacy'], ['/terms', 'terms'],
    ['/payment/cancel', 'payment-cancel'], ['/payment/success', 'payment-success'],
    ['/blog', 'blog'],
  ]) {
    const page = await browser.newPage();
    const { errors, pageLoadError, text } = await navigateAndCapture(page, `${BASE}${url}`, name);
    const criticalErrors = errors.filter(e => !e.includes('Failed to load') && !e.includes('404'));
    if (pageLoadError) { fail(url, `Crash: ${pageLoadError}`); }
    else if (criticalErrors.length) { fail(url, `Errors: ${criticalErrors.join('; ')}`); }
    else { pass(url, 'Renders'); }
    if (text.includes('undefined') || text.includes('NaN')) warn(url, 'Undefined/NaN in content');
    await page.close();
  }
}

async function testImageRendering(browser, authData) {
  console.log('\n=== IMAGE RENDERING ===');
  const { token, refreshToken } = authData;
  const page = await browser.newPage();
  await setupAuth(page, token, refreshToken);
  await navigateAndCapture(page, `${BASE}/organizer/events`, 'image-check-events');

  const images = await page.$$('img');
  let brokenCount = 0;
  for (const img of images) {
    const src = await img.getAttribute('src').catch(() => '');
    if (src && !src.startsWith('data:')) {
      const natural = await img.evaluate(el => ({ w: el.naturalWidth, h: el.naturalHeight })).catch(() => ({ w: 0, h: 0 }));
      if (natural.w === 0 && src) brokenCount++;
    }
  }
  if (brokenCount > 0) warn('Image check', `${brokenCount}/${images.length} images appear broken`);
  else pass('Image check', `All ${images.length} images load`);
  await page.close();
}

async function testLoginInteraction(browser) {
  console.log('\n=== LOGIN INTERACTION ===');
  const page = await browser.newPage();
  await navigateAndCapture(page, `${BASE}/login`, 'login-interaction');

  const emailInput = await page.$('input[type="email"], input[name="email"]');
  const passwordInput = await page.$('input[type="password"]');
  const button = await page.$('button[type="submit"], button:has-text("Login")');

  if (emailInput && passwordInput && button) {
    await emailInput.fill(ORG_EMAIL);
    await passwordInput.fill(ORG_PASS);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await button.click();
    await page.waitForTimeout(3000);
    if (errors.length) warn('Login interaction', `Errors during login: ${errors.join('; ')}`);
    else pass('Login interaction', 'Login button triggers action without page errors');
  } else {
    warn('Login interaction', `Form elements found: email=${!!emailInput} pass=${!!passwordInput} btn=${!!button}`);
  }
  await page.close();
}

async function main() {
  fs.mkdirSync('/tmp/test-screenshots', { recursive: true });

  console.log('Authenticating...');
  const orgAuth = await loginAndGetToken(ORG_EMAIL, ORG_PASS);
  const adminAuth = await loginAndGetToken(ADMIN_EMAIL, ADMIN_PASS);
  if (!orgAuth || !adminAuth) { console.error('Auth failed'); process.exit(1); }

  console.log('Launching browser...');
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: '/home/fonyuy-verena/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome'
  });

  try {
    await testAuthPages(browser);
    await testOrganizerPages(browser, orgAuth);
    await testPublicPages(browser);
    await testAdminPages(browser, adminAuth);
    await testStaticPages(browser);
    await testImageRendering(browser, orgAuth);
    await testLoginInteraction(browser);
  } catch (err) {
    console.error(`Suite error: ${err.message}`);
    console.error(err.stack);
  } finally {
    await browser.close();
  }

  // === REPORT ===
  console.log('\n========================================');
  console.log('    FRONTEND COVERAGE REPORT');
  console.log('========================================\n');

  // Group by domain
  const groups = {};
  for (const r of results) {
    const key = r.page.split('/').slice(0, 3).join('/') || r.page;
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  }

  for (const [group, items] of Object.entries(groups)) {
    const worst = items.some(r => r.status === 'FAIL') ? 'FAIL' : items.some(r => r.status === 'WARN') ? 'WARN' : 'PASS';
    const reasons = items.map(r => `[${r.status}] ${r.reason}`).join('; ');
    console.log(`${group}: ${worst}`);
    for (const r of items) {
      console.log(`  ${r.status === 'FAIL' ? '✗' : r.status === 'WARN' ? '⚠' : '✓'} ${r.page}`);
    }
  }

  const passes = results.filter(r => r.status === 'PASS').length;
  const fails = results.filter(r => r.status === 'FAIL').length;
  const warns = results.filter(r => r.status === 'WARN').length;
  console.log(`\nTotal: ${passes} PASS  ${fails} FAIL  ${warns} WARN`);

  console.log('\n--- CRITICAL UI ISSUES ---');
  const crit = results.filter(r => r.status === 'FAIL');
  if (crit.length) crit.forEach(r => console.log(`  ✗ [${r.page}] ${r.reason}`));
  else console.log('  None detected');

  console.log('\n--- DATA BINDING ISSUES ---');
  const dataIssues = results.filter(r => /undefined|TypeError|cannot read|null|NaN/i.test(r.reason));
  if (dataIssues.length) dataIssues.forEach(r => console.log(`  ✗ [${r.page}] ${r.reason}`));
  else console.log('  None detected');

  console.log('\n--- IMAGE / MEDIA ISSUES ---');
  const mediaIssues = results.filter(r => /image|broken|load/i.test(r.reason) && r.status !== 'PASS');
  if (mediaIssues.length) mediaIssues.forEach(r => console.log(`  ${r.status === 'FAIL' ? '✗' : '⚠'} [${r.page}] ${r.reason}`));
  else console.log('  None detected');

  process.exit(fails > 0 ? 1 : 0);
}

main();
