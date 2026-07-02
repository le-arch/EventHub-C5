import { chromium } from 'playwright';
import { setTimeout } from 'timers/promises';
import fs from 'fs';

const BASE = 'http://localhost:3000';
const API_BASE = 'http://localhost:8085/api/v1';
const TEST_EMAIL = 'testflow@eventhub.test';
const TEST_PASS = 'TestPass123!';
const TEST_PHONE = '670000004';

let browser, page;
const logs = [];
let eventId = null;
let ticketTypeId = null;
let orderId = null;
let qrHash = null;

function log(msg, type = 'INFO') {
  const entry = `[${type}] ${msg}`;
  logs.push(entry);
  console.log(entry);
}

async function waitForResponse(page, urlMatch, timeoutMs = 12000) {
  try {
    const resp = await page.waitForResponse(
      r => r.url().includes(urlMatch) && r.status() < 500,
      { timeout: timeoutMs }
    );
    let body = null;
    try { body = await resp.json(); } catch(e) {}
    return { status: resp.status(), ok: resp.ok(), body, url: resp.url() };
  } catch (e) {
    return { status: 0, ok: false, body: null, error: e.message.slice(0, 100) };
  }
}

async function run() {
  browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'en-CM'
  });
  page = await context.newPage();
  page.setDefaultTimeout(12000);

  // Collect API calls
  const apiCalls = [];
  page.on('response', resp => {
    if (resp.url().includes(API_BASE)) {
      apiCalls.push({
        url: resp.url().replace(API_BASE, ''),
        status: resp.status(),
        method: resp.request().method()
      });
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') log(`Console Error: ${msg.text()}`, 'CONSOLE');
  });
  page.on('pageerror', err => log(`Page Error: ${err.message}`, 'PAGE_ERROR'));

  // ==========================================================
  // 1. LOGIN (user already exists in DB)
  // ==========================================================
  log('=== 1. LOGIN ===');
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });

  await page.fill('input[name="identifier"]', TEST_EMAIL);
  await page.fill('input[name="password"]', TEST_PASS);

  const [loginResp] = await Promise.all([
    waitForResponse(page, '/auth/login'),
    page.click('button[type="submit"]')
  ]);
  log(`Login API: ${loginResp.status} ${loginResp.ok ? 'OK' : 'FAIL'}`);

  // Wait for redirect to organizer dashboard
  await setTimeout(3000);
  log(`After login URL: ${page.url()}`);

  // Save auth token
  const token = await page.evaluate(() => localStorage.getItem('access_token'));
  log(`Token obtained: ${token ? 'yes (' + token.slice(0, 20) + '...)' : 'NO'}`);

  if (!token) {
    log('No auth token - cannot proceed', 'FAIL');
    await browser.close();
    fs.writeFileSync('/tmp/interact-results.json', JSON.stringify({ failures: ['No auth token'], logs, apiCalls }, null, 2));
    return;
  }

  // ==========================================================
  // 3. CREATE EVENT
  // ==========================================================
  log('=== 3. CREATE EVENT ===');
  await page.goto(`${BASE}/organizer/create`, { waitUntil: 'networkidle' });
  await setTimeout(2000);

  const eventTitle = `Test Event ${Date.now()}`;
  await page.fill('#title', eventTitle);
  await page.fill('#description', 'A test event for automated testing of the EventHub platform');
  await page.fill('#venue', 'Test Venue Center');

  // City selector - try to find select or combobox
  const cityField = page.locator('#city, [name="city"], select');
  if (await cityField.count() > 0) {
    const tag = await cityField.evaluate(el => el.tagName.toLowerCase());
    if (tag === 'select') {
      await cityField.selectOption({ index: 1 });
    } else {
      await cityField.fill('Yaounde');
    }
  }

  // Date/time fields
  const futureDate = new Date(Date.now() + 86400000 * 60);
  const dateStr = futureDate.toISOString().split('T')[0];
  await page.fill('input[type="date"]', dateStr);
  await page.fill('input[type="time"]', '10:00');
  // second time field is end time
  const timeInputs = page.locator('input[type="time"]');
  if (await timeInputs.count() > 1) await timeInputs.nth(1).fill('18:00');

  await page.fill('#capacityMin, [name="capacityMin"]', '50');
  await page.fill('#capacityMax, [name="capacityMax"]', '500');

  // Continue to ticket types
  await page.click('button:has-text("Continue to Ticket Types")');
  await setTimeout(2000);

  // Fill ticket types
  const ticketNameInputs = page.locator('input[name$=".name"]');
  if (await ticketNameInputs.count() > 0) {
    await ticketNameInputs.nth(0).fill('General Admission');
    await page.fill('input[name$=".price"]', '5000');
    await page.fill('input[name$=".quantityAvailable"]', '100');
  }

  // Add another ticket type
  const addBtn = page.locator('button:has-text("Add Another Ticket Type")');
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await setTimeout(500);
    const allNames = page.locator('input[name$=".name"]');
    if (await allNames.count() > 1) {
      await allNames.nth(1).fill('VIP');
      const allPrices = page.locator('input[name$=".price"]');
      if (await allPrices.count() > 1) await allPrices.nth(1).fill('15000');
      const allQtys = page.locator('input[name$=".quantityAvailable"]');
      if (await allQtys.count() > 1) await allQtys.nth(1).fill('50');
    }
  }

  // Submit event creation
  const [createResp] = await Promise.all([
    waitForResponse(page, '/events'),
    page.click('button[type="submit"]')
  ]);
  log(`Create Event API: ${createResp.status} ${createResp.ok ? 'OK' : 'FAIL'}`);

  if (createResp.body) {
    log(`Create response: ${JSON.stringify(createResp.body).slice(0, 200)}`);
    eventId = createResp.body.id || createResp.body.event_id || null;
    if (!eventId && typeof createResp.body === 'object') {
      // Try first key
      const keys = Object.keys(createResp.body);
      if (keys.length > 0 && createResp.body[keys[0]]?.id) eventId = createResp.body[keys[0]].id;
    }
    log(`Event ID: ${eventId || 'not found in response'}`);
  }

  await setTimeout(2000);
  log(`After create URL: ${page.url()}`);

  // ==========================================================
  // 4. GET TICKET TYPES
  // ==========================================================
  log('=== 4. TICKET TYPES ===');

  // Navigate to events list to find the event
  await page.goto(`${BASE}/organizer/events`, { waitUntil: 'networkidle' });
  await setTimeout(2000);

  // Try getting event ID from the page if we don't have it
  if (!eventId) {
    log('Trying to get event ID from events page', 'INFO');
    const pageText = await page.textContent('body');
    // Check for event links
    const eventLinks = page.locator('a[href*="/organizer/events/"]');
    const count = await eventLinks.count();
    if (count > 0) {
      const href = await eventLinks.first().getAttribute('href');
      const match = href.match(/\/events\/([^/]+)/);
      if (match) {
        eventId = match[1];
        log(`Event ID from page: ${eventId}`);
      }
    }
  }

  if (eventId) {
    const ttResp = await page.request.get(`${API_BASE}/events/${eventId}/ticket-types`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const ttData = await ttResp.json();
    log(`Ticket types API: ${ttResp.status()} - ${JSON.stringify(ttData).slice(0, 200)}`);
    if (Array.isArray(ttData) && ttData.length > 0) {
      ticketTypeId = ttData[0].id;
      log(`Ticket type ID: ${ticketTypeId}`);
    }
  }

  // ==========================================================
  // 5. PUBLISH EVENT
  // ==========================================================
  log('=== 5. PUBLISH EVENT ===');

  if (eventId) {
    const pubResp = await page.request.patch(`${API_BASE}/events/${eventId}/publish`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    log(`Publish API: ${pubResp.status()}`);
  }

  // ==========================================================
  // 6. BUY TICKET
  // ==========================================================
  log('=== 6. BUY TICKET ===');

  if (eventId && ticketTypeId) {
    await page.goto(`${BASE}/e/${eventId}`, { waitUntil: 'networkidle' });
    await setTimeout(3000);

    const pageText = await page.textContent('body');
    log(`Public event page loads: ${pageText.includes(eventTitle) ? 'title found' : 'checking content'}`);

    // Step 1: Enter attendee name
    const nameInput = page.locator('#fullName, input[name="fullName"]');
    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nameInput.fill('John Attendee');

      const nameSubmitBtn = page.locator('button:has-text("Continue to Tickets")');
      if (await nameSubmitBtn.isVisible()) {
        await nameSubmitBtn.click();
        await setTimeout(2000);
      }
    }

    // Step 2: Find and select ticket, proceed to payment
    const proceedBtn = page.locator('button:has-text("Proceed to Payment")');
    if (await proceedBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await proceedBtn.click();
      await setTimeout(1000);
    }

    // Step 3: Payment modal
    const phoneInput = page.locator('input[type="tel"]');
    if (await phoneInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await phoneInput.fill(TEST_PHONE);
    }

    // Click Pay
    const payBtn = page.locator('button:has-text("Pay")');
    if (await payBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      const [orderResp] = await Promise.all([
        waitForResponse(page, '/orders'),
        payBtn.click()
      ]);
      log(`Order API: ${orderResp.status} ${orderResp.ok ? 'OK' : 'FAIL'}`);

      if (orderResp.body) {
        log(`Order response: ${JSON.stringify(orderResp.body).slice(0, 200)}`);
        orderId = orderResp.body.id || orderResp.body.order_id || null;
        qrHash = orderResp.body.qr_hash || orderResp.body.qrHash || orderResp.body.qr_code || null;
      }
    }

    await setTimeout(2000);
    log(`After purchase URL: ${page.url()}`);

    // Extract order ID from URL if needed
    if (!orderId) {
      const url = page.url();
      const match = url.match(/\/ticket\/([^/?]+)/);
      if (match) orderId = match[1];
      log(`Order ID from URL: ${orderId}`);
    }
  } else {
    log(`Skipping purchase - eventId=${eventId}, ticketTypeId=${ticketTypeId}`, 'SKIP');
  }

  // ==========================================================
  // 7. VIEW TICKET / QR CODE
  // ==========================================================
  log('=== 7. TICKET + QR ===');

  if (orderId) {
    // If not already on ticket page
    if (!page.url().includes('/ticket/')) {
      await page.goto(`${BASE}/ticket/${orderId}`, { waitUntil: 'networkidle' });
      await setTimeout(2000);
    }

    // Check for QR code
    const qrCanvas = page.locator('canvas');
    const qrCount = await qrCanvas.count();
    log(`QR Code elements: ${qrCount > 0 ? 'PASS (' + qrCount + ' canvas(s))' : 'FAIL (no canvas)'}`);

    // Check download button
    const downloadBtn = page.locator('button:has-text("Download")');
    if (await downloadBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      log('Download button visible', 'PASS');
      await downloadBtn.click();
      log('Download clicked', 'INFO');
      await setTimeout(500);
    } else {
      log('Download button NOT visible', 'FAIL');
    }

    // Check ticket details
    const bodyText = await page.textContent('body');
    if (bodyText.includes('Successful') || bodyText.includes('Ticket') || bodyText.includes('Order')) {
      log('Ticket page shows confirmation', 'PASS');
    } else {
      log('Ticket page content unexpected', 'WARN');
    }
  } else {
    log('Skipping ticket view - no order ID', 'SKIP');
  }

  // ==========================================================
  // 8. CHECK-IN
  // ==========================================================
  log('=== 8. CHECK-IN ===');

  if (eventId) {
    await page.goto(`${BASE}/organizer/checkin/${eventId}`, { waitUntil: 'networkidle' });
    await setTimeout(3000);

    const manualBtn = page.locator('button:has-text("Manual")');
    if (await manualBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await manualBtn.click();
      await setTimeout(500);

      const ticketInput = page.locator('input[name="ticketId"]');
      if (await ticketInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await ticketInput.fill(orderId || qrHash || 'test-qr-hash');

        const [checkinResp] = await Promise.all([
          waitForResponse(page, '/checkin'),
          page.click('button:has-text("Check In")')
        ]);
        log(`Check-in API: ${checkinResp.status} ${checkinResp.ok ? 'OK' : 'FAIL'}`);
        if (checkinResp.body) log(`Check-in response: ${JSON.stringify(checkinResp.body).slice(0, 200)}`);
      }
    } else {
      log('Manual entry button not found', 'WARN');
    }

    // Check recent check-ins section
    const bodyText = await page.textContent('body');
    if (bodyText.includes('Recent') || bodyText.includes('Check-in') || bodyText.includes('Scanned')) {
      log('Check-in page shows recent activity area', 'INFO');
    }
  } else {
    log('Skipping check-in - no event ID', 'SKIP');
  }

  // ==========================================================
  // 9. ANALYTICS
  // ==========================================================
  log('=== 9. ANALYTICS ===');

  if (eventId) {
    await page.goto(`${BASE}/organizer/analytics/${eventId}`, { waitUntil: 'networkidle' });
    await setTimeout(3000);

    const [analyticsResp] = await Promise.all([
      waitForResponse(page, '/analytics', 8000).catch(() => ({ status: 0 })),
      Promise.resolve()
    ]);
    log(`Analytics API: ${analyticsResp.status || 'no call detected'}`);

    const bodyText = await page.textContent('body');
    const analyticsTerms = ['Total', 'Revenue', 'Sold', 'Check-in', 'Percentage'];
    const found = analyticsTerms.filter(t => bodyText.includes(t));
    log(`Analytics page terms found: ${found.length > 0 ? found.join(', ') : 'NONE'}`, found.length > 0 ? 'PASS' : 'WARN');
  }

  // ==========================================================
  // FINAL SUMMARY
  // ==========================================================
  log('');
  log('========================================');
  log('            TEST RESULTS');
  log('========================================');
  log(`Event:   ${eventId || 'FAIL'}`);
  log(`Ticket:  ${ticketTypeId || 'FAIL'}`);
  log(`Order:   ${orderId || 'FAIL'}`);
  log(`QR:      ${qrHash || 'N/A'}`);
  log('');

  const failures = [];
  if (!eventId) failures.push('Create Event: no event ID returned');
  if (!ticketTypeId) failures.push('Ticket Types: not found/created');
  if (!orderId) failures.push('Purchase Ticket: no order ID returned');

  if (failures.length > 0) {
    log('FAILURES:');
    failures.forEach(f => log(`  ✗ ${f}`));
  } else {
    log('✓ ALL CRITICAL FLOWS PASSED');
  }

  log('');
  log('API CALLS:');
  apiCalls.slice(0, 30).forEach(c => log(`  ${c.method} ${c.url} → ${c.status}`));

  const result = {
    eventId, ticketTypeId, orderId, qrHash,
    failures,
    totalApiCalls: apiCalls.length,
    apiCalls: apiCalls.slice(0, 40),
    logs
  };
  fs.writeFileSync('/tmp/interact-results.json', JSON.stringify(result, null, 2));
  log('Results saved to /tmp/interact-results.json');

  await browser.close();
}

run().catch(async err => {
  console.error('FATAL:', err.message);
  if (browser) await browser.close();
  process.exit(1);
});
