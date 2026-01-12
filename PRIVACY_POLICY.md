# Privacy Policy for CourseMate UH

**Last Updated:** January 11, 2026

## Overview

CourseMate UH is committed to protecting your privacy. This extension is designed to enhance your course selection experience without collecting any personal information.

## Data Collection

**CourseMate UH does NOT collect, store, or transmit any personal information.**

Specifically, we do NOT collect:
- Your name, email, or contact information
- Your browsing history
- Your search queries
- Your course selections
- Any personally identifiable information (PII)

## Data Storage

The extension stores the following data **locally on your device only**:

1. **Professor Ratings Cache**: RateMyProfessors ratings are cached in your browser's local storage for 7 days to improve performance and reduce API calls. This cache includes:
   - Professor names
   - Overall ratings
   - Number of ratings
   - Difficulty scores
   - "Would take again" percentages
   - RateMyProfessors profile URLs

2. **Extension Settings**: User preferences such as whether debug mode is enabled.

All data is stored locally using Chrome's `chrome.storage.local` API and **never leaves your device**.

## Third-Party Services

CourseMate UH fetches public professor rating data from RateMyProfessors.com's public GraphQL API. When you view a course page:

1. The extension identifies professor names on the page
2. It queries RateMyProfessors' public API for ratings
3. The results are displayed on your page and cached locally

**No personal information is sent to RateMyProfessors.** Only professor names and the University of Houston school ID are used in API queries.

## Permissions

CourseMate UH requests the following permissions:

- **`storage`**: To cache professor ratings locally in your browser for faster performance
- **`activeTab`**: To access and modify course catalog pages on *.uh.edu domains
- **`host_permissions` for *.uh.edu**: To run the extension only on University of Houston websites
- **`host_permissions` for www.ratemyprofessors.com**: To fetch professor ratings from the RateMyProfessors API

## Data Sharing

**CourseMate UH does NOT share, sell, or transmit any data to third parties.**

The extension operates entirely within your browser. The only external communication is with RateMyProfessors.com's public API to fetch ratings.

## Changes to This Policy

We may update this privacy policy from time to time. Any changes will be reflected in the "Last Updated" date above and posted in the extension's listing on the Chrome Web Store.

## Contact

If you have questions about this privacy policy, please contact us through the Chrome Web Store support page or GitHub repository.

## Your Rights

You can:
- **Clear cached data**: Click the extension icon and use the "Clear Cache" button
- **Disable the extension**: Turn it off in Chrome's extension settings
- **Uninstall**: Remove the extension completely from your browser

All locally stored data will be deleted when you uninstall the extension.

---

**CourseMate UH is not affiliated with or endorsed by the University of Houston or RateMyProfessors.com.**
