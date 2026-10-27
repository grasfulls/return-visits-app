# return-visits-app
A custom contact and return visit tracker app

Contact records and settings are stored in IndexedDB on the current device and
browser. On first load, existing data is copied from the app's local storage;
the original local-storage values are left in place. Use **Settings → Export
Data Backup** to download a JSON backup. The app does not synchronize data
between devices, and the backup file contains private contact information.

The contact map requests the device's location when adding a contact. You can
also search for an entered address with OpenStreetMap Nominatim; that address
is sent to Nominatim only when you choose **Find Address on Map**. The map pin
can be moved by tapping the map or dragging the marker.

The app is installable as a Progressive Web App (PWA) from its GitHub Pages
address. On iPhone, open the site in Safari, tap **Share**, then **Add to Home
Screen**. On Android, open the site in Chrome and choose **Install app** or
**Add to Home screen**. The service worker caches the app shell and updates
cached files when they are next requested online; maps and address searches
still need internet access. Updates are published through GitHub Pages.
