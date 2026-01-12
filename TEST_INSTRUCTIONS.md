# Testing Instructions for CourseMate UH

## Step 1: Reload the Extension

1. Go to `chrome://extensions/`
2. Find "CourseMate UH - RateMyProfessors for UH"
3. Click the **Reload** button (↻ icon)
4. Look for any errors in the extension card

## Step 2: Check Service Worker Status

1. Still on `chrome://extensions/`
2. Look for a link that says **"Inspect views: service worker"** under CourseMate UH
3. Click on it to open the service worker console
4. You should see: `[Background] Service worker started`
5. **Leave this console window open**

## Step 3: Test on UH Page

1. Go to your UH class search page:
   `https://saprd.my.uh.edu/psc/saprd_14/UHM_SITE/SA/c/SSR_STUDENT_FL.SSR_MD_CRSEINFO_FL.GBL`

2. Open the browser console (F12)

3. You should see logs like:
   ```
   [CourseMate UH] Extension loaded!
   [CourseMate UH] Loaded X cached professors
   [CourseMate UH] Scanning page for instructors...
   [CourseMate UH] Found X potential instructors
   ```

4. Look for messages like:
   ```
   [CourseMate UH] Sending message to background for: Wu-Pei Su
   [CourseMate UH] Received response from background: {...}
   ```

## Step 4: Check Both Consoles

**In the UH page console**, you should see:
- `[CourseMate UH] Processing: [name]`
- `[CourseMate UH] Sending message to background for: [name]`
- `[CourseMate UH] Received response from background: {...}`

**In the service worker console** (from Step 2), you should see:
- `[Background] Received message: getProfessorData`
- `[Background] Fetching professor data for: [name]`
- `[Background] Sending response: {...}`

## Step 5: Manual Test

In the **UH page console** (not service worker console), run:

```javascript
chrome.runtime.sendMessage({
    action: 'ping'
}, (response) => {
    if (chrome.runtime.lastError) {
        console.error('Connection error:', chrome.runtime.lastError.message);
    } else {
        console.log('Ping response:', response);
    }
});
```

**Expected result:** `Ping response: { status: 'alive' }`

If you get an error, the service worker is not responding.

## Step 6: Test Actual Professor Lookup

In the **UH page console**, run:

```javascript
chrome.runtime.sendMessage({
    action: 'getProfessorData',
    professorName: 'Wu-Pei Su',
    school: 'University of Houston'
}, (response) => {
    if (chrome.runtime.lastError) {
        console.error('Connection error:', chrome.runtime.lastError.message);
    } else {
        console.log('Professor data:', response);
    }
});
```

Watch the **service worker console** for corresponding logs.

## Common Issues and Fixes

### Issue: "Could not establish connection"
**Cause:** Service worker is not active
**Fix:**
1. Go to `chrome://extensions/`
2. Click "Inspect views: service worker" to activate it
3. Reload the UH page

### Issue: Service worker console shows nothing
**Cause:** Service worker hasn't started
**Fix:**
1. Reload the extension
2. Click "Inspect views: service worker" to force it to start
3. You should see `[Background] Service worker started`

### Issue: Badges show "N/A (0)"
**Possible causes:**
1. Service worker not responding (test with ping command above)
2. RMP API not finding the professor
3. Rate limiting or API errors

Check the service worker console for:
- `[Background] Fetching from RMP API: [name]`
- Any error messages

### Issue: No badges appear at all
**Cause:** Selectors not matching
**Fix:**
1. In UH page console, run: `window.profPeekDebug.scan()`
2. Look for: `[CourseMate UH] Found X potential instructors`
3. If 0, the selector is wrong

## Report Back

After following these steps, report:
1. What you see in the service worker console
2. What you see in the UH page console
3. Any errors in either console
4. Whether the ping test worked
5. What the actual professor lookup returned
