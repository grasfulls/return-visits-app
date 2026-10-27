# return-visits-app
A custom contact and return visit tracker app

Contact records and settings are stored in IndexedDB on the current device and
browser. On first load, existing data is copied from the app's local storage;
the original local-storage values are left in place. Use **Settings → Export
Data Backup** to download a JSON backup. The app does not synchronize data
between devices, and the backup file contains private contact information.
