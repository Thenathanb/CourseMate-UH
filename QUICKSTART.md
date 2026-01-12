# Quick Start Guide - CourseMate UH

##  Installation (2 minutes)

### Step 1: Load Extension in Chrome

1. Open Chrome and navigate to: `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `CourseMate UH` folder
5.  Done! You should see the extension in your toolbar

### Step 2: Add Icons (Optional but Recommended)

The extension will show warnings without icons. Add three PNG files to the `icons/` folder:

- `icon16.png` - 16×16 pixels
- `icon48.png` - 48×48 pixels
- `icon128.png` - 128×128 pixels

**Quick option**: Use any graduation cap or star icon from [Flaticon](https://www.flaticon.com) or create simple text-based icons.

---

## 🧪 Testing Immediately

### Option 1: Use the Test Page

1. Open `test.html` (included in this folder) in Chrome
2. **Important**: The extension only runs on `*.uh.edu` domains by default
3. To test locally, temporarily update `manifest.json`:

```json
"content_scripts": [
  {
    "matches": [
      "https://*.uh.edu/*",
      "file:///*"  // ← Add this line for local testing
    ],
```

4. Reload the extension (`chrome://extensions/` → refresh icon)
5. Reload `test.html`
6. You should see badges next to professor names!

### Option 2: Test on a Real UH Page

1. Navigate to any UH course catalog/schedule page
2. Open browser console (F12)
3. Look for logs: `[CourseMate UH] Content script loaded`
4. If no badges appear, you need to configure selectors...

---

## 🎯 Configuring for UH Pages

### Find the Right Selectors

1. **Navigate to a UH course page** with instructor names
2. **Right-click** on an instructor name → **Inspect**
3. Look at the HTML structure:

```html
<!-- Example 1: Table cell with class -->
<td class="schedule-instructor">Smith, John</td>

<!-- Example 2: Span with data attribute -->
<span data-field="instructor">Johnson, Sarah</span>

<!-- Example 3: Div with specific class -->
<div class="faculty-name">Williams, Robert</div>
```

4. **Identify the selector**:
   - If it has a class: `.schedule-instructor` or `td.schedule-instructor`
   - If it has a data attribute: `[data-field="instructor"]`
   - If it's in a specific column: `td:nth-child(4)` (if instructors are always in 4th column)

### Update contentScript.js

1. Open `contentScript.js`
2. Find the `SELECTORS` object (around line 12)
3. Add your selectors:

```javascript
const SELECTORS = {
  instructorElements: [
    '.instructor-name',          // Keep existing ones
    '.faculty-name',
    'td.schedule-instructor',    // ← ADD YOUR SELECTOR HERE
    '[data-field="instructor"]', // ← OR HERE
  ],
  // ...
};
```

4. Save the file
5. Reload extension: `chrome://extensions/` → click ↻ on CourseMate UH
6. Reload the UH page

### Verify It Works

Open console on the UH page:

```javascript
// Should show your selectors
window.profPeekDebug.showSelectors()

// Should detect professors
window.profPeekDebug.scan()
```

Look for: `[CourseMate UH] Found 8 elements matching "td.schedule-instructor"`

---

## ⚙️ Settings

Click the extension icon to open settings:

### Essential Settings

- **Enable Extension**: ON (toggle off to disable)
- **Default School**: University of Houston
- **Cache Duration**: 7 days (recommended)
- **Debug Mode**: ON for testing, OFF for normal use

### Useful Actions

- **Save Settings**: Apply changes
- **Clear Cache**: Removes all cached professor data (useful for testing)

---

## 🐛 Debugging

### Badges Not Appearing?

**1. Check if extension is running:**
```javascript
// In console on UH page
window.profPeekDebug  // Should return an object
```

**2. Enable debug mode:**
- Open extension settings
- Turn ON "Debug Mode"
- Reload page
- Check console for detailed logs

**3. Test selectors:**
```javascript
// Show current selectors
window.profPeekDebug.showSelectors()

// Try adding a selector manually
window.profPeekDebug.addSelector('td.your-selector')

// Force re-scan
window.profPeekDebug.reset()
```

**4. Check the page URL:**
- Extension only works on `*.uh.edu` domains
- Check `manifest.json` → `content_scripts.matches`

### Wrong Names Detected?

The selectors might be too broad. Add exclusions:

```javascript
// In contentScript.js
const SELECTORS = {
  // ...
  excludeElements: [
    'nav',
    'header',
    'footer',
    '.navigation',
    '.sidebar',  // ← Add elements to exclude
  ]
};
```

### Cache Issues?

1. Open settings → **Clear Cache**
2. Reload extension
3. Reload UH page

---

## 📊 Mock Data Available

The extension includes sample data for these professors (for testing):

- **John Smith** - 4.2/5 (47 ratings)
- **Sarah Johnson** - 4.8/5 (92 ratings)
- **Robert Williams** - 3.5/5 (23 ratings)
- **Emily Davis** - 4.6/5 (78 ratings)

Try these names in various formats:
- "Smith, John"
- "John Smith"
- "SMITH, JOHN"
- "Smith, John A."

All should work and normalize to the same professor.

---

## 🔄 Replacing Mock Data

To use real RateMyProfessors data:

1. Open `background.js`
2. Find the `TODO: Real RMP Provider` section (around line 68)
3. Implement your data fetcher
4. Change line 91 from:
   ```javascript
   const DataProvider = MockProvider;
   ```
   to:
   ```javascript
   const DataProvider = RMPProvider;  // Your implementation
   ```

**Important**: Respect RMP's terms of service and implement rate limiting!

---

## ✅ Quick Test Checklist

After installation:

- [ ] Extension shows in `chrome://extensions/`
- [ ] No errors in extension card
- [ ] Can open settings page
- [ ] Test page (`test.html`) shows badges for mock professors
- [ ] Console debug helpers work: `window.profPeekDebug`
- [ ] Real UH page detects instructors (after configuring selectors)
- [ ] Clicking badges opens new tab (to RMP)
- [ ] Settings persist after reload

---

## 🆘 Getting Help

### Console Commands

```javascript
// All debug helpers
window.profPeekDebug

// Test name extraction
window.profPeekDebug.testName('Smith, John')

// Show configuration
window.profPeekDebug.showSelectors()

// Force re-scan
window.profPeekDebug.scan()

// Reset and re-scan
window.profPeekDebug.reset()
```

### Common Issues

| Problem | Solution |
|---------|----------|
| No badges appear | Check selectors, enable debug mode, verify UH domain |
| Wrong professors detected | Refine selectors, add exclusions |
| Badges in wrong place | Adjust CSS in `ui.css` |
| Extension not loading | Check for errors in `chrome://extensions/` |
| Mock data not showing | Names must exactly match mock data (case-insensitive) |

---

## 🎓 Next Steps

1. **Test locally** with `test.html`
2. **Find UH selectors** using Inspector
3. **Update `contentScript.js`** with correct selectors
4. **Verify on real UH pages**
5. **Add real icons** to `icons/` folder
6. **(Optional) Implement real RMP data provider**

---

## 📝 Notes

- Extension works entirely client-side (no backend required)
- All data cached locally in browser
- Rate limiting prevents excessive requests
- MutationObserver handles dynamic content
- Works with any number of instructors per page

Happy coding! 🚀
