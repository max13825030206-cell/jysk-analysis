---
name: agent-browser
description: Browser automation for AI agents. Use when the user needs to interact with websites - navigate pages, fill forms, click buttons, extract data, test web apps, or automate any browser task. Triggers include opening websites, filling forms, clicking buttons, scraping data, testing web apps, logging into sites, automating browsers, browsing the web, or searching on YouTube/Google.
allowed-tools: Bash(agent-browser:*), Bash(npx agent-browser:*), Bash(which agent-browser), Bash(npm install -g agent-browser), Bash(agent-browser install*)
---

# Browser Automation with agent-browser

## Pre-flight: Installation Check

Before any browser command, verify agent-browser is installed:

```bash
which agent-browser
```

If NOT found, install it:

```bash
npm install -g agent-browser && agent-browser install
```

If `npm` is also not found, the user needs Node.js first:
- **macOS**: `brew install node`
- **Linux**: `curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs`
- **Windows**: Download from https://nodejs.org/

After install, run `agent-browser install` to set up the browser engine (downloads Chromium if needed).

**Troubleshooting installation:**
- If `agent-browser install` fails with permission errors: `sudo npm install -g agent-browser`
- If Chromium download fails behind a proxy: `HTTPS_PROXY=http://proxy:port agent-browser install`
- Linux may need system deps: `agent-browser install --with-deps`
- Full install docs: https://github.com/vercel-labs/agent-browser#installation

---

## Golden Rules

### 1. Snapshot First, Screenshot Never (unless needed)

**ALWAYS prefer `snapshot -i` over `screenshot`.**

Snapshots return a structured text accessibility tree with element refs (`@e1`, `@e2`...).
This is faster, cheaper (no image tokens), and gives you actionable refs to interact with.

Only use `screenshot` when:
- You need to verify visual layout or styling
- The page has canvas/chart elements invisible to text snapshots
- The user explicitly asks to "see" the page
- You need `--annotate` mode for unlabeled icon buttons

### 2. Self-Reliance: Bypass Obstacles Before Asking for Help

When you hit a blocker (CAPTCHA, anti-bot, cookie wall, geo-block):

1. **Try to bypass it yourself first:**
   - Switch to a direct URL (e.g., go to youtube.com/results?search_query=... instead of searching via Google)
   - Use `agent-browser wait --load networkidle` then retry
   - Try a different path to the same content
   - Use `--session-name` with saved auth state if available
   - Add explicit waits for slow-loading elements

2. **If you cannot bypass it, ask the user to take over:**
   - Tell the user what's blocking you and what you need them to do
   - If the browser is `--headed` or connected via `--cdp`, the user can interact directly
   - After the user resolves it, take a fresh `snapshot -i` and continue

### 3. User Takes Over for These Scenarios (ALWAYS)

**Never attempt these yourself. Immediately ask the user:**

- **Payment / checkout** — anything involving credit cards, wallets, or money
- **CAPTCHA / verification codes** — reCAPTCHA, Cloudflare Turnstile, SMS codes, email verification
- **Login with credentials** — unless the user has pre-saved auth via `agent-browser auth save` or `state save`
- **2FA / MFA prompts** — TOTP, push notifications, security keys

Template for asking:
> I've hit a [CAPTCHA / payment page / login screen] that I can't handle automatically.
> Could you take over in the browser and complete this step?
> Let me know when you're done and I'll continue from there.

---

## Core Workflow

Every browser automation follows this loop:

1. **Navigate**: `agent-browser open <url>`
2. **Snapshot**: `agent-browser snapshot -i` (get element refs like `@e1`, `@e2`)
3. **Interact**: Use refs to click, fill, select
4. **Re-snapshot**: After navigation or DOM changes, get fresh refs

```bash
agent-browser open https://example.com/form
agent-browser snapshot -i
# Output: textbox "Email" [ref=e1], textbox "Password" [ref=e2], button "Submit" [ref=e3]

agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3
agent-browser wait --load networkidle
agent-browser snapshot -i  # MUST re-snapshot after navigation
```

## Command Chaining

Chain commands with `&&` when you don't need intermediate output:

```bash
# Navigate + wait + snapshot in one call
agent-browser open https://example.com && agent-browser wait --load networkidle && agent-browser snapshot -i

# Multiple form fills
agent-browser fill @e1 "user@example.com" && agent-browser fill @e2 "password123" && agent-browser click @e3
```

**When NOT to chain:** When you need to read snapshot output to discover refs before interacting.

---

## Essential Commands

### Navigation

```bash
agent-browser open <url>              # Navigate (aliases: goto, navigate)
agent-browser back                    # Go back
agent-browser forward                 # Go forward
agent-browser reload                  # Reload page
agent-browser close                   # Close browser (ALWAYS close when done)
```

### Snapshot (your primary observation tool)

```bash
agent-browser snapshot -i             # Interactive elements with refs (RECOMMENDED)
agent-browser snapshot -i -C          # Include cursor-interactive elements (divs with onclick)
agent-browser snapshot -s "#selector" # Scope to CSS selector
agent-browser snapshot -c             # Compact output
agent-browser snapshot -d 3           # Limit depth to 3 levels
```

### Interaction (use @refs from snapshot)

```bash
agent-browser click @e1               # Click element
agent-browser click @e1 --new-tab     # Click and open in new tab
agent-browser fill @e2 "text"         # Clear field and type text
agent-browser type @e2 "text"         # Type WITHOUT clearing (append)
agent-browser select @e1 "option"     # Select dropdown option
agent-browser check @e1               # Check checkbox
agent-browser uncheck @e1             # Uncheck checkbox
agent-browser press Enter             # Press key (Enter, Tab, Escape, etc.)
agent-browser press Control+a         # Key combination
agent-browser keyboard type "text"    # Type at current focus (no ref needed)
agent-browser hover @e1              # Hover over element
agent-browser scroll down 500         # Scroll page (down/up/left/right + pixels)
agent-browser scroll down 500 --selector "div.content"  # Scroll within container
agent-browser scrollintoview @e1      # Scroll element into view
agent-browser drag @e1 @e2            # Drag and drop
agent-browser upload @e1 file.pdf     # Upload file
```

### Get Information

```bash
agent-browser get text @e1            # Get element text
agent-browser get html @e1            # Get innerHTML
agent-browser get value @e1           # Get input value
agent-browser get attr @e1 href       # Get attribute
agent-browser get url                 # Get current URL
agent-browser get title               # Get page title
agent-browser get count ".item"       # Count matching elements
```

### Wait (critical for dynamic pages)

```bash
agent-browser wait @e1                # Wait for element to appear
agent-browser wait --load networkidle # Wait for network to settle (USE AFTER open)
agent-browser wait --url "**/page"    # Wait for URL pattern
agent-browser wait --text "Success"   # Wait for text to appear
agent-browser wait --fn "window.ready" # Wait for JS condition
agent-browser wait 2000               # Wait fixed milliseconds (last resort)
```

### Downloads

```bash
agent-browser download @e1 ./file.pdf          # Click to trigger download + save
agent-browser wait --download ./output.zip     # Wait for any download to complete
agent-browser --download-path ./downloads open <url>  # Set default download dir
```

### Capture (only when needed)

```bash
agent-browser screenshot              # Screenshot to temp file
agent-browser screenshot page.png     # Screenshot to specific path
agent-browser screenshot --full       # Full page screenshot
agent-browser screenshot --annotate   # Annotated: numbered labels on interactive elements
agent-browser pdf output.pdf          # Save page as PDF
```

### Viewport & Device

```bash
agent-browser set viewport 1920 1080          # Set viewport size (default: 1280x720)
agent-browser set viewport 1920 1080 2        # 2x retina
agent-browser set device "iPhone 14"          # Emulate device (viewport + user agent)
```

---

## Common Patterns

### Form Submission

```bash
agent-browser open https://example.com/signup
agent-browser snapshot -i
# Read refs from output, then:
agent-browser fill @e1 "Jane Doe"
agent-browser fill @e2 "jane@example.com"
agent-browser select @e3 "California"
agent-browser check @e4
agent-browser click @e5
agent-browser wait --load networkidle
agent-browser snapshot -i  # Verify result
```

### Search on a Website

```bash
# Direct URL approach (PREFERRED — avoids search box interaction issues)
agent-browser open "https://www.youtube.com/results?search_query=your+search+terms"
agent-browser wait --load networkidle
agent-browser snapshot -i

# Or via search box
agent-browser open https://www.youtube.com
agent-browser snapshot -i
agent-browser fill @e4 "search query"
agent-browser press Enter
agent-browser wait --load networkidle
agent-browser snapshot -i
```

### Data Extraction

```bash
agent-browser open https://example.com/products
agent-browser snapshot -i
agent-browser get text @e5              # Specific element
agent-browser get text body > page.txt  # Full page text

# JSON output for programmatic parsing
agent-browser snapshot -i --json
agent-browser get text @e1 --json
```

### Authentication with Saved State

```bash
# === First time: login and save ===
agent-browser open https://app.example.com/login
agent-browser snapshot -i
agent-browser fill @e1 "username"
agent-browser fill @e2 "password"
agent-browser click @e3
agent-browser wait --url "**/dashboard"
agent-browser state save auth.json

# === Later sessions: reuse saved state ===
agent-browser state load auth.json
agent-browser open https://app.example.com/dashboard
```

### Authentication with Auth Vault (passwords never exposed to LLM)

```bash
# User saves credentials once (encrypted)
echo "mypassword" | agent-browser auth save github --url https://github.com/login --username user --password-stdin

# Agent logs in using saved profile
agent-browser auth login github

# Manage profiles
agent-browser auth list
agent-browser auth show github
agent-browser auth delete github
```

### Session Persistence (auto-save cookies across restarts)

```bash
# Named sessions auto-save/restore cookies and localStorage
agent-browser --session-name myapp open https://app.example.com
# ... interact ...
agent-browser close  # State saved to ~/.agent-browser/sessions/

# Next time:
agent-browser --session-name myapp open https://app.example.com  # Auto-restored

# Manage sessions
agent-browser state list
agent-browser state clear myapp
```

### Parallel Sessions

```bash
agent-browser --session site1 open https://site-a.com
agent-browser --session site2 open https://site-b.com

agent-browser --session site1 snapshot -i
agent-browser --session site2 snapshot -i

agent-browser session list
```

### Connect to Existing Chrome (e.g., remote server)

```bash
# Explicit CDP port
agent-browser --cdp 9222 snapshot -i

# Auto-discover running Chrome
agent-browser --auto-connect snapshot -i
```

### Semantic Locators (when refs are unreliable)

```bash
agent-browser find text "Sign In" click
agent-browser find label "Email" fill "user@test.com"
agent-browser find role button click --name "Submit"
agent-browser find placeholder "Search" type "query"
```

### JavaScript Evaluation

```bash
# Simple expressions
agent-browser eval 'document.title'
agent-browser eval 'document.querySelectorAll("img").length'

# Complex JS: use --stdin heredoc to avoid shell quoting issues
agent-browser eval --stdin <<'EVALEOF'
JSON.stringify(
  Array.from(document.querySelectorAll("a"))
    .map(a => ({ text: a.textContent.trim(), href: a.href }))
    .filter(a => a.text)
)
EVALEOF

# Or base64 encoding
agent-browser eval -b "$(echo -n 'document.title' | base64)"
```

### Visual Debugging

```bash
agent-browser --headed open https://example.com   # Show browser window
agent-browser highlight @e1                        # Highlight element visually
agent-browser record start demo.webm               # Record session video
agent-browser record stop                          # Stop recording
```

### Diff (verify action effects)

```bash
agent-browser snapshot -i              # Baseline
agent-browser click @e2                # Action
agent-browser diff snapshot            # See what changed (+ additions, - removals)
```

---

## Ref Lifecycle (Critical)

Refs (`@e1`, `@e2`, etc.) are **invalidated** when the page changes. You MUST re-snapshot after:

- Clicking links or buttons that navigate
- Form submissions
- Dynamic content loading (dropdowns, modals, tabs)
- Page scrolling that triggers lazy loading

```bash
agent-browser click @e5              # Navigates to new page
# @e1, @e2... are now STALE — do not use them
agent-browser snapshot -i            # Get fresh refs
agent-browser click @e1              # Now safe to use new refs
```

---

## Timeouts and Slow Pages

Default timeout is 25 seconds. For slow sites:

```bash
# Best: wait for network to settle
agent-browser open https://slow-site.com && agent-browser wait --load networkidle

# Wait for specific element
agent-browser wait "#content-loaded"

# Override default timeout (milliseconds)
AGENT_BROWSER_DEFAULT_TIMEOUT=60000 agent-browser open https://very-slow-site.com
```

---

## Security (opt-in)

```bash
# Content boundaries: wrap page content in markers (prevents prompt injection)
export AGENT_BROWSER_CONTENT_BOUNDARIES=1

# Domain allowlist: restrict navigation
export AGENT_BROWSER_ALLOWED_DOMAINS="example.com,*.example.com"

# Output size limit: prevent context flooding
export AGENT_BROWSER_MAX_OUTPUT=50000
```

---

## Session Cleanup

**ALWAYS close the browser when done** to avoid leaked processes:

```bash
agent-browser close                    # Close default session
agent-browser --session name close     # Close specific session
```

If a previous session wasn't closed properly, `agent-browser close` cleans it up.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `command not found: agent-browser` | Run `npm install -g agent-browser && agent-browser install` |
| Element not found / stale ref | Re-run `snapshot -i` to get fresh refs |
| Page not fully loaded | Add `wait --load networkidle` after `open` |
| CAPTCHA / bot detection | Try direct URL approach; if stuck, ask user to take over |
| Timeout on slow page | Set `AGENT_BROWSER_DEFAULT_TIMEOUT=60000` |
| Can't find interactive element | Try `snapshot -i -C` to include cursor-interactive elements |
| Shell quoting issues in `eval` | Use `eval --stdin <<'EOF'` or `eval -b` |
| Permission denied on install | Use `sudo npm install -g agent-browser` |
| Linux missing browser deps | Run `agent-browser install --with-deps` |
| Chromium download fails | Check proxy: `HTTPS_PROXY=... agent-browser install` |

## Resources

- **GitHub repo**: https://github.com/vercel-labs/agent-browser
- **Issues & bugs**: https://github.com/vercel-labs/agent-browser/issues
- **Full command reference**: https://github.com/vercel-labs/agent-browser/blob/main/skills/agent-browser/references/commands.md
- **Session management docs**: https://github.com/vercel-labs/agent-browser/blob/main/skills/agent-browser/references/session-management.md
- **Authentication docs**: https://github.com/vercel-labs/agent-browser/blob/main/skills/agent-browser/references/authentication.md
