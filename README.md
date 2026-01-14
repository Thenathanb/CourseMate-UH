# CourseMate 

A Chrome Extension (Manifest V3) that integrates RateMyProfessors ratings directly into supported university course catalog pages (currently University of Houston).

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- **Automatic Detection** - Finds instructor names on supported university course pages (currently UH)
- **Instant Ratings** - Shows RMP rating, # of reviews, difficulty, "would take again" %
- **One-Click Access** - Click any badge to open the full RMP profile
- **Smart Caching** - Reduces API calls with configurable cache duration
- **Rate Limiting** - Prevents spamming external services
- **Dynamic Content** - Works with pages that load instructors asynchronously
- **Clean UI** - Non-intrusive badges with color-coded ratings
- **Privacy Focused** - All data stored locally, no tracking

## Installation

### Option 1: Load Unpacked Extension (Development)

1. **Download or Clone this repository**
   ```bash
   git clone https://github.com/yourusername/CourseMate-UH.git
   cd CourseMate-UH
   ```

2. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Or click: Menu (⋮) → Extensions → Manage Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the `CourseMate-UH` folder (the one containing `manifest.json`)

5. **Verify Installation**
   - You should see "CourseMate" in your extensions list
   - The extension icon should appear in your Chrome toolbar

### Option 2: Chrome Web Store (Coming Soon)
*This extension is not yet published to the Chrome Web Store*

## Quick Start

### Testing the Extension

1. **Navigate to a test page** - Since the extension is configured for UH pages (`*.uh.edu`), you'll need to test on a UH course catalog or schedule page.

2. **For immediate testing with mock data:**
   - Open the extension and navigate to ANY webpage
   - Open the browser console (F12 or Cmd+Option+I)
   - Use the debug helpers to inject test instructor names:

   ```javascript
   // Add a test professor name to the page
   const testDiv = document.createElement('div');
   testDiv.className = 'instructor-name';
   testDiv.textContent = 'Smith, John';
   document.body.appendChild(testDiv);

   // Trigger a scan
   window.courseMateDebug.scan();
   ```

3. **Mock professors available:**
   - John Smith
   - Sarah Johnson
   - Robert Williams
   - Emily Davis

   Try these names in any format: "Last, First" or "First Last"

### Configuring for Real UH Pages

#### Step 1: Find the Correct DOM Selectors

1. Navigate to a UH course catalog or schedule page (e.g., `https://www.uh.edu/...`)

2. Right-click on an instructor name and select "Inspect Element"

3. Look for identifying patterns:
   - **Class names**: `.instructor`, `.faculty-name`, `.professor`
   - **Data attributes**: `[data-instructor]`, `[data-faculty]`
   - **Table structure**: `td.instructor`, `td:nth-child(N)`
   - **Parent containers**: `.course-row .instructor`

4. **Update the selectors in `contentScript.js`**:

   Open [contentScript.js](contentScript.js) and locate this section (around line 12):

   ```javascript
   const SELECTORS = {
     instructorElements: [
       '.instructor-name',     // ← UPDATE THESE
       '.faculty-name',        // ← WITH YOUR ACTUAL
       '[data-instructor]',    // ← SELECTORS FROM UH PAGES
       'td.instructor',
       '.course-instructor',
       'span[title*="Instructor"]',
     ],
     // ...
   };
   ```

   **Example**: If instructors appear in a table cell with class `schedule-instructor`, add:
   ```javascript
   'td.schedule-instructor',
   ```

5. **Reload the extension**:
   - Go to `chrome://extensions/`
   - Click the refresh icon (↻) on the CourseMate card
   - Reload the UH course page

#### Step 2: Verify Detection

1. Open the browser console (F12) on a UH course page
2. Look for logs like:
   ```
   [CourseMate] Found professor: Johnson, Sarah
   [CourseMate] Found 5 elements matching "td.instructor"
   ```

3. If no professors are detected, use the debug helpers:
   ```javascript
   // Check current selectors
   window.courseMateDebug.showSelectors();

   // Test a selector
   window.courseMateDebug.addSelector('your-new-selector');

   // Force a re-scan
   window.courseMateDebug.reset();
   ```

## Extension Settings

Click the extension icon in the Chrome toolbar to access settings:

### General Settings
- **Enable/Disable Extension** - Toggle the extension on/off
- **Default School** - Choose your UH campus (main, Downtown, Clear Lake, Victoria)

### Cache Settings
- **Cache Duration** - How long to remember professor ratings (1 hour to 30 days)
  - Recommended: 7 days (balances freshness with performance)

### Developer Settings
- **Debug Mode** - Enable detailed console logging for troubleshooting

### Actions
- **Save Settings** - Apply changes (some require page reload)
- **Clear Cache** - Remove all cached professor data

## File Structure

```
CourseMate-UH/
├── manifest.json          # Extension configuration (MV3)
├── background.js          # Service worker (data fetching, caching, rate limiting)
├── contentScript.js       # DOM manipulation and badge injection
├── ui.css                 # Badge styling
├── options.html           # Settings page UI
├── options.js             # Settings page logic
├── icons/                 # Extension icons (16x16, 48x48, 128x128)
│   └── README.txt         # Placeholder - add your PNG icons here
└── README.md              # This file
```

## Architecture

### Data Flow

```
┌─────────────────┐
│  UH Course Page │
└────────┬────────┘
         │ (1) Content script detects instructor names
         ▼
┌─────────────────┐
│ contentScript.js│
└────────┬────────┘
         │ (2) Sends request to background
         ▼
┌─────────────────┐
│  background.js  │ (3) Checks cache
└────────┬────────┘
         │ (4) If not cached, fetches from provider
         ▼
┌─────────────────┐
│  MockProvider   │ (or RealProvider in production)
└────────┬────────┘
         │ (5) Returns rating data
         ▼
┌─────────────────┐
│  Cache Storage  │ (chrome.storage.local)
└────────┬────────┘
         │ (6) Data returned to content script
         ▼
┌─────────────────┐
│  Badge Display  │ (UI injected next to professor name)
└─────────────────┘
```

### Key Components

#### 1. Content Script ([contentScript.js](contentScript.js))
- Scans the page for instructor names using configurable selectors
- Normalizes names (handles "Last, First", suffixes, middle initials)
- Injects badge elements next to instructor names
- Uses `MutationObserver` to detect dynamically loaded content
- Provides debug helpers for testing

#### 2. Background Service Worker ([background.js](background.js))
- Manages professor data requests
- Implements caching with configurable TTL
- Enforces rate limiting (1 request/second by default)
- Provides mock data provider for testing
- Handles message passing with content script

#### 3. Mock Data Provider
Currently includes sample data for:
- John Smith (4.2/5, 47 ratings)
- Sarah Johnson (4.8/5, 92 ratings)
- Robert Williams (3.5/5, 23 ratings)
- Emily Davis (4.6/5, 78 ratings)

**To add real RMP data**, replace `MockProvider` in [background.js](background.js:68) with your actual implementation.

## Replacing Mock Data with Real RMP

### TODO: Implement Real Provider

The extension is designed with a provider interface. To add real RateMyProfessors data:

1. **Option A: Use an RMP API** (if available)
   - Check for official/unofficial RMP APIs
   - Implement authentication if required
   - Follow rate limits and terms of service

2. **Option B: Implement search-based lookup**
   ```javascript
   const RMPProvider = {
     async search(normalizedName, school) {
       // 1. Construct search URL for RMP
       // 2. Fetch search results
       // 3. Parse HTML/JSON to find matching professor
       // 4. Extract rating data
       // 5. Return in standardized format:
       return {
         found: true,
         data: {
           name: 'Professor Name',
           overallRating: 4.5,
           numRatings: 100,
           wouldTakeAgainPercent: 85,
           difficulty: 3.2,
           rmpUrl: 'https://www.ratemyprofessors.com/...'
         }
       };
     }
   };
   ```

3. **Update the active provider** in [background.js](background.js:91):
   ```javascript
   const DataProvider = RMPProvider; // Change from MockProvider
   ```

### Important Considerations

️ **Legal & Ethical**
- Respect RateMyProfessors' terms of service
- Do not scrape aggressively (use rate limiting)
- Consider reaching out to RMP for official API access
- Comply with robots.txt

️ **Technical**
- Implement proper error handling
- Cache aggressively to minimize requests
- Handle CORS issues (may need background fetch)
- Test with various name formats and edge cases

## Debug Console Helpers

Open the browser console on any UH page to access these debugging tools:

```javascript
// Show current configuration
window.courseMateDebug.showSelectors();

// Test name extraction
window.courseMateDebug.testName('Smith, John');
window.courseMateDebug.testName('Sarah Johnson');

// Add a new selector and re-scan
window.courseMateDebug.addSelector('.your-selector');

// Force re-scan of the page
window.courseMateDebug.scan();

// Clear all processed elements and re-scan
window.courseMateDebug.reset();
```

## Test Checklist

Use this checklist to verify the extension is working correctly:

### Installation
- [ ] Extension appears in `chrome://extensions/`
- [ ] No errors shown in extension card
- [ ] Options page opens when clicking extension icon

### Basic Functionality (Mock Data)
- [ ] Create a test HTML page with instructor names
- [ ] Badges appear next to professor names
- [ ] Loading state shows briefly
- [ ] Mock professors (Smith, Johnson, Williams, Davis) show ratings
- [ ] Unknown professors show "?" badge
- [ ] Clicking badge opens (simulated) RMP page

### Settings Page
- [ ] Can toggle extension on/off
- [ ] Can change default school
- [ ] Can adjust cache duration
- [ ] Can enable debug mode
- [ ] "Clear Cache" button works
- [ ] Settings persist after closing/reopening

### Real UH Pages (After Selector Configuration)
- [ ] Navigate to UH course catalog/schedule
- [ ] Badges appear next to instructor names
- [ ] Console shows detection logs (if debug mode on)
- [ ] Multiple instructors on same page all get badges
- [ ] MutationObserver detects dynamically loaded content

### Edge Cases
- [ ] Handles "Last, First" format
- [ ] Handles "First Last" format
- [ ] Handles names with suffixes (Jr., III)
- [ ] Handles middle initials
- [ ] Ignores "TBA", "Staff", "Various"
- [ ] Works with ALL CAPS names
- [ ] Doesn't duplicate badges on re-scans

### Performance
- [ ] Page load time not significantly affected
- [ ] No visible lag when scrolling
- [ ] Cache reduces repeated requests (check Network tab)
- [ ] Rate limiting works (check timestamps in debug logs)

## Troubleshooting

### Badges Not Appearing

1. **Check if extension is enabled**
   - Open settings and verify "Enable Extension" is ON

2. **Verify you're on a UH page**
   - Extension only runs on `*.uh.edu` domains
   - Check `manifest.json` to add more domains if needed

3. **Check selectors**
   - Open console and run `window.courseMateDebug.showSelectors()`
   - Verify selectors match actual page structure
   - Use browser Inspector to find correct selectors

4. **Enable debug mode**
   - Turn on "Debug Mode" in settings
   - Reload page and check console for detection logs

### Wrong Professors Detected

- The selectors may be too broad
- Add exclusions in `SELECTORS.excludeElements`
- Refine name extraction patterns in `extractProfessorName()`

### Badge Styling Issues

- Check for CSS conflicts with page styles
- Inspect badge element and adjust [ui.css](ui.css)
- Increase specificity of selectors if needed

### Cache Not Working

- Open `chrome://extensions/` and check for errors
- Try "Clear Cache" in settings
- Check browser console for storage errors
- Verify `chrome.storage.local` permissions in manifest

## Development

### Making Changes

1. Edit files in the extension directory
2. Go to `chrome://extensions/`
3. Click refresh icon (↻) on CourseMate card
4. Reload any open UH pages to see changes

### Testing

```bash
# Open console on any page and test:
window.courseMateDebug.testName('Smith, John');  # Should return normalized name
window.courseMateDebug.scan();  # Force re-scan
```

### Adding Icons

The extension needs icons in three sizes. Create PNG files:

```bash
icons/
├── icon16.png   # 16x16 pixels (toolbar)
├── icon48.png   # 48x48 pixels (extension management)
└── icon128.png  # 128x128 pixels (Chrome Web Store)
```

Recommended: Use a graduation cap, star, or "RMP" text logo with school colors (currently UH).

## Privacy & Permissions

### Data Collection
- **None** - This extension does NOT collect any personal data
- All professor ratings are cached locally on your device
- No data is sent to third-party servers (except RMP when fetching ratings)

### Required Permissions

- **`storage`** - Store cached ratings and settings locally
- **`activeTab`** - Access current tab to inject badges
- **`https://*.uh.edu/*`** - Run on supported university course pages (currently UH)
- **`https://www.ratemyprofessors.com/*`** - Fetch professor ratings (when real provider is implemented)

## Contributing

Contributions welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Disclaimer

This extension is not affiliated with, endorsed by, or connected to:
- RateMyProfessors.com
- University of Houston
- Any UH campus or department

Use at your own discretion. Professor ratings are user-submitted and may not reflect actual teaching quality.

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/CourseMate-UH/issues)
- **Questions**: Open a discussion on GitHub
- **UH-specific help**: Check selectors for your specific catalog page

---

Made with care for UH students

**Version**: 1.0.0
**Last Updated**: 2026-01-06
