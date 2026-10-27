const DEFAULT_SETTINGS = {
  state: "CA",
  defaultCity: "Newcastle",
  defaultArea: "Downtown",
  cities: ["Newcastle", "Rocklin", "Roseville", "Auburn"],
  areas: ["Downtown", "Rural", "North", "South"],
};

const openAppDatabase = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open("return-visits-app", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("appData", { keyPath: "key" });
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  });

const readStoredValue = (database, key) =>
  new Promise((resolve, reject) => {
    const transaction = database.transaction("appData", "readonly");
    const request = transaction.objectStore("appData").get(key);
    request.onsuccess = () => resolve(request.result?.value);
    request.onerror = () => reject(request.error);
    transaction.onabort = () => reject(transaction.error);
  });

const writeStoredValue = (database, key, value) =>
  new Promise((resolve, reject) => {
    const transaction = database.transaction("appData", "readwrite");
    transaction.objectStore("appData").put({ key, value });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });

const parseLegacyValue = (key) => {
  const value = localStorage.getItem(key);
  return value === null ? undefined : JSON.parse(value);
};

const initializeAppData = async () => {
  const database = await openAppDatabase();
  const [storedSettings, storedContacts] = await Promise.all([
    readStoredValue(database, "settings"),
    readStoredValue(database, "contacts"),
  ]);
  const settings =
    storedSettings ??
    parseLegacyValue("return_visits_settings") ??
    DEFAULT_SETTINGS;
  const contacts =
    storedContacts ??
    parseLegacyValue("return_visits_contacts") ??
    [];

  if (storedSettings === undefined) {
    await writeStoredValue(database, "settings", settings);
  }
  if (storedContacts === undefined) {
    await writeStoredValue(database, "contacts", contacts);
  }

  return { database, settings, contacts };
};

const showStorageError = (action, error) => {
  console.error(`Unable to ${action}:`, error);
  alert(
    `Could not ${action}. Your changes may not have been saved. Please try again.`,
  );
};

const initializeApp = async () => {
  const { database, settings: savedSettings, contacts: savedContacts } =
    await initializeAppData();

  // Settings State & Lists
  let settings = savedSettings;
  const saveSettings = () => writeStoredValue(database, "settings", settings);

  // Populate Settings View Form
  document.getElementById("setting-state").value = settings.state;
  document.getElementById("setting-default-city").value =
    settings.defaultCity || "Newcastle";
  document.getElementById("setting-default-area").value =
    settings.defaultArea || "Downtown";

  // Populate All Dropdowns (Filters & Modal Selects)
  const populateDropdowns = () => {
    const citySelect = document.getElementById("contact-city-select");
    const currentCityVal = citySelect.value;
    citySelect.innerHTML = "";
    settings.cities.forEach((city) => {
      const opt = document.createElement("option");
      opt.value = city;
      opt.textContent = city;
      citySelect.appendChild(opt);
    });
    const addCityOpt = document.createElement("option");
    addCityOpt.value = "__ADD_NEW__";
    addCityOpt.textContent = "+ Add New City...";
    citySelect.appendChild(addCityOpt);
    if (settings.cities.includes(currentCityVal)) {
      citySelect.value = currentCityVal;
    }

    const areaSelect = document.getElementById("contact-area-select");
    const currentAreaVal = areaSelect.value;
    areaSelect.innerHTML = "";
    settings.areas.forEach((area) => {
      const opt = document.createElement("option");
      opt.value = area;
      opt.textContent = area;
      areaSelect.appendChild(opt);
    });
    const addAreaOpt = document.createElement("option");
    addAreaOpt.value = "__ADD_NEW__";
    addAreaOpt.textContent = "+ Add New Area...";
    areaSelect.appendChild(addAreaOpt);
    if (settings.areas.includes(currentAreaVal)) {
      areaSelect.value = currentAreaVal;
    }

    const filterCity = document.getElementById("filter-city");
    const currentCityFilter = filterCity.value;
    filterCity.innerHTML = '<option value="">All Cities</option>';
    settings.cities.forEach((city) => {
      const opt = document.createElement("option");
      opt.value = city;
      opt.textContent = city;
      filterCity.appendChild(opt);
    });
    filterCity.value = currentCityFilter;

    const filterArea = document.getElementById("filter-area");
    const currentAreaFilter = filterArea.value;
    filterArea.innerHTML = '<option value="">All Areas</option>';
    settings.areas.forEach((area) => {
      const opt = document.createElement("option");
      opt.value = area;
      opt.textContent = area;
      filterArea.appendChild(opt);
    });
    filterArea.value = currentAreaFilter;
  };

  populateDropdowns();

  // Inline "Add New City" Handlers
  const citySelect = document.getElementById("contact-city-select");
  const newCityContainer = document.getElementById("new-city-container");
  const inputNewCity = document.getElementById("input-new-city");

  citySelect.addEventListener("change", (e) => {
    if (e.target.value === "__ADD_NEW__") {
      newCityContainer.style.display = "block";
      inputNewCity.value = "";
      inputNewCity.focus();
    } else {
      newCityContainer.style.display = "none";
    }
  });

  document
    .getElementById("btn-save-new-city")
    .addEventListener("click", async () => {
      const val = inputNewCity.value.trim();
      if (val) {
        if (!settings.cities.includes(val)) {
          settings.cities.push(val);
          try {
            await saveSettings();
          } catch (error) {
            showStorageError("save settings", error);
            return;
          }
        }
        populateDropdowns();
        citySelect.value = val;
        newCityContainer.style.display = "none";
      }
    });

  document
    .getElementById("btn-cancel-new-city")
    .addEventListener("click", () => {
      newCityContainer.style.display = "none";
      citySelect.value = settings.defaultCity || settings.cities[0];
    });

  // Inline "Add New Area" Handlers
  const areaSelect = document.getElementById("contact-area-select");
  const newAreaContainer = document.getElementById("new-area-container");
  const inputNewArea = document.getElementById("input-new-area");

  areaSelect.addEventListener("change", (e) => {
    if (e.target.value === "__ADD_NEW__") {
      newAreaContainer.style.display = "block";
      inputNewArea.value = "";
      inputNewArea.focus();
    } else {
      newAreaContainer.style.display = "none";
    }
  });

  document
    .getElementById("btn-save-new-area")
    .addEventListener("click", async () => {
      const val = inputNewArea.value.trim();
      if (val) {
        if (!settings.areas.includes(val)) {
          settings.areas.push(val);
          try {
            await saveSettings();
          } catch (error) {
            showStorageError("save settings", error);
            return;
          }
        }
        populateDropdowns();
        areaSelect.value = val;
        newAreaContainer.style.display = "none";
      }
    });

  document
    .getElementById("btn-cancel-new-area")
    .addEventListener("click", () => {
      newAreaContainer.style.display = "none";
      areaSelect.value = settings.defaultArea || settings.areas[0];
    });

  // Settings View Buttons
  document
    .getElementById("btn-add-setting-city")
    .addEventListener("click", async () => {
      const input = document.getElementById("setting-new-city");
      const val = input.value.trim();
      if (val && !settings.cities.includes(val)) {
        settings.cities.push(val);
        input.value = "";
        try {
          await saveSettings();
        } catch (error) {
          showStorageError("save settings", error);
          return;
        }
        populateDropdowns();
        alert(`City "${val}" added successfully!`);
      }
    });

  document
    .getElementById("btn-add-setting-area")
    .addEventListener("click", async () => {
      const input = document.getElementById("setting-new-area");
      const val = input.value.trim();
      if (val && !settings.areas.includes(val)) {
        settings.areas.push(val);
        input.value = "";
        try {
          await saveSettings();
        } catch (error) {
          showStorageError("save settings", error);
          return;
        }
        populateDropdowns();
        alert(`Area "${val}" added successfully!`);
      }
    });

  document
    .getElementById("settings-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      settings.state = document.getElementById("setting-state").value.trim();
      settings.defaultCity = document
        .getElementById("setting-default-city")
        .value.trim();
      settings.defaultArea = document
        .getElementById("setting-default-area")
        .value.trim();
      try {
        await saveSettings();
      } catch (error) {
        showStorageError("save settings", error);
        return;
      }
      populateDropdowns();
      alert("Master settings saved successfully!");
    });

  let contacts = savedContacts;

  // Helper: Calculate days between a timestamp and now
  const calculateDaysSince = (dateInput) => {
    if (!dateInput) return 0;
    const targetDate = new Date(dateInput);
    const now = new Date();
    const diffTime = now - targetDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Helper: Determine Color & Status based on Days Since Newest Visit
  const getContactStatus = (contact) => {
    let latestDate = contact.createdAt;
    if (contact.notesHistory && contact.notesHistory.length > 0) {
      const sortedNotes = [...contact.notesHistory].sort(
        (a, b) => new Date(b.rawDate || b.date) - new Date(a.rawDate || a.date),
      );
      latestDate = sortedNotes[0].rawDate || sortedNotes[0].date;
    }
    const days = calculateDaysSince(latestDate);
    if (days >= 15)
      return { label: "Immediate", color: "#dc3545", class: "immediate", days };
    if (days >= 8)
      return { label: "Urgent", color: "#ffc107", class: "urgent", days };
    return { label: "Normal", color: "#28a745", class: "normal", days };
  };

  const toLocalDateTimeString = (dateObj) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
  };

  // Initialize Main Leaflet Map
  let map = null;
  let mapMarkers = [];

  const initMap = () => {
    if (map) return;
    map = L.map("map", { doubleClickZoom: false }).setView(
      [38.8517, -121.1275],
      13,
    );
    window.mapInstance = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    renderMapMarkers();
  };

  // Navigation & Dynamic Footer
  let currentViewId = "contacts-view";
  const navButtonsConfig = [
    { id: "contacts-view", icon: "👥" },
    { id: "map-view", icon: "🗺️" },
    { id: "settings-view", icon: "⚙️" },
  ];

  const renderBottomNav = () => {
    const navContainer = document.getElementById("bottom-nav");
    navContainer.innerHTML = "";
    navButtonsConfig.forEach((btnConfig) => {
      if (btnConfig.id !== currentViewId) {
        const btn = document.createElement("button");
        btn.className = "nav-btn";
        btn.textContent = btnConfig.icon;
        btn.title = btnConfig.id.replace("-view", "");
        btn.addEventListener("click", () => {
          currentViewId = btnConfig.id;
          document
            .querySelectorAll(".view")
            .forEach((v) => v.classList.remove("active"));
          document.getElementById(currentViewId).classList.add("active");
          renderBottomNav();

          if (currentViewId === "map-view") {
            if (!map) {
              initMap();
            } else {
              setTimeout(() => {
                map.invalidateSize();
                renderMapMarkers();
              }, 50);
            }
          }
        });
        navContainer.appendChild(btn);
      }
    });
  };
  renderBottomNav();

  const saveContacts = async () => {
    try {
      await writeStoredValue(database, "contacts", contacts);
    } catch (error) {
      showStorageError("save contacts", error);
      return false;
    }
    renderContacts();
    if (map) renderMapMarkers();
    return true;
  };

  // Modal Elements & Interactive Picker Map
  const modal = document.getElementById("contact-modal");
  const btnOpenModal = document.getElementById("btn-open-modal");
  const btnFindAddress = document.getElementById("btn-find-address");
  const closeModal = document.getElementById("close-modal");
  const btnExitModal = document.getElementById("btn-exit-modal");
  const contactForm = document.getElementById("contact-form");

  let pickerMap = null;
  let pickerMarker = null;
  const defaultMapCenter = [38.8517, -121.1275];

  const setPickerLocation = (lat, lng, zoom = 16) => {
    const location = [Number(lat), Number(lng)];
    document.getElementById("contact-lat").value = location[0].toFixed(6);
    document.getElementById("contact-lng").value = location[1].toFixed(6);
    if (pickerMarker) {
      pickerMarker.setLatLng(location);
    } else {
      pickerMarker = L.marker(location, { draggable: true }).addTo(pickerMap);
      pickerMarker.on("dragend", () => {
        const movedTo = pickerMarker.getLatLng();
        document.getElementById("contact-lat").value =
          movedTo.lat.toFixed(6);
        document.getElementById("contact-lng").value =
          movedTo.lng.toFixed(6);
      });
    }
    pickerMap.setView(location, zoom);
  };

  const getDeviceCoordinates = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve([coords.latitude, coords.longitude]),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
      );
    });

  const findAddressOnMap = async () => {
    const street = document.getElementById("contact-address").value.trim();
    const city = document.getElementById("contact-city-select").value;
    const state = document.getElementById("contact-state").value.trim();
    if (!street) {
      alert("Enter a street address before searching for it on the map.");
      return;
    }

    const query = [street, city, state, "USA"].filter(Boolean).join(", ");
    btnFindAddress.disabled = true;
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.search = new URLSearchParams({
        q: query,
        format: "jsonv2",
        limit: "1",
      }).toString();
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Address lookup failed with status ${response.status}.`);
      }
      const results = await response.json();
      if (results.length === 0) {
        alert("No matching address was found. Check the address or place the pin manually.");
        return;
      }
      setPickerLocation(results[0].lat, results[0].lon);
    } catch (error) {
      console.error("Unable to find address on map:", error);
      alert(
        "Address lookup failed. Check your internet connection, then try again or place the pin manually.",
      );
    } finally {
      btnFindAddress.disabled = false;
    }
  };

  let initialFormState = "";
  const captureFormState = () => {
    const formEl = document.getElementById("contact-form");
    const formData = new FormData(formEl);
    let str = "";
    for (let [key, val] of formData.entries()) {
      str += key + "=" + val + "|";
    }
    return str;
  };

  const attemptExit = () => {
    const currentState = captureFormState();
    if (currentState !== initialFormState) {
      const confirmExit = confirm("Changes were made, exit without saving?");
      if (confirmExit) {
        modal.style.display = "none";
      }
    } else {
      modal.style.display = "none";
    }
  };

  const openModalWithCoords = (lat, lng) => {
    modal.style.display = "flex";
    newCityContainer.style.display = "none";
    newAreaContainer.style.display = "none";

    return new Promise((resolve) => {
      setTimeout(() => {
        if (!pickerMap) {
          pickerMap = L.map("modal-picker-map").setView(
            lat !== null && lng !== null ? [lat, lng] : defaultMapCenter,
            15,
          );
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap",
          }).addTo(pickerMap);

          pickerMap.on("click", (e) =>
            setPickerLocation(e.latlng.lat, e.latlng.lng),
          );
        } else {
          pickerMap.invalidateSize();
          pickerMap.setView(
            lat !== null && lng !== null ? [lat, lng] : defaultMapCenter,
            15,
          );
        }

        setTimeout(() => {
          if (pickerMap) pickerMap.invalidateSize();
        }, 100);

        if (lat !== null && lng !== null) {
          setPickerLocation(lat, lng, 15);
        } else if (pickerMarker) {
          pickerMap.removeLayer(pickerMarker);
          pickerMarker = null;
        }
        initialFormState = captureFormState();
        resolve();
      }, 150);
    });
  };

  btnOpenModal.addEventListener("click", async () => {
    contactForm.reset();
    document.getElementById("contact-id").value = "";
    document.getElementById("contact-city-select").value =
      settings.defaultCity || settings.cities[0];
    document.getElementById("contact-area-select").value =
      settings.defaultArea || settings.areas[0];
    document.getElementById("contact-state").value = settings.state;
    document.getElementById("contact-lat").value = "";
    document.getElementById("contact-lng").value = "";
    document.getElementById("new-log-timestamp").value = toLocalDateTimeString(
      new Date(),
    );
    document.getElementById("modal-notes-history-container").innerHTML =
      '<span style="color: #888;">No visit logs yet.</span>';
    document.getElementById("modal-title").textContent = "Add Contact";
    await openModalWithCoords(null, null);
    try {
      const [lat, lng] = await getDeviceCoordinates();
      if (modal.style.display === "flex") setPickerLocation(lat, lng);
    } catch (error) {
      console.warn("Unable to use device location:", error);
      if (modal.style.display === "flex") {
        alert(
          "Device location is unavailable. Enter an address and use Find Address on Map, or tap/drag the pin to set a location.",
        );
      }
    }
  });

  btnFindAddress.addEventListener("click", findAddressOnMap);

  closeModal.addEventListener("click", attemptExit);
  btnExitModal.addEventListener("click", attemptExit);

  // GPS Auto-population
  document.getElementById("btn-gps").addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (pickerMap) {
            setPickerLocation(
              position.coords.latitude,
              position.coords.longitude,
            );
          }
        },
        () => {
          alert("Unable to retrieve your location.");
        },
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  });

  // Save Contact Handler
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("contact-id").value;
    const firstName = document.getElementById("contact-firstname").value.trim();
    const lastName = document.getElementById("contact-lastname").value.trim();
    const street = document.getElementById("contact-address").value.trim();
    const city = document.getElementById("contact-city-select").value;
    const state = document.getElementById("contact-state").value.trim();
    const area = document.getElementById("contact-area-select").value;
    const lat = document.getElementById("contact-lat").value.trim();
    const lng = document.getElementById("contact-lng").value.trim();
    const latitude = Number(lat);
    const longitude = Number(lng);
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      alert(
        "Set a location using device GPS, Find Address on Map, or by tapping/dragging the map pin before saving.",
      );
      return;
    }

    const newNoteText = document.getElementById("contact-notes").value.trim();
    const newNoteTimestampVal =
      document.getElementById("new-log-timestamp").value;

    const fullAddress = [street, city, state].filter(Boolean).join(", ");

    let targetId = id;

    if (id) {
      const contact = contacts.find((c) => c.id == id);
      if (contact) {
        contact.firstName = firstName;
        contact.lastName = lastName;
        contact.address = fullAddress;
        contact.city = city;
        contact.state = state;
        contact.area = area;
        contact.lat = lat;
        contact.lng = lng;

        if (newNoteText) {
          if (!contact.notesHistory) contact.notesHistory = [];
          const logDate = newNoteTimestampVal
            ? new Date(newNoteTimestampVal)
            : new Date();
          contact.notesHistory.push({
            id: "log_" + Date.now(),
            rawDate: logDate.toISOString(),
            date: logDate.toLocaleString(),
            text: newNoteText,
          });
        }
      }
    } else {
      const logDate = newNoteTimestampVal
        ? new Date(newNoteTimestampVal)
        : new Date();
      const notesHistory = newNoteText
        ? [
            {
              id: "log_" + Date.now(),
              rawDate: logDate.toISOString(),
              date: logDate.toLocaleString(),
              text: newNoteText,
            },
          ]
        : [];

      targetId = Date.now();
      const newContact = {
        id: targetId,
        createdAt: new Date().toISOString(),
        firstName,
        lastName,
        address: fullAddress,
        city,
        state,
        area,
        lat,
        lng,
        notesHistory,
      };
      contacts.push(newContact);
      document.getElementById("contact-id").value = targetId;
    }

    if (!(await saveContacts())) return;

    document.getElementById("contact-notes").value = "";
    document.getElementById("new-log-timestamp").value = toLocalDateTimeString(
      new Date(),
    );
    initialFormState = captureFormState();

    editContact(targetId);
    alert("Contact saved successfully!");
  });

  // Render Contacts List
  const renderContacts = () => {
    const listContainer = document.getElementById("contacts-list");
    const searchTerm = document
      .getElementById("search-input")
      .value.toLowerCase();
    const filterUrgency = document.getElementById("filter-urgency").value;
    const filterCity = document.getElementById("filter-city").value;
    const filterArea = document.getElementById("filter-area").value;
    const sortMode = document.getElementById("sort-select").value;

    let filtered = contacts.filter((c) => {
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      const addr = (c.address || "").toLowerCase();
      const notesMatch =
        c.notesHistory &&
        c.notesHistory.some((n) => n.text.toLowerCase().includes(searchTerm));
      const textMatch =
        fullName.includes(searchTerm) ||
        addr.includes(searchTerm) ||
        notesMatch;

      const status = getContactStatus(c);
      const urgencyMatch = !filterUrgency || status.label === filterUrgency;
      const cityMatch = !filterCity || c.city === filterCity;
      const areaMatch = !filterArea || c.area === filterArea;
      return textMatch && urgencyMatch && cityMatch && areaMatch;
    });

    filtered.sort((a, b) => {
      if (sortMode === "chronological-asc")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortMode === "chronological-desc")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortMode === "alphabetical")
        return a.firstName.localeCompare(b.firstName);
    });

    listContainer.innerHTML = "";
    if (filtered.length === 0) {
      listContainer.innerHTML = "<p>No matching contacts found.</p>";
      return;
    }

    filtered.forEach((contact) => {
      const card = document.createElement("div");
      const status = getContactStatus(contact);
      let urgencyClass = "contact-card";
      if (status.class === "urgent") urgencyClass += " urgent";
      if (status.class === "immediate") urgencyClass += " immediate";
      card.className = urgencyClass;

      let historyHtml = '<div class="contact-notes-history">';
      if (contact.notesHistory && contact.notesHistory.length > 0) {
        const sortedNotes = [...contact.notesHistory].sort(
          (a, b) =>
            new Date(b.rawDate || b.date) - new Date(a.rawDate || a.date),
        );
        sortedNotes.forEach((note) => {
          historyHtml += `
                        <div class="note-entry">
                            <small style="color: #6c757d; font-weight: bold;">${note.date}</small><br>
                            <span>${note.text}</span>
                        </div>
                    `;
        });
      } else {
        historyHtml +=
          '<span style="color: #888;">No visit logs recorded yet.</span>';
      }
      historyHtml += "</div>";

      card.innerHTML = `
                <strong>${contact.firstName} ${contact.lastName}</strong><br>
                <small>${contact.address || "No address provided"} ${contact.area ? `(${contact.area})` : ""}</small><br>
                <span>Days Since Last Contact: <strong>${status.days} days</strong> (${status.label})</span>
                ${historyHtml}
                <div class="quick-add-note-box">
                    <input type="text" id="quick-note-${contact.id}" placeholder="Add visit log...">
                    <button onclick="addQuickNote(${contact.id})" title="Add Note">➕</button>
                </div>
                <div class="card-actions">
                    <button class="btn-icon" onclick="editContact(${contact.id})" title="Edit Details">✏️</button>
                    <button class="btn-icon delete" onclick="deleteContact(${contact.id})" title="Delete Contact">🗑️</button>
                </div>
            `;
      listContainer.appendChild(card);
    });
  };

  // Render Leaflet Map Markers with Dynamic Color-Coded Pins
  const renderMapMarkers = () => {
    if (!map) return;
    mapMarkers.forEach((marker) => map.removeLayer(marker));
    mapMarkers = [];

    let validMarkers = [];

    contacts.forEach((contact) => {
      if (contact.lat && contact.lng) {
        const latNum = parseFloat(contact.lat);
        const lngNum = parseFloat(contact.lng);
        const status = getContactStatus(contact);

        const svgIcon = L.divIcon({
          className: "custom-map-pin",
          html: `<div style="background-color: ${status.color};"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const marker = L.marker([latNum, lngNum], { icon: svgIcon }).addTo(map);

        const popupContent = `
                    <div>
                        <b>${contact.firstName} ${contact.lastName}</b><br>
                        ${contact.address}<br>
                        City: ${contact.city || "N/A"} | Area: ${contact.area || "N/A"}<br>
                        Days Since Contact: ${status.days} (${status.label})<br><br>
                        <button onclick="editContact(${contact.id})" style="background: #004080; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 13px;">✏️ Edit Details</button>
                    </div>
                `;
        marker.bindPopup(popupContent);

        mapMarkers.push(marker);
        validMarkers.push([latNum, lngNum]);
      }
    });

    if (validMarkers.length > 0) {
      if (validMarkers.length === 1) {
        map.setView(validMarkers[0], 16);
      } else {
        const bounds = L.latLngBounds(validMarkers);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  };

  // Global Action Handlers
  window.addQuickNote = async (id) => {
    const input = document.getElementById(`quick-note-${id}`);
    const text = input.value.trim();
    if (!text) return;

    const contact = contacts.find((c) => c.id == id);
    if (contact) {
      if (!contact.notesHistory) contact.notesHistory = [];
      const now = new Date();
      contact.notesHistory.push({
        id: "log_" + Date.now(),
        rawDate: now.toISOString(),
        date: now.toLocaleString(),
        text: text,
      });
      if (!(await saveContacts())) return;
      input.value = "";
    }
  };

  // Inline Visit Log Editor Functions
  window.deleteVisitLog = async (contactId, logId) => {
    if (confirm("Are you sure you want to delete this visit log?")) {
      const contact = contacts.find((c) => c.id == contactId);
      if (contact && contact.notesHistory) {
        contact.notesHistory = contact.notesHistory.filter(
          (n) => n.id != logId,
        );
        if (!(await saveContacts())) return;
        editContact(contactId);
      }
    }
  };

  window.editContact = async (id) => {
    const contact = contacts.find((c) => c.id == id);
    if (!contact) return;
    document.getElementById("contact-id").value = contact.id;
    document.getElementById("contact-firstname").value = contact.firstName;
    document.getElementById("contact-lastname").value = contact.lastName;
    document.getElementById("contact-address").value = contact.address
      ? contact.address.split(",")[0]
      : "";
    document.getElementById("contact-city-select").value =
      contact.city || settings.cities[0];
    document.getElementById("contact-state").value =
      contact.state || settings.state;
    document.getElementById("contact-area-select").value =
      contact.area || settings.areas[0];
    document.getElementById("contact-lat").value = contact.lat || "";
    document.getElementById("contact-lng").value = contact.lng || "";
    document.getElementById("contact-notes").value = "";
    document.getElementById("new-log-timestamp").value = toLocalDateTimeString(
      new Date(),
    );

    const historyContainer = document.getElementById(
      "modal-notes-history-container",
    );
    historyContainer.innerHTML = "";
    if (contact.notesHistory && contact.notesHistory.length > 0) {
      const sortedNotes = [...contact.notesHistory].sort(
        (a, b) => new Date(b.rawDate || b.date) - new Date(a.rawDate || a.date),
      );
      sortedNotes.forEach((note) => {
        if (!note.id)
          note.id =
            "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

        const entry = document.createElement("div");
        entry.className = "note-entry";
        entry.style.padding = "6px 0";
        entry.style.borderBottom = "1px solid #ddd";

        // Default View Mode for Log Entry
        const renderViewMode = () => {
          entry.innerHTML = "";

          const infoDiv = document.createElement("div");
          infoDiv.style.marginBottom = "4px";
          infoDiv.innerHTML = `<small style="color: #6c757d; font-weight: bold;">${note.date}</small><br><span>${note.text}</span>`;

          const btnRow = document.createElement("div");
          btnRow.style.display = "flex";
          btnRow.style.gap = "6px";
          btnRow.style.marginTop = "4px";

          const editBtn = document.createElement("button");
          editBtn.type = "button";
          editBtn.className = "btn-icon";
          editBtn.title = "Edit Log";
          editBtn.textContent = "✏️ Edit";
          editBtn.style.fontSize = "12px";
          editBtn.style.padding = "4px 8px";
          editBtn.addEventListener("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            renderEditMode();
          });

          const delBtn = document.createElement("button");
          delBtn.type = "button";
          delBtn.className = "btn-icon delete";
          delBtn.title = "Delete Log";
          delBtn.textContent = "🗑️ Delete";
          delBtn.style.fontSize = "12px";
          delBtn.style.padding = "4px 8px";
          delBtn.addEventListener("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            window.deleteVisitLog(contact.id, note.id);
          });

          btnRow.appendChild(editBtn);
          btnRow.appendChild(delBtn);

          entry.appendChild(infoDiv);
          entry.appendChild(btnRow);
        };

        // Inline Edit Mode for Log Entry
        const renderEditMode = () => {
          entry.innerHTML = "";

          const editContainer = document.createElement("div");
          editContainer.style.display = "flex";
          editContainer.style.flexDirection = "column";
          editContainer.style.gap = "6px";

          const dateInput = document.createElement("input");
          dateInput.type = "datetime-local";
          const existingDate = note.rawDate
            ? new Date(note.rawDate)
            : new Date(note.date);
          dateInput.value = toLocalDateTimeString(
            isNaN(existingDate) ? new Date() : existingDate,
          );
          dateInput.style.padding = "6px";

          const textArea = document.createElement("textarea");
          textArea.rows = 2;
          textArea.value = note.text;
          textArea.style.padding = "6px";

          const actionRow = document.createElement("div");
          actionRow.style.display = "flex";
          actionRow.style.gap = "6px";

          const saveLogBtn = document.createElement("button");
          saveLogBtn.type = "button";
          saveLogBtn.textContent = "💾 Update Log";
          saveLogBtn.style.background = "#28a745";
          saveLogBtn.style.color = "white";
          saveLogBtn.style.border = "none";
          saveLogBtn.style.padding = "6px 12px";
          saveLogBtn.style.borderRadius = "4px";
          saveLogBtn.style.cursor = "pointer";

          saveLogBtn.addEventListener("click", async (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const updatedText = textArea.value.trim();
            if (!updatedText) {
              alert("Note text cannot be empty.");
              return;
            }
            const updatedDate = new Date(dateInput.value);
            note.text = updatedText;
            if (!isNaN(updatedDate)) {
              note.rawDate = updatedDate.toISOString();
              note.date = updatedDate.toLocaleString();
            }
            if (await saveContacts()) editContact(contact.id);
          });

          const cancelLogBtn = document.createElement("button");
          cancelLogBtn.type = "button";
          cancelLogBtn.textContent = "❌ Cancel";
          cancelLogBtn.style.background = "#6c757d";
          cancelLogBtn.style.color = "white";
          cancelLogBtn.style.border = "none";
          cancelLogBtn.style.padding = "6px 12px";
          cancelLogBtn.style.borderRadius = "4px";
          cancelLogBtn.style.cursor = "pointer";

          cancelLogBtn.addEventListener("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            renderViewMode();
          });

          actionRow.appendChild(saveLogBtn);
          actionRow.appendChild(cancelLogBtn);

          editContainer.appendChild(dateInput);
          editContainer.appendChild(textArea);
          editContainer.appendChild(actionRow);

          entry.appendChild(editContainer);
        };

        renderViewMode();
        historyContainer.appendChild(entry);
      });
    } else {
      historyContainer.innerHTML =
        '<span style="color: #888;">No visit logs recorded yet.</span>';
    }

    document.getElementById("modal-title").textContent = "Edit Contact";
    const lat = Number.parseFloat(contact.lat);
    const lng = Number.parseFloat(contact.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      await openModalWithCoords(lat, lng);
    } else {
      await openModalWithCoords(null, null);
      if (document.getElementById("contact-address").value.trim()) {
        await findAddressOnMap();
      } else {
        try {
          const [deviceLat, deviceLng] = await getDeviceCoordinates();
          setPickerLocation(deviceLat, deviceLng);
        } catch (error) {
          console.warn("Unable to use device location:", error);
          alert(
            "Device location is unavailable. Tap/drag the pin or enter an address and use Find Address on Map.",
          );
        }
      }
    }
  };

  window.deleteContact = async (id) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      contacts = contacts.filter((c) => c.id != id);
      await saveContacts();
    }
  };

  document
    .getElementById("search-input")
    .addEventListener("input", renderContacts);
  document
    .getElementById("filter-urgency")
    .addEventListener("change", renderContacts);
  document
    .getElementById("filter-city")
    .addEventListener("change", renderContacts);
  document
    .getElementById("filter-area")
    .addEventListener("change", renderContacts);
  document
    .getElementById("sort-select")
    .addEventListener("change", renderContacts);

  document
    .getElementById("btn-export-backup")
    .addEventListener("click", async () => {
      try {
        const [backupSettings, backupContacts] = await Promise.all([
          readStoredValue(database, "settings"),
          readStoredValue(database, "contacts"),
        ]);
        const backup = {
          format: "return-visits-backup",
          version: 1,
          exportedAt: new Date().toISOString(),
          settings: backupSettings,
          contacts: backupContacts,
        };
        const file = new Blob([JSON.stringify(backup, null, 2)], {
          type: "application/json",
        });
        const downloadUrl = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `return-visits-backup-${new Date()
          .toISOString()
          .slice(0, 10)}.json`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      } catch (error) {
        showStorageError("export backup", error);
      }
    });

  renderContacts();
};

document.addEventListener("DOMContentLoaded", () => {
  initializeApp().catch((error) => {
    console.error("Unable to start the app:", error);
    alert(
      "The app could not open its on-device database. Your existing browser data has not been deleted. Please reload and try again.",
    );
  });
});
