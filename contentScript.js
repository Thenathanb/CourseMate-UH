/**
 * Content Script - Detects professor names and injects rating badges
 * Works on University of Houston course catalog and schedule pages
 */

// Configuration for DOM selectors
const SELECTORS = {
  // TODO: Update these selectors based on actual UH course catalog pages
  // Common patterns to look for:
  // - Table cells with instructor names
  // - Spans/divs with class names like "instructor", "faculty", "professor"
  // - Elements within course listings

  instructorElements: [
    // UH-specific selectors (PeopleSoft system)
    'span.ps_box-value[id*="SSR_INSTR_LONG"]',  // Most specific - targets instructor fields
    '.ps_box-value',                             // Broader fallback for other PeopleSoft pages

    // Generic selectors (fallback for other pages)
    '.instructor-name',          // Class-based selector
    '.faculty-name',
    '[data-instructor]',         // Data attribute selector
    'td.instructor',             // Table cell with class
    '.course-instructor',
    'span[title*="Instructor"]', // Attribute contains

    // Generic fallback (be careful with these - they may match too much)
    // Uncomment and test carefully:
    // 'td:nth-child(4)',        // If instructors are always in 4th column
    // '.schedule-row .instructor'
  ],

  // Elements to exclude (navigation, headers, etc.)
  excludeElements: [
    'nav',
    'header',
    'footer',
    '.navigation',
    '.menu'
  ]
};

// Track processed elements to avoid duplicates
const processedElements = new WeakSet();

// Track active badges
const activeBadges = new Map();

/**
 * Extract professor name from element
 */
function extractProfessorName(element) {
  let text = element.textContent.trim();

  // Skip empty or very short text
  if (!text || text.length < 3) return null;

  // Skip common non-name patterns
  const skipPatterns = [
    /^(TBA|TBD|Staff|Various|Multiple|Online)$/i,
    /^\d+$/,  // Just numbers
    /^[A-Z]{2,5}\s*\d{4}$/,  // Course codes like "CS 1234"
  ];

  for (const pattern of skipPatterns) {
    if (pattern.test(text)) return null;
  }

  // Look for name patterns
  // Matches: "Last, First", "First Last", "First M. Last"
  const namePatterns = [
    /^([A-Z][a-z]+),\s*([A-Z][a-z]+)/,  // Last, First
    /^([A-Z][a-z]+)\s+([A-Z]\.?\s+)?([A-Z][a-z]+)$/,  // First M. Last or First Last
    /^([A-Z\s]+),\s*([A-Z\s]+)$/  // ALL CAPS: LAST, FIRST
  ];

  for (const pattern of namePatterns) {
    if (pattern.test(text)) {
      return text;
    }
  }

  return null;
}

/**
 * Check if element should be excluded
 */
function shouldExclude(element) {
  // Check if element or any parent matches exclude selectors
  for (const selector of SELECTORS.excludeElements) {
    if (element.closest(selector)) {
      return true;
    }
  }

  // Check if already processed
  if (processedElements.has(element)) {
    return true;
  }

  return false;
}

/**
 * Create loading badge
 */
function createLoadingBadge() {
  const badge = document.createElement('span');
  badge.className = 'prof-peek-badge prof-peek-loading';
  badge.textContent = '...';
  badge.title = 'Loading professor rating...';
  return badge;
}

/**
 * Create rating badge
 */
function createRatingBadge(data) {
  const badge = document.createElement('span');
  badge.className = 'prof-peek-badge prof-peek-found';

  const rating = data.overallRating.toFixed(1);
  const ratingClass = rating >= 4.0 ? 'rating-high' : rating >= 3.0 ? 'rating-medium' : 'rating-low';

  badge.innerHTML = `
    <span class="rating ${ratingClass}">${rating}</span>
    <span class="rating-count">(${data.numRatings})</span>
  `;

  // Build detailed tooltip
  const tooltipParts = [
    `Overall: ${rating}/5.0`,
    `${data.numRatings} ratings`
  ];

  if (data.wouldTakeAgainPercent !== undefined) {
    tooltipParts.push(`Would take again: ${data.wouldTakeAgainPercent}%`);
  }

  if (data.difficulty !== undefined) {
    tooltipParts.push(`Difficulty: ${data.difficulty.toFixed(1)}/5.0`);
  }

  tooltipParts.push('\nClick to view on RateMyProfessors');
  badge.title = tooltipParts.join('\n');

  // Click handler to open RMP page
  badge.style.cursor = 'pointer';
  badge.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (data.rmpUrl) {
      window.open(data.rmpUrl, '_blank');
    }
  });

  return badge;
}

/**
 * Create "not found" badge
 */
function createNotFoundBadge() {
  const badge = document.createElement('span');
  badge.className = 'prof-peek-badge prof-peek-not-found';
  badge.textContent = '?';
  badge.title = 'No ratings found on RateMyProfessors';
  return badge;
}

/**
 * Create error badge
 */
function createErrorBadge(message) {
  const badge = document.createElement('span');
  badge.className = 'prof-peek-badge prof-peek-error';
  badge.textContent = '!';
  badge.title = `Error: ${message}`;
  return badge;
}

/**
 * Insert badge next to professor name
 */
function insertBadge(element, badge) {
  // Check if badge already exists
  const existingBadge = element.querySelector('.prof-peek-badge');
  if (existingBadge) {
    existingBadge.replaceWith(badge);
  } else {
    // Insert badge after the text content
    element.style.position = 'relative';
    element.appendChild(document.createTextNode(' '));
    element.appendChild(badge);
  }
}

/**
 * Process a single professor name element
 */
async function processProfessorElement(element) {
  // Skip if already processed or should be excluded
  if (shouldExclude(element)) {
    return;
  }

  const professorName = extractProfessorName(element);
  if (!professorName) {
    return;
  }

  // Mark as processed
  processedElements.add(element);

  console.log(`[CourseMate UH] Found professor: ${professorName}`);

  // Insert loading badge
  const loadingBadge = createLoadingBadge();
  insertBadge(element, loadingBadge);

  try {
    // Request data from background script
    const response = await chrome.runtime.sendMessage({
      action: 'getProfessorData',
      professorName: professorName,
      school: 'University of Houston'
    });

    let finalBadge;

    if (response.error) {
      finalBadge = createErrorBadge(response.error);
    } else if (response.found && response.data) {
      finalBadge = createRatingBadge(response.data);
    } else {
      finalBadge = createNotFoundBadge();
    }

    // Replace loading badge with final badge
    insertBadge(element, finalBadge);

  } catch (error) {
    console.error('[CourseMate UH] Error processing professor:', error);
    const errorBadge = createErrorBadge(error.message);
    insertBadge(element, errorBadge);
  }
}

/**
 * Scan page for professor names
 */
function scanPage() {
  console.log('[CourseMate UH] Scanning page for professors...');

  for (const selector of SELECTORS.instructorElements) {
    try {
      const elements = document.querySelectorAll(selector);
      console.log(`[CourseMate UH] Found ${elements.length} elements matching "${selector}"`);

      elements.forEach(element => {
        processProfessorElement(element);
      });
    } catch (error) {
      console.error(`[CourseMate UH] Error with selector "${selector}":`, error);
    }
  }
}

/**
 * Initialize MutationObserver to watch for dynamic content
 */
function initMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    let shouldScan = false;

    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any added nodes might contain instructor info
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            shouldScan = true;
            break;
          }
        }
      }
    }

    if (shouldScan) {
      console.log('[CourseMate UH] DOM changed, re-scanning...');
      // Debounce scanning
      clearTimeout(window.profPeekScanTimeout);
      window.profPeekScanTimeout = setTimeout(scanPage, 500);
    }
  });

  // Observe the entire document body
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('[CourseMate UH] MutationObserver initialized');
}

/**
 * Initialize content script
 */
function init() {
  console.log('[CourseMate UH] Content script loaded');

  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
    return;
  }

  // Initial scan
  scanPage();

  // Watch for dynamic changes
  initMutationObserver();

  // Re-scan when page visibility changes (in case content loaded while tab was hidden)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      console.log('[CourseMate UH] Page became visible, re-scanning...');
      scanPage();
    }
  });
}

// Start the extension
init();

/**
 * TESTING HELPER FUNCTIONS
 * These can be called from the browser console for debugging
 */
window.profPeekDebug = {
  // Force re-scan
  scan: scanPage,

  // Test name extraction
  testName: (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return extractProfessorName(div);
  },

  // Show current selectors
  showSelectors: () => {
    console.log('Current selectors:', SELECTORS);
  },

  // Add custom selector
  addSelector: (selector) => {
    SELECTORS.instructorElements.push(selector);
    console.log(`Added selector: ${selector}`);
    scanPage();
  },

  // Clear processed cache and re-scan
  reset: () => {
    processedElements.clear();
    activeBadges.clear();
    // Remove existing badges
    document.querySelectorAll('.prof-peek-badge').forEach(b => b.remove());
    scanPage();
  }
};

console.log('[CourseMate UH] Debug helpers available: window.profPeekDebug');
