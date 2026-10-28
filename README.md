# Return Visits App

Return Visits is free to use, with no app fees or subscription. It is
intentionally a simple tool for maintaining contact details and tracking
return visits—not a full-featured contact-management app. It may have fewer
features or be less reliable than paid products. The app is provided as-is.
Your internet or mobile provider may charge for data, and third-party services
have their own terms.

It is a client-side contact and return-visit tracker that can be used in a
browser or installed as a Progressive Web App (PWA).

## Before you start

For regular phone use, we recommend adding the app to your Home Screen; it opens
like an app while keeping contacts locally on that device. The browser and Home
Screen versions may store separate data and do not automatically sync. Adding
the app icon does not transfer contacts already stored in the browser. If you
have already entered contacts in a browser, either keep using that browser or
export an encrypted backup and restore it in the Home Screen app before
switching. The app is free and has no online sync service, so keeping multiple
copies current requires manual backup/restore.

On iPhone, open the site in Safari, tap **Share → Add to Home Screen**, then
launch the Home Screen copy. If a link opens inside another app, use that app's
menu to choose **Open in Safari**; the website cannot choose the browser for
you. On Android, open the site in Chrome and choose **Install app** or
**Add to Home screen** from the browser menu. Do this before entering contacts
when possible, since browser and Home Screen copies may keep separate data.

## Data and passphrase

Contacts and settings are stored on the current browser and device in IndexedDB
and, when a passphrase is turned on, encrypted with AES-GCM. A passphrase is
optional: by default the app opens without one and stores data unencrypted. To
turn it on, use **Settings → Turn On Passphrase** and choose a passphrase of at
least 8 characters; it is then required whenever opening the app. There is no
passphrase recovery; if it is forgotten, the encrypted data cannot be unlocked.
Keep the passphrase safe and separate from any backup or contact file. Once on,
use **Settings → Change Passphrase** and verify the current passphrase first. To stop requiring
one, use **Settings → Turn Off Passphrase** (the current passphrase is needed
once to decrypt the data); it can be turned on again later.
The change does not affect other copies or previously exported backup files;
those backups continue to require the passphrase they were created with.

Developers can require a passphrase on first use by setting
`REQUIRE_PASSPHRASE_ON_FIRST_USE` to `true` in `app.js`.

Existing legacy browser data is migrated without a passphrase, or encrypted and
verified during migration if a passphrase is required, before plaintext copies
are removed. Data is not synchronized between browsers or
devices, and the app has no user account or server-side contact database.
Clearing browser data or losing a device can remove its local records, so keep
an encrypted backup.

## Contacts and visit logs

Add contacts with a required first name and optional last name, address, city,
region, area, map coordinates, email, and phone. Email and phone are optional;
email accepts addresses such as `name@someemail`, and U.S. phone numbers are
formatted as `(555) 123-4567`. City, Region, and Area are each single optional
values, so a contact can be saved with partial details and completed later. A
street address and newly entered location names are automatically capitalized
when you leave the field or save. Recognized U.S. state names are saved as
their standard two-letter abbreviations; two-letter state codes are uppercased.
Region belongs to one City, and an Area belongs to one Region. The contact
form's Area list always offers **+ Add New Area...**, even when other areas are
available for the selected City and Region. Each contact has a stable unique
ID, so different people can share the same name. The Region list also offers
**+ Add New Region...** for the selected City. Every new City is automatically
given the Regions North, South, East, and West. A Region is a large part of a
city and an Area is a neighborhood within it. In Settings, edit a City,
Region, or Area to rename it and update existing assignments. Deletion is
blocked while contacts or child locations still use that entry; reassign or
remove those first. Contact cards show available
phone and email details along with the address, location
hierarchy, urgency, and visit history; they include actions to edit, export,
delete, and navigate to a contact. Navigate opens Google Maps directions using
saved coordinates when available, or the contact address otherwise. Visit
cards also have a Share action for preparing a plain-text contact summary in
Text/SMS, WhatsApp, or Email. The summary includes available contact details
and a directions link, but not visit notes. This message is not encrypted by
the app; use the contact export action for encrypted app-to-app transfer. Visit
logs can be added from the contact form or quickly from a card, and existing
logs can be edited or deleted.

On the contacts page, **Print Visible Contacts** prints exactly the contacts
shown by the current search and filters. It confirms the number first, groups
each contact once under their most specific location (Area, then Region, then
City, then unassigned), and includes only the latest visit note. In **Edit
Contact**, **Print** offers **Most recent note only** (the default) or **All
notes**. Save any pending contact edits before printing; the Print button is
disabled while changes are unsaved. Print layouts omit app controls. Printing
uses the browser/device print dialog, where you can choose a printer or save as
PDF if that option is available.

Search matches names, email addresses, phone numbers, addresses, and visit
notes. The list can be filtered by urgency, city, region, and area, and sorted
newest first, oldest first, or alphabetically by first name. In the contact
form, Region is available only after choosing a City, and Area is available
only after choosing a Region.
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

Map coordinates are optional. In the contact form, choose **Find Address or
City Pin** to look up the entered address, city, and state, or **Use Device
Location** to request the device's current location. A partial street name can
return several possible matches; choose from the street-name choices, which
omit house numbers and ZIP codes, to fill in the street and place the pin.
Common street suffixes are displayed in abbreviated form, including for
contacts saved before this formatting was added (for example, Avenue as Av,
Road as Rd, Court as Ct, and Lane as Ln). If the full address is not found,
the app also searches by the street name without the leading house number. A
city-only lookup places an approximate pin near the city. Typing or saving
address details does not automatically create a pin.
Device location requires browser permission and
its accuracy can vary. Refine a pin in the contact form by tapping the map,
dragging the pin, or editing the coordinates. Pins can also be dragged in Map
view; those changes save automatically. The map shows pins only for contacts
matching the current search and filters, and indicates when matching contacts
have no saved coordinates. Whenever the Map is open with no visible contact
pins, it centers approximately on the Default City and State from Settings.

Address text (including partial street-name and city searches) and cross-street
text are sent to OpenStreetMap Nominatim when you choose the corresponding
search button. Whenever the Map is open with no visible contact pins, the saved
default City and State are also sent to Nominatim to center the map. Leaflet
map assets, map tiles, and location searches require internet access. The app
shell may work offline after it has been cached, but the map and address
search are not available offline.
Choosing Navigate sends that contact's saved coordinates or address to Google
Maps to open directions.

## Full backup and restore

Choose **Settings → Export Data Backup** to download a JSON backup
(encrypted when a passphrase is on) of all contacts and settings. The browser saves it to its usual download
location—for example, **Files → Downloads** on iPhone or the browser’s
**Downloads** location on other devices. The app cannot choose a save folder.

To restore, select the backup and, if it is encrypted, enter the passphrase used
for it. Restore
replaces the current local contacts and settings only after confirmation. On a
new device, you can choose **Choose Backup to Restore** on the initial unlock
screen; the restored backup’s passphrase becomes the passphrase for that
device. Older unencrypted full-app backups are supported and encrypted when
imported, with a warning.

Full backups cannot be merged directly. To combine several browser or app
copies, choose one as the base and import individual contacts from the other
copies using **Settings → Share a Contact**. Check for missing or duplicate
contacts, create a fresh backup of the combined destination, then clear unused
source data. See the [User Guide](./help.html) for a step-by-step consolidation
and data-removal checklist.

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

## Stop using the app and remove data

Browser and Home Screen app copies may store data separately, so removing one
copy may not remove another. To remove the Safari browser copy on iPhone or
iPad, go to **iOS Settings → Safari → Advanced → Website Data** and delete
`grasfulls.github.io`. To remove a separate Home Screen app copy, touch and
hold its icon, choose **Remove App**, then **Delete App**. In Chrome on
Android, use the site's **Clear data** or **Clear & reset** setting, or find it
under **Settings → Site settings → All sites**. Menu names may vary by
version. Repeat for every browser and device used. Downloaded backups,
exported contact files, PDFs, and printed pages are separate; delete those
wherever you saved or shared them.

## Install and updates

The app is published on GitHub Pages:

**https://grasfulls.github.io/return-visits-app/**

The app checks for updates when it opens and shows any update prompt once it has
finished opening (after unlocking, if a passphrase is on). If an update is ready, it prompts you to update now or later; an
exclamation mark also appears by Settings. To check or refresh manually, open
**Settings → Check for Updates & Refresh** while online. Save or finish any
open contact or Settings edits before refreshing. The app reloads its code
while keeping the contacts and settings stored in that app copy on the device.
After the reload, unlock with the same passphrase if one is turned on.

The plain-language user guide is available from **Settings → Read the
plain-language User Guide** or directly at
**https://grasfulls.github.io/return-visits-app/help.html**. It is an
accessible, responsive HTML page that can be read in a standard web browser.
PDF and Word copies are in the [docs/](./docs) folder and linked from the page.

The **Privacy & Data Notice** is available from Settings or directly at
**https://grasfulls.github.io/return-visits-app/privacy.html**. The page also
provides downloadable PDF and Word copies. It explains what information the app stores
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
