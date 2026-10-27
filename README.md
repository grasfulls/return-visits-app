# Return Visits App

A client-side contact and return-visit tracker that can be used in a browser or
installed as a Progressive Web App (PWA).

## Data and passphrase

Contacts and settings are stored on the current browser and device in IndexedDB
and encrypted with AES-GCM. On first use, create and confirm a passphrase of at
least 8 characters. Enter the same passphrase whenever opening the app. There
is no passphrase recovery; if it is forgotten, the encrypted data cannot be
unlocked. Keep the passphrase safe and separate from any backup or contact file.

Existing legacy browser data is encrypted and verified during migration before
plaintext copies are removed. Data is not synchronized between browsers or
devices, and the app has no user account or server-side contact database.
Clearing browser data or losing a device can remove its local records, so keep
an encrypted backup.

## Contacts and visit logs

Add contacts with a required first name, optional last name, address, city,
state, area, and map coordinates. Phone and email fields are not currently
available. Contact cards show the address, urgency, and visit history; they
include actions to edit, export, and delete a contact. Visit logs can be added
from the contact form or quickly from a card, and existing logs can be edited
or deleted.

Search matches names, addresses, and visit notes. The list can be filtered by
urgency, city, and area, and sorted newest first, oldest first, or
alphabetically by first name. Urgency is based on the most recent visit log, or
the contact creation date if there are no logs:

- **Normal:** 0–7 days
- **Urgent:** 8–14 days
- **Immediate:** 15 or more days

## Location and privacy

When adding a contact, the app requests device location to position the initial
map pin. You can instead enter an address and select **Find Address on Map**,
tap the map, or drag the pin. A valid location is required to save a contact.
Device location requires browser permission.

Address text is sent to OpenStreetMap Nominatim only when you choose **Find
Address on Map**. Leaflet map assets, map tiles, and address searches require
internet access. The app shell may work offline after it has been cached, but
the map and address search are not available offline.

## Full backup and restore

Choose **Settings → Export Data Backup** to download an encrypted JSON backup
of all contacts and settings. The browser saves it to its usual download
location—for example, **Files → Downloads** on iPhone or the browser’s
**Downloads** location on other devices. The app cannot choose a save folder.

To restore, select the backup and enter the passphrase used for it. Restore
replaces the current local contacts and settings only after confirmation. On a
new device, you can choose **Choose Backup to Restore** on the initial unlock
screen; the restored backup’s passphrase becomes the passphrase for that
device. Older unencrypted full-app backups are supported and encrypted when
imported, with a warning.

The app prompts for a backup about once a month after initial setup, and only
when the device has at least one contact. It does not create or upload backups
automatically.

## Share one contact

Select the download button on a contact card to export that contact, including
its visit history, as an encrypted file. Create a separate sharing passphrase
of at least 8 characters and give it to the recipient through a different
channel from the file.

The recipient can use the regular website or install the PWA. In **Settings →
Share a Contact**, select the file, enter its sharing passphrase, and confirm
the import. It adds a new contact without replacing existing contacts and
stores it encrypted using the recipient device’s passphrase.

## Install and updates

The app is published on GitHub Pages:

**https://grasfulls.github.io/return-visits-app/**

PWA installation is optional. On iPhone, open the site in Safari, tap **Share**,
then **Add to Home Screen**. On Android, open it in Chrome and choose **Install
app** or **Add to Home screen**.

The service worker caches the same-origin app shell and updates cached files
when they are next requested online. Maps and address searches still need
internet access. Changes go live after they are pushed to GitHub and the Pages
deployment completes. GitHub Pages and third-party services are subject to
their providers’ terms and availability.
