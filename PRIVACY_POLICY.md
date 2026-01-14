# Privacy Policy for CourseMate

**Last Updated:** January 14, 2026

## Overview

CourseMate is committed to protecting your privacy. This extension is designed to enhance your course selection experience on supported university course pages without collecting any personal information.

## Data Collection

**CourseMate does NOT collect, store, or transmit any personal information.**

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

2. **Grade Distribution Cache**: CougarGrades grade distribution data is cached in your browser's local storage to reduce repeat requests. This cache includes:
   - Course codes
   - Grade distribution counts and percentages
   - Average GPA (when available)

3. **Extension Settings**: User preferences such as whether debug mode is enabled.

All data is stored locally using Chrome's `chrome.storage.local` API and **never leaves your device**.

## Third-Party Services

CourseMate fetches public professor data from RateMyProfessors.com's public GraphQL API and grade distribution data from CougarGrades public datasets. When you view a supported course page:

1. The extension identifies professor names on the page
2. It queries RateMyProfessors' public API for ratings and reviews
3. It queries CougarGrades public datasets for grade distributions
4. The results are displayed on your page and cached locally

**No personal information is sent to external services.** Only professor names, course codes, and the relevant school ID for the supported institution are used in API queries.

## Permissions

CourseMate requests the following permissions:

- **`storage`**: To cache professor ratings locally in your browser for faster performance
- **`activeTab`**: To access and modify course catalog pages on supported university domains (currently *.uh.edu)
- **`host_permissions` for *.uh.edu**: To run the extension only on supported university websites (currently University of Houston)
- **`host_permissions` for www.ratemyprofessors.com**: To fetch professor ratings from the RateMyProfessors API
- **`host_permissions` for cougargrades.io and unpkg.com**: To fetch grade distribution data from CougarGrades public datasets

## Data Sharing

**CourseMate does NOT share, sell, or transmit any data to third parties.**

The extension operates entirely within your browser. The only external communication is with RateMyProfessors' public API and CougarGrades public datasets to fetch ratings, reviews, and grade distributions.

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

**CourseMate is not affiliated with or endorsed by the University of Houston, RateMyProfessors.com, or CougarGrades.io.**
