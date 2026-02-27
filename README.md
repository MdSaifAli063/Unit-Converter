# 🔄 Unit Converter

A fast, accessible, responsive unit converter with a modern UI — built with vanilla HTML, CSS, and JavaScript.

- 🎯 Live bi-directional conversion
- 🌓 Dark mode (persists)
- 🎚️ Precision control
- 🔍 Unit filter/search
- 🔁 Swap units
- 📋 Copy to clipboard
- 💾 Saves preferences
- ♿ Accessible and mobile-friendly

---

## ✨ Features

- 📦 Categories:
  - Length, Mass, Temperature, Volume, Area, Speed, Time, Data, Energy, Pressure
- 🔁 Convert in both directions by typing in either input
- 🔄 Swap units with one click
- 🎚️ Precision control from 0–10 decimals
- 🔍 Filter units via search box
- 🌓 Dark mode toggle (saved to localStorage)
- 📋 Copy buttons for both sides, plus Clear for quick resets
- 💾 Remembers category, units, precision, and theme
- 📱 Responsive layout designed for phones through desktops
- ♿ WAI-ARIA labels, large focus rings, and tab-friendly interactions

---

## 🖼️ Screenshots

![image](https://github.com/MdSaifAli063/Unit-Converter/blob/d8c4691eb0a3236ff86c3af7bc17765f7578c0c5/Screenshot%202025-09-06%20010635.png)

---

## 🚀 Getting Started

### Option A: Open directly
- Double-click index.html
- Note: Some browsers restrict clipboard access on file:// URLs. If copy-to-clipboard doesn’t work, use a local server (Option B).

### Option B: Serve locally (recommended)
- Using Node (http-server):
  - npm install --global http-server
  - http-server -p 8080
  - Visit http://localhost:8080

- Using Python:
  - Python 3: python3 -m http.server 8080
  - Visit http://localhost:8080

---

## 🧭 Project Structure

- index.html — App markup
- style.css — Theme and layout
- script.js — Conversion logic, events, and persistence

No build tools required.

---

## 🕹️ Usage

- Type a number in either left or right input — conversion updates live
- Choose Category, Units, and Precision from the controls
- Click Swap to reverse direction
- Filter units via the search input to quickly find what you need
- Use Dark/Light toggle to switch themes

Keyboard hints:
- Tab/Shift+Tab to navigate
- Enter while focused on an input to select its contents
- Escape to dismiss native selects (browser-dependent)

---

## 🧠 How It Works

- All unit definitions live in script.js under the UNITS constant
- Linear units use a factor relative to a base unit
- Temperature is handled via toBase/fromBase functions for affine transforms

Example of a linear category:
```js
Length: {
  base: 'meter',
  units: {
    meter: { factor: 1, symbol: 'm', label: 'Meter (m)' },
    kilometer: { factor: 1000, symbol: 'km', label: 'Kilometer (km)' },
    // ...
  }
}
```

Example of a non-linear category (Temperature):
```js
Temperature: {
  base: 'kelvin',
  units: {
    celsius: {
      toBase: (c) => c + 273.15,
      fromBase: (k) => k - 273.15,
      symbol: '°C',
      label: 'Celsius (°C)'
    },
    // ...
  }
}
```

## 🛠️ Customization

- Add a new unit to an existing category
- Open script.js
- Find the category in UNITS
- Add a new unit entry with factor, symbol, and label
Example:
```js
Mass: {
  base: 'kilogram',
  units: {
    // existing...
    stone: { factor: 6.35029318, symbol: 'st', label: 'Stone (st)' }
  }
}
```

Add a new category
- Add a new object with a base and units. Use factor or custom toBase/fromBase functions as needed.
- Add labels and consistent symbols for a polished UI.<br>
 
Theming

- Toggle via the top-right button
- Theme is persisted in localStorage (key: uc:theme)
- Colors and spacing live in CSS variables at the top of style.css

## 🧪 Precision & Formatting

- Precision control affects decimal places (0–10)
- Large/small numbers may use scientific notation for readability
- Inputs display plain numeric values; helper text shows localized formatting

## 🔒 Persistence

The following are saved in localStorage:

- uc:category — last used category
- uc:unitA, uc:unitB — last selected units on each side
- uc:precision — decimal precision
- uc:theme — dark or light

## ♿ Accessibility

- Visible focus styles and large hit areas
- ARIA labels for inputs and selects
- Helper text uses aria-live="polite" for updates
- Keyboard-first navigation supported

## ⚙️ Browser Support

- Modern evergreen browsers (Chromium, Firefox, Safari)
- Clipboard features may require HTTPS or localhost for full support

## 🪪 License

MIT License — feel free to use, modify, and distribute.

## 🙌 Contributing

- Fork the repo and create a feature branch
- Keep unit names clear and labels user-friendly
- Test responsive layout and accessibility
- Open a PR with a clear description and screenshots if UI changes are included
