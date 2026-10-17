import {expect, test} from '@playwright/test';

test('login, sessão e comentário não executam HTML não confiável', async ({page}) => {
  await page.goto('/');
  await page.getByLabel('Usuário').fill('ana');
  await page.getByLabel('Senha').fill('demo-ana');
  await page.getByRole('button', {name: 'Entrar'}).click();
  await expect(page.getByRole('status')).toHaveText('Sessão local iniciada');
  await page.getByLabel('Comentário').fill('<img src=x onerror=alert(1)>');
  await page.getByRole('button', {name: 'Adicionar'}).click();
  await expect(page.locator('#comments li')).toHaveText('<img src=x onerror=alert(1)>');
  await expect(page.locator('#comments img')).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveAttribute('onload', /.+/);
});

test('browser accepts the configured CORS origin, rejects another origin, and blocks inline script', async ({page, baseURL}) => {
  const configuredOrigin = new URL(baseURL).origin;
  const corsOrigin = process.env.PHASE7_E2E_CORS_ORIGIN;
  const browserDiagnostics = [];
  page.on('console', message => browserDiagnostics.push(`console:${message.type()}:${message.text()}`));
  page.on('requestfailed', request => browserDiagnostics.push(`requestfailed:${request.url()}:${request.failure()?.errorText}`));
  page.on('request', request => browserDiagnostics.push(`request:${request.method()}:${request.url()}`));
  page.on('response', response => browserDiagnostics.push(`response:${response.status()}:${response.url()}:${response.request().method()}`));
  page.on('pageerror', error => browserDiagnostics.push(`pageerror:${error.message}`));
  expect(corsOrigin).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);

  const allowedResponsePromise = page.waitForResponse(response =>
    response.url() === `${corsOrigin}/` && response.request().method() === 'GET');
  await page.route(`${configuredOrigin}/cors-test`, route => route.fulfill({
    status: 200,
    contentType: 'text/html; charset=utf-8',
    body: '<!doctype html><title>Origin test</title>',
  }));
  const originPage = await page.goto(`${configuredOrigin}/cors-test`);
  expect(originPage.headers()['content-security-policy']).toBeUndefined();
  const allowedResult = await page.evaluate(async target => {
    try {
      const response = await fetch(`${target}/`);
      return {status: response.status};
    } catch (error) {
      return {error: error.name};
    }
  }, corsOrigin);
  const allowedResponse = await allowedResponsePromise;
  expect(allowedResult, browserDiagnostics.join(' | ')).toEqual({status: 200});
  expect(allowedResponse.status()).toBe(200);
  expect(allowedResponse.headers()['access-control-allow-origin']).toBe(configuredOrigin);

  const blockedPage = await page.context().newPage();
  const blockedDiagnostics = [];
  blockedPage.on('console', message => blockedDiagnostics.push(`console:${message.type()}:${message.text()}`));
  blockedPage.on('requestfailed', request => blockedDiagnostics.push(`requestfailed:${request.url()}:${request.failure()?.errorText}`));
  await blockedPage.route(`${corsOrigin}/cors-test`, route => route.fulfill({
    status: 200,
    contentType: 'text/html; charset=utf-8',
    body: '<!doctype html><title>Origin test</title>',
  }));
  await blockedPage.goto(`${corsOrigin}/cors-test`);
  const blockedResult = await blockedPage.evaluate(async target => {
    try {
      const response = await fetch(`${target}/`);
      return {status: response.status};
    } catch (error) {
      return {error: error.name};
    }
  }, configuredOrigin);
  expect(blockedResult).toEqual({error: 'TypeError'});
  expect(blockedDiagnostics.join(' | ')).toMatch(/blocked by CORS policy/);

  await page.goto(configuredOrigin);
  const cspMessages = [];
  page.on('console', message => {
    if (message.type() === 'error' && /content security policy|script-src/i.test(message.text())) cspMessages.push(message.text());
  });
  await page.evaluate(() => {
    window.phase7InlineExecuted = false;
    const script = document.createElement('script');
    script.textContent = 'window.phase7InlineExecuted = true';
    document.head.append(script);
  });
  expect(await page.evaluate(() => window.phase7InlineExecuted)).toBe(false);
  expect(cspMessages, browserDiagnostics.join(' | ')).not.toHaveLength(0);
  await blockedPage.close();
});
