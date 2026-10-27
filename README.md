# return-visits-app
A custom contact and return visit tracker app

Contact records and settings are encrypted with AES-GCM in IndexedDB on the
current device and browser. On first use, create a passphrase; existing browser
data is encrypted and verified before plaintext copies are removed. Enter the
same passphrase whenever opening the app. There is no passphrase recovery, so
keep it safe.

Use **Settings → Export Data Backup** to download an encrypted JSON backup.
Restore it on another device from **Settings → Restore Selected Backup** using
the backup's passphrase, or choose **Choose Backup to Restore** on the initial
unlock screen on a new device. Restoring replaces current local data only after
confirmation. Older unencrypted backup files are also supported and are
encrypted when imported. The app reminds users monthly to export a backup.
The app does not synchronize data between devices.

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
