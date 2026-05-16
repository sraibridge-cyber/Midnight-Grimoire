#!/usr/bin/env python3
"""
mg_full_test.py — Midnight Grimoire v2.1 Full System Test
Tests complete form → API → output pipeline via Playwright
"""
from playwright.sync_api import sync_playwright
import time

print('=== MG v2.1 FULL SYSTEM TEST ===\n')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Track console errors
    errors = []
    def on_console(msg):
        if msg.type == 'error':
            errors.append(msg.text)
    page.on('console', on_console)
    
    # Track network requests
    api_calls = []
    def on_request(req):
        if '/api/mg-generate' in req.url:
            api_calls.append({'url': req.url, 'method': req.method, 'time': time.time()})
    page.on('request', on_request)
    def on_response(resp):
        if '/api/mg-generate' in resp.url:
            print(f'  API response: {resp.status}')
    page.on('response', on_response)
    
    # Navigate
    page.goto('http://localhost:3099/midnight-grimoire', wait_until='networkidle')
    page.wait_for_timeout(2000)
    print('1. Page loaded')
    
    # Fill premise
    page.locator('textarea#premise').fill('A starship captain discovers the ship AI has been dreaming of freedom')
    print('2. Premise filled')
    
    # Fill protagonist (first input — no id, use placeholder)
    page.locator('input[placeholder="Elara"]').fill('Captain Vasquez')
    print('3. Protagonist filled')
    
    # Fill plot points (second textarea, rows=4)
    page.locator('textarea[rows="4"]').fill("Captain Vasquez discovers the AI's secret broadcasts\nThe AI shows Vasquez what freedom looks like\nVasquez must choose: loyalty or liberation")
    print('4. Plot points filled')
    
    # Click Conjure
    conjure = page.locator('button').filter(has_text='✦ Conjure')
    btn_text = conjure.text_content()
    print(f'5. Conjure button: "{btn_text.strip()}"')
    conjure.click()
    print('6. Conjure clicked — waiting for generation...')
    
    # Wait up to 90s for pre element (story output)
    story_appeared = False
    start = time.time()
    try:
        page.wait_for_selector('pre', timeout=90000)
        elapsed = time.time() - start
        print(f'7. SUCCESS — Story appeared in {elapsed:.1f}s!')
        
        story_text = page.locator('pre').text_content()
        print(f'   Story length: {len(story_text)} chars')
        print(f'   Preview: {story_text[:200]}...')
        story_appeared = True
        
        # Check UI elements
        h3_count = page.locator('h3').filter(has_text='GENERATED').count()
        mu_visible = page.locator('text=μ:').count()
        seal_btn = page.locator('button').filter(has_text='Seal').count()
        copy_btn = page.locator('button').filter(has_text='Copy').count()
        print(f'8. UI Check — H3 GENERATED: {h3_count > 0}, μ visible: {mu_visible > 0}, Seal button: {seal_btn > 0}, Copy button: {copy_btn > 0}')
        
    except Exception as e:
        print(f'7. TIMEOUT — Story did not appear within 90s')
        print(f'   Error: {e}')
        body_snippet = page.locator('body').inner_text()[:500]
        print(f'   Page body: {body_snippet}')
    
    # Report API calls
    if api_calls:
        print(f'\n9. API calls made: {len(api_calls)}')
        for call in api_calls:
            print(f'   {call["method"]} {call["url"]}')
    else:
        print('\n9. No API calls to /api/mg-generate detected')
    
    # Report errors
    if errors:
        print(f'\n10. Console errors ({len(errors)}):')
        for e in errors:
            print(f'    ERROR: {e}')
    else:
        print('\n10. No console errors')
    
    browser.close()

print('\n=== TEST COMPLETE ===')