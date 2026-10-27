# Return Visits App

A client-side contact and return-visit tracker that can be used in a browser or
installed as a Progressive Web App (PWA).

## Before you start

For regular phone use, we recommend adding the app to your Home Screen; it opens
like an app while keeping contacts locally on that device. The browser and Home
Screen versions may store separate data and do not automatically sync. Adding
the app icon does not transfer contacts already stored in the browser. If you
have already entered contacts in a browser, either keep using that browser or
export an encrypted backup and restore it in the Home Screen app before
switching. The app is free and has no online sync service, so keeping multiple
copies current requires manual backup/restore.

## Data and passphrase

Contacts and settings are stored on the current browser and device in IndexedDB
and encrypted with AES-GCM. On first use, create and confirm a passphrase of at
least 8 characters. Enter the same passphrase whenever opening the app. There
is no passphrase recovery; if it is forgotten, the encrypted data cannot be
unlocked. Keep the passphrase safe and separate from any backup or contact file.
To change it for the current browser or Home Screen copy, use **Settings →
Change Passphrase** and verify the current passphrase first. The change does
not affect other copies or previously exported backup files; those backups
continue to require the passphrase they were created with.

Existing legacy browser data is encrypted and verified during migration before
plaintext copies are removed. Data is not synchronized between browsers or
devices, and the app has no user account or server-side contact database.
Clearing browser data or losing a device can remove its local records, so keep
an encrypted backup.

## Contacts and visit logs

Add contacts with a required first name and optional last name, address, city,
region, area, and map coordinates. City, Region, and Area are each single
optional values, so a contact can be saved with partial details and completed
later. A Region belongs to one City, and an Area belongs to one Region. Phone
and email fields are not currently available. Each contact has a stable unique
ID, so different people can share the same name. Contact cards show the
address, location hierarchy, urgency, and visit history; they include actions
to edit, export, and delete a contact. Visit logs can be added from the contact
form or quickly from a card, and existing logs can be edited or deleted.

On the contacts page, **Print Visible Contacts** prints exactly the contacts
shown by the current search and filters. It confirms the number first, groups
each contact once under their most specific location (Area, then Region, then
City, then unassigned), and includes only the latest visit note. In **Edit
Contact**, **Print** offers **Most recent note only** (the default) or **All
notes**. Save any pending contact edits before printing; the Print button is
disabled while changes are unsaved. Print layouts omit app controls. Printing
uses the browser/device print dialog, where you can choose a printer or save as
PDF if that option is available.

Search matches names, addresses, and visit notes. The list can be filtered by
urgency, city, region, and area, and sorted newest first, oldest first, or
alphabetically by first name. In the contact form, Region is available only
after choosing a City, and Area is available only after choosing a Region.
Settings lets you create regions under cities and areas under regions. Filters
follow the same hierarchy. During migration from the earlier multiple-area
format, a contact keeps its first listed area and drops other area assignments;
the contact's unique ID, visit history, and other details are preserved.
Legacy area-list strings are placed under an **Unassigned** region for review
and later editing.
Urgency is based on the most recent visit log, or the contact creation date if
there are no logs:

- **Normal:** 0–7 days
- **Urgent:** 8–14 days
- **Immediate:** 15 or more days

## Location and privacy

Map coordinates are optional. To add or update them, use device GPS, enter an
address and select **Find Address on Map**, tap the map, or drag the pin.
Device location requires browser permission. The map shows pins only for
contacts matching the current search and filters.

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

The plain-language user guide is available from **Settings → Read the
plain-language User Guide** or directly at
**https://grasfulls.github.io/return-visits-app/help.html**. It is an
accessible, responsive HTML page that can be read in a standard web browser.

The **Privacy & Data Notice** is available from Settings or directly at
**https://grasfulls.github.io/return-visits-app/privacy.html**. The page also
provides a downloadable Word copy. It explains what information the app stores
on the user's device, what may be sent to hosting and mapping providers, and
that the app owner does not collect information identifying who downloads or
uses the app.

PWA installation is optional. On iPhone, open the site in Safari, tap **Share**,
then **Add to Home Screen**. On Android, open it in Chrome and choose **Install
app** or **Add to Home screen**.

The browser version and Home Screen app do not automatically sync local
contacts. Installing the app does not transfer data already stored in the
browser. To move contacts, export an encrypted backup in the source version and
restore it in the destination version. Keep the source copy until the restored
contacts are confirmed; later changes do not sync between the copies.
The app is free to use and has no online sync service. For simpler day-to-day
use, choose one browser or Home Screen app on one device as your regular copy;
maintaining multiple copies requires manual backup/restore, and restoring a
full backup replaces the destination copy's contacts and settings.

The service worker caches the same-origin app shell and updates cached files
when they are next requested online. Maps and address searches still need
internet access. Changes go live after they are pushed to GitHub and the Pages
deployment completes. GitHub Pages and third-party services are subject to
their providers’ terms and availability.
