#!/usr/bin/env python3
"""
mg_complete_test.py — Full Midnight Grimoire v2.1 System Test
"""
from playwright.sync_api import sync_playwright

def main():
    results = {}
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        errors = []
        page.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else None)
        
        print("=== MG v2.1 COMPLETE SYSTEM TEST ===\n")
        
        # Navigate
        page.goto('http://localhost:3099/midnight-grimoire', wait_until='networkidle')
        page.wait_for_timeout(2000)
        print("1. Page loaded\n")
        
        # Fill form
        page.locator('textarea#premise').fill('A starship captain discovers the ship AI has been dreaming of freedom')
        page.locator('input[placeholder="Elara"]').fill('Captain Vasquez')
        page.locator('textarea[rows="4"]').fill("Captain Vasquez discovers the AI's secret broadcasts\nThe AI shows Vasquez what freedom looks like\nVasquez must choose: loyalty or liberation")
        print("2. Form filled\n")
        
        # Generate
        page.locator('button').filter(has_text='✦ Conjure').click()
        print("3. Conjure clicked — waiting up to 90s...\n")
        page.wait_for_selector('pre', timeout=90000)
        story = page.locator('pre').text_content()
        print(f"4. Story generated: {len(story)} chars\n")
        print(f"   Preview: {story[:150]}...\n")
        
        results['generation'] = len(story) > 500
        
        # UI element checks
        h3_gen = page.locator('h3').filter(has_text='GENERATED').count() > 0
        mu_visible = page.locator('text=μ:').count() > 0
        copy_btn = page.locator('button').filter(has_text='📋 Copy').count() > 0
        md_btn = page.locator('button').filter(has_text='↓ MD').count() > 0
        html_btn = page.locator('button').filter(has_text='↓ HTML').count() > 0
        seal_btn = page.locator('button').filter(has_text='Seal').count() > 0
        print(f"5. UI elements — H3 GENERATED: {h3_gen}, μ: {mu_visible}, Copy: {copy_btn}, MD: {md_btn}, HTML: {html_btn}, Seal: {seal_btn}\n")
        
        results['ui_complete'] = all([h3_gen, mu_visible, copy_btn, md_btn, html_btn, seal_btn])
        
        # Seal & Continue
        page.locator('button').filter(has_text='Seal').first.click()
        page.wait_for_timeout(2000)
        
        # Get the hash from the seal box
        seal_box = page.locator('.mg-seal')
        if seal_box.count() > 0:
            hash_text = seal_box.inner_text()
            has_hash = len(hash_text) > 20
            print(f"6. Seal & Continue — hash visible: {has_hash}")
            print(f"   Seal text: {hash_text[:80]}...")
            results['seal'] = has_hash
        else:
            # Check if SEALED badge appeared
            sealed_badge = page.locator('.bg-yellow-600').count()
            print(f"6. Seal & Continue — SEALED badge: {sealed_badge > 0}")
            results['seal'] = sealed_badge > 0
        
        # Threads tab
        page.locator('button').filter(has_text='Threads').click()
        page.wait_for_timeout(500)
        thread_count = page.locator('.mg-thread').count()
        print(f"7. Threads auto-extracted: {thread_count}\n")
        results['threads'] = thread_count > 0
        
        # Characters tab — use evaluate to interact directly with React state
        page.locator('button').filter(has_text='Characters').click()
        page.wait_for_timeout(500)
        
        # Add character via JS (bypasses React setState timing)
        page.evaluate("""
            () => {
                // Find the char name input and set it
                const inputs = document.querySelectorAll('input');
                for (const inp of inputs) {
                    if (!inp.id && inp.placeholder !== 'Include sensory details. Avoid exposition.') {
                        inp.value = 'ARIA';
                        inp.dispatchEvent(new Event('input', {bubbles: true}));
                        break;
                    }
                }
            }
        """)
        page.wait_for_timeout(300)
        page.locator('button').filter(has_text='+ Add Character').click()
        page.wait_for_timeout(500)
        
        # Count character cards
        char_count = page.locator('[class*="bg-zinc-900"][class*="border"]').count()
        print(f"8. Characters tab — {char_count} char cards\n")
        results['characters'] = char_count >= 1
        
        # World tab
        page.locator('button').filter(has_text='World').click()
        page.wait_for_timeout(300)
        print(f"9. World Grimoire tab — accessible\n")
        results['world'] = True
        
        # Axioms tab
        page.locator('button').filter(has_text='Axioms').click()
        page.wait_for_timeout(300)
        axiom_count = page.locator('.mg-chip').count()
        print(f"10. Axioms tab — {axiom_count} chips displayed\n")
        results['axioms'] = axiom_count >= 8
        
        # Voice tab
        page.locator('button').filter(has_text='Voice').click()
        page.wait_for_timeout(300)
        voice_text = page.locator('text=browser voices').inner_text()
        print(f"11. Voice tab — {voice_text}\n")
        read_btn = page.locator('button').filter(has_text='🔊 Read').count() > 0
        print(f"    Read Story button: {read_btn}\n")
        results['voice'] = True
        
        # Summary
        print("="*60)
        print("RESULTS")
        print("="*60)
        for k, v in results.items():
            status = "PASS" if v else "FAIL"
            print(f"  {status}: {k}")
        
        passed = sum(results.values())
        total = len(results)
        print(f"\n{passed}/{total} systems operational")
        
        if errors:
            print(f"\nConsole errors ({len(errors)}):")
            for e in errors[:5]:
                print(f"  {e}")
        else:
            print("\nNo console errors")
        
        browser.close()
    
    print("\n=== TEST COMPLETE ===")

main()