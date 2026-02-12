/* Unit Converter Script
   - Categories with base units
   - Live bi-directional conversion
   - Swap units, copy values, precision control
   - Dark mode toggle (saved)
   - Unit filtering
   - State persistence (category/units/precision)
*/

(() => {
  const $ = (sel) => document.querySelector(sel);

  const el = {
    property: $('#propertySelect'),
    precision: $('#precisionSelect'),
    themeToggle: null,
    unitFilter: $('#unitFilter'),
    inputA: $('#inputA'),
    inputB: $('#inputB'),
    unitA: $('#unitSelectA'),
    unitB: $('#unitSelectB'),
    swapBtn: $('#swapBtn'),
    copyA: $('#copyA'),
    copyB: $('#copyB'),
    clearA: $('#clearA'),
    clearB: $('#clearB'),
    helper: $('#helperText')
  };

  // Data model: base unit factors or custom (Temperature)
  const UNITS = {
    Length: {
      base: 'meter',
      units: {
        meter: { factor: 1, symbol: 'm', label: 'Meter (m)' },
        kilometer: { factor: 1000, symbol: 'km', label: 'Kilometer (km)' },
        centimeter: { factor: 0.01, symbol: 'cm', label: 'Centimeter (cm)' },
        millimeter: { factor: 0.001, symbol: 'mm', label: 'Millimeter (mm)' },
        micrometer: { factor: 1e-6, symbol: 'µm', label: 'Micrometer (µm)' },
        nanometer: { factor: 1e-9, symbol: 'nm', label: 'Nanometer (nm)' },
        mile: { factor: 1609.344, symbol: 'mi', label: 'Mile (mi)' },
        yard: { factor: 0.9144, symbol: 'yd', label: 'Yard (yd)' },
        foot: { factor: 0.3048, symbol: 'ft', label: 'Foot (ft)' },
        inch: { factor: 0.0254, symbol: 'in', label: 'Inch (in)' }
      }
    },
    Mass: {
      base: 'kilogram',
      units: {
        kilogram: { factor: 1, symbol: 'kg', label: 'Kilogram (kg)' },
        gram: { factor: 0.001, symbol: 'g', label: 'Gram (g)' },
        milligram: { factor: 1e-6, symbol: 'mg', label: 'Milligram (mg)' },
        metric_ton: { factor: 1000, symbol: 't', label: 'Metric ton (t)' },
        pound: { factor: 0.45359237, symbol: 'lb', label: 'Pound (lb)' },
        ounce: { factor: 0.028349523125, symbol: 'oz', label: 'Ounce (oz)' }
      }
    },
    Temperature: {
      base: 'kelvin', // using Kelvin as base for affine transforms
      units: {
        celsius: {
          toBase: (c) => c + 273.15,
          fromBase: (k) => k - 273.15,
          symbol: '°C',
          label: 'Celsius (°C)'
        },
        fahrenheit: {
          toBase: (f) => (f + 459.67) * (5 / 9),
          fromBase: (k) => k * (9 / 5) - 459.67,
          symbol: '°F',
          label: 'Fahrenheit (°F)'
        },
        kelvin: {
          toBase: (k) => k,
          fromBase: (k) => k,
          symbol: 'K',
          label: 'Kelvin (K)'
        }
      }
    },
    Volume: {
      base: 'liter',
      units: {
        liter: { factor: 1, symbol: 'L', label: 'Liter (L)' },
        milliliter: { factor: 0.001, symbol: 'mL', label: 'Milliliter (mL)' },
        cubic_meter: { factor: 1000, symbol: 'm³', label: 'Cubic meter (m³)' },
        cubic_centimeter: { factor: 0.001, symbol: 'cm³', label: 'Cubic centimeter (cm³)' },
        gallon_us: { factor: 3.785411784, symbol: 'gal (US)', label: 'Gallon (US)' },
        quart_us: { factor: 0.946352946, symbol: 'qt (US)', label: 'Quart (US)' },
        pint_us: { factor: 0.473176473, symbol: 'pt (US)', label: 'Pint (US)' },
        fluid_ounce_us: { factor: 0.0295735295625, symbol: 'fl oz (US)', label: 'Fluid Ounce (US)' }
      }
    },
    Area: {
      base: 'square_meter',
      units: {
        square_meter: { factor: 1, symbol: 'm²', label: 'Square meter (m²)' },
        square_kilometer: { factor: 1e6, symbol: 'km²', label: 'Square kilometer (km²)' },
        square_centimeter: { factor: 0.0001, symbol: 'cm²', label: 'Square centimeter (cm²)' },
        square_millimeter: { factor: 1e-6, symbol: 'mm²', label: 'Square millimeter (mm²)' },
        hectare: { factor: 10000, symbol: 'ha', label: 'Hectare (ha)' },
        acre: { factor: 4046.8564224, symbol: 'ac', label: 'Acre (ac)' },
        square_foot: { factor: 0.09290304, symbol: 'ft²', label: 'Square foot (ft²)' },
        square_inch: { factor: 0.00064516, symbol: 'in²', label: 'Square inch (in²)' }
      }
    },
    Speed: {
      base: 'meter_per_second',
      units: {
        meter_per_second: { factor: 1, symbol: 'm/s', label: 'Meter per second (m/s)' },
        kilometer_per_hour: { factor: 0.27777777777778, symbol: 'km/h', label: 'Kilometer per hour (km/h)' },
        mile_per_hour: { factor: 0.44704, symbol: 'mph', label: 'Mile per hour (mph)' },
        knot: { factor: 0.51444444444444, symbol: 'kn', label: 'Knot (kn)' },
        foot_per_second: { factor: 0.3048, symbol: 'ft/s', label: 'Foot per second (ft/s)' }
      }
    },
    Time: {
      base: 'second',
      units: {
        second: { factor: 1, symbol: 's', label: 'Second (s)' },
        millisecond: { factor: 0.001, symbol: 'ms', label: 'Millisecond (ms)' },
        microsecond: { factor: 1e-6, symbol: 'µs', label: 'Microsecond (µs)' },
        minute: { factor: 60, symbol: 'min', label: 'Minute (min)' },
        hour: { factor: 3600, symbol: 'h', label: 'Hour (h)' },
        day: { factor: 86400, symbol: 'd', label: 'Day (d)' },
        week: { factor: 604800, symbol: 'wk', label: 'Week (wk)' }
      }
    },
    Data: {
      base: 'byte',
      units: {
        bit: { factor: 1 / 8, symbol: 'b', label: 'Bit (b)' },
        byte: { factor: 1, symbol: 'B', label: 'Byte (B)' },
        kilobyte: { factor: 1024, symbol: 'KB', label: 'Kilobyte (KB, 1024 B)' },
        megabyte: { factor: 1024 ** 2, symbol: 'MB', label: 'Megabyte (MB, 1024 KB)' },
        gigabyte: { factor: 1024 ** 3, symbol: 'GB', label: 'Gigabyte (GB, 1024 MB)' },
        terabyte: { factor: 1024 ** 4, symbol: 'TB', label: 'Terabyte (TB, 1024 GB)' }
      }
    },
    Energy: {
      base: 'joule',
      units: {
        joule: { factor: 1, symbol: 'J', label: 'Joule (J)' },
        kilojoule: { factor: 1000, symbol: 'kJ', label: 'Kilojoule (kJ)' },
        calorie: { factor: 4.184, symbol: 'cal', label: 'Calorie (cal)' },
        kilocalorie: { factor: 4184, symbol: 'kcal', label: 'Kilocalorie (kcal)' },
        watt_hour: { factor: 3600, symbol: 'Wh', label: 'Watt hour (Wh)' },
        kilowatt_hour: { factor: 3.6e6, symbol: 'kWh', label: 'Kilowatt hour (kWh)' }
      }
    },
    Pressure: {
      base: 'pascal',
      units: {
        pascal: { factor: 1, symbol: 'Pa', label: 'Pascal (Pa)' },
        kilopascal: { factor: 1000, symbol: 'kPa', label: 'Kilopascal (kPa)' },
        bar: { factor: 1e5, symbol: 'bar', label: 'Bar (bar)' },
        atmosphere: { factor: 101325, symbol: 'atm', label: 'Standard atmosphere (atm)' },
        psi: { factor: 6894.757293168, symbol: 'psi', label: 'Pound per square inch (psi)' },
        torr: { factor: 133.3223684211, symbol: 'Torr', label: 'Torr (Torr)' }
      }
    }
  };

  // Storage keys
  const STORAGE = {
    category: 'uc:category',
    unitA: 'uc:unitA',
    unitB: 'uc:unitB',
    precision: 'uc:precision',
    theme: 'uc:theme'
  };

  // Helpers
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const isFiniteNumber = (n) => typeof n === 'number' && Number.isFinite(n);

  // Allow digits, minus, dot, exponent
  const sanitizeNumericInput = (str) => {
    if (typeof str !== 'string') str = String(str ?? '');
    // Trim spaces
    str = str.trim();
    // Allow -, digits, ., e/E, + after e
    // We'll rely on Number() to decide validity afterwards
    return str;
  };

  function formatNumber(n, precision) {
    if (!isFiniteNumber(n)) return '';
    const p = clamp(parseInt(precision, 10) || 0, 0, 10);
    // Use toLocaleString for thousands separators; avoid scientific unless huge
    const abs = Math.abs(n);
    const useExp = abs !== 0 && (abs < 1e-6 || abs >= 1e9);
    if (useExp) {
      return n.toExponential(p);
    }
    return Number(n.toFixed(p)).toLocaleString(undefined, { maximumFractionDigits: p });
  }

  function buildOption(value, text) {
    const o = document.createElement('option');
    o.value = value;
    o.textContent = text;
    return o;
  }

  function populateCategories() {
    el.property.innerHTML = '';
    Object.keys(UNITS).forEach(cat => {
      el.property.appendChild(buildOption(cat, cat));
    });
  }

  function populateUnits(category, select, preferred) {
    const cat = UNITS[category];
    if (!cat) return;
    select.innerHTML = '';
    Object.entries(cat.units).forEach(([key, def]) => {
      const text = def.label || key;
      const opt = buildOption(key, text);
      select.appendChild(opt);
    });
    // Try to set preferred unit if exists, else default to base or first
    const prefer = preferred && cat.units[preferred] ? preferred : cat.base || Object.keys(cat.units)[0];
    select.value = prefer;
  }

  function toBase(category, unitKey, value) {
    const cat = UNITS[category];
    if (!cat) return NaN;
    const def = cat.units[unitKey];
    if (!def) return NaN;
    if (typeof def.toBase === 'function') {
      return def.toBase(value);
    }
    return value * def.factor; // linear
  }

  function fromBase(category, unitKey, baseValue) {
    const cat = UNITS[category];
    if (!cat) return NaN;
    const def = cat.units[unitKey];
    if (!def) return NaN;
    if (typeof def.fromBase === 'function') {
      return def.fromBase(baseValue);
    }
    return baseValue / def.factor; // linear
  }

  function convert(category, fromUnit, toUnit, value) {
    const v = Number(value);
    if (!Number.isFinite(v)) return '';
    const base = toBase(category, fromUnit, v);
    const out = fromBase(category, toUnit, base);
    return out;
  }

  // Unit filtering for both selects
  function applyUnitFilter(filterText = '') {
    const f = filterText.trim().toLowerCase();
    const category = el.property.value;
    [el.unitA, el.unitB].forEach(select => {
      Array.from(select.options).forEach(opt => {
        const data = UNITS[category].units[opt.value];
        const compound = `${opt.textContent} ${data?.symbol || ''} ${opt.value}`.toLowerCase();
        opt.hidden = f && !compound.includes(f);
      });
      // If current value is hidden, try to select first visible
      if (select.selectedOptions[0]?.hidden) {
        const firstVisible = Array.from(select.options).find(o => !o.hidden);
        if (firstVisible) select.value = firstVisible.value;
      }
    });
  }

  // Copy helpers
  async function copyToClipboard(elInput) {
    try {
      const text = elInput.value || '';
      await navigator.clipboard.writeText(text);
      elInput.classList.add('copied');
      setTimeout(() => elInput.classList.remove('copied'), 600);
      setHelper('Copied to clipboard');
    } catch (e) {
      setHelper('Copy failed. Your browser may block clipboard access.');
    }
  }

  function setHelper(msg) {
    el.helper.textContent = msg || '';
  }

  // Persist UI state
  function saveState() {
    localStorage.setItem(STORAGE.category, el.property.value);
    localStorage.setItem(STORAGE.unitA, el.unitA.value);
    localStorage.setItem(STORAGE.unitB, el.unitB.value);
    localStorage.setItem(STORAGE.precision, el.precision.value);
  }

  // Theme removed: always light
  function restoreTheme() {}
  function toggleTheme() {}

  function restoreState() {
    const category = localStorage.getItem(STORAGE.category);
    const unitA = localStorage.getItem(STORAGE.unitA);
    const unitB = localStorage.getItem(STORAGE.unitB);
    const precision = localStorage.getItem(STORAGE.precision);

    if (category && UNITS[category]) {
      el.property.value = category;
    }
    populateUnits(el.property.value, el.unitA, unitA);
    populateUnits(el.property.value, el.unitB, unitB);

    if (precision) {
      el.precision.value = precision;
    }
  }

  // Event handlers
  function onCategoryChange() {
    const cat = el.property.value;
    populateUnits(cat, el.unitA, UNITS[cat].base);
    populateUnits(cat, el.unitB, Object.keys(UNITS[cat].units).find(u => u !== UNITS[cat].base));
    applyUnitFilter(el.unitFilter.value);
    // Trigger recalculation
    if (document.activeElement === el.inputB) {
      computeFromB();
    } else {
      computeFromA();
    }
    saveState();
  }

  function computeFromA() {
    const raw = sanitizeNumericInput(el.inputA.value);
    const v = Number(raw);
    const cat = el.property.value;
    if (!Number.isFinite(v)) {
      el.inputB.value = '';
      setHelper('Enter a valid number.');
      return;
    }
    const out = convert(cat, el.unitA.value, el.unitB.value, v);
    const precision = el.precision.value;
    el.inputB.value = formatNumber(out, precision).replace(/,/g, ''); // keep plain in input
    const pretty = `${formatNumber(out, precision)} ${symbolOf(cat, el.unitB.value)}`;
    const lhs = `${formatNumber(v, precision)} ${symbolOf(cat, el.unitA.value)}`;
    const rhs = `${formatNumber(out, precision)} ${symbolOf(cat, el.unitB.value)}`;
    const big = document.getElementById('bigResult');
    if (big) big.textContent = pretty;
    setHelper(`${lhs} = ${rhs}`);
    saveState();
  }

  function computeFromB() {
    const raw = sanitizeNumericInput(el.inputB.value);
    const v = Number(raw);
    const cat = el.property.value;
    if (!Number.isFinite(v)) {
      el.inputA.value = '';
      setHelper('Enter a valid number.');
      return;
    }
    const out = convert(cat, el.unitB.value, el.unitA.value, v);
    const precision = el.precision.value;
    el.inputA.value = formatNumber(out, precision).replace(/,/g, '');
    const pretty = `${formatNumber(out, precision)} ${symbolOf(cat, el.unitA.value)}`;
    const lhs = `${formatNumber(v, precision)} ${symbolOf(cat, el.unitB.value)}`;
    const rhs = `${formatNumber(out, precision)} ${symbolOf(cat, el.unitA.value)}`;
    const big = document.getElementById('bigResult');
    if (big) big.textContent = pretty;
    setHelper(`${lhs} = ${rhs}`);
    saveState();
  }

  function symbolOf(category, unitKey) {
    return UNITS[category]?.units?.[unitKey]?.symbol ?? unitKey;
  }

  function onUnitChange() {
    if (document.activeElement === el.inputB) {
      computeFromB();
    } else {
      computeFromA();
    }
    saveState();
  }

  function swapUnits() {
    const ua = el.unitA.value;
    const ub = el.unitB.value;
    el.unitA.value = ub;
    el.unitB.value = ua;

    const focusB = document.activeElement === el.inputB;
    if (focusB) {
      // Keep values consistent: swap inputs then compute
      const tmp = el.inputA.value;
      el.inputA.value = el.inputB.value;
      el.inputB.value = tmp;
      computeFromA();
    } else {
      const tmp = el.inputA.value;
      el.inputA.value = el.inputB.value;
      el.inputB.value = tmp;
      computeFromB();
    }
    saveState();
  }

  function clearInput(which) {
    if (which === 'A') {
      el.inputA.value = '';
      computeFromA();
      el.inputA.focus();
    } else {
      el.inputB.value = '';
      computeFromB();
      el.inputB.focus();
    }
  }

  function onPrecisionChange() {
    // Recompute with new precision
    if (document.activeElement === el.inputB) {
      computeFromB();
    } else {
      computeFromA();
    }
    saveState();
  }

  // Init
  function init() {
    // Theme removed
    restoreTheme();

    // Populate categories and state
    populateCategories();
    el.property.value = localStorage.getItem(STORAGE.category) || 'Length';
    populateUnits(el.property.value, el.unitA, localStorage.getItem(STORAGE.unitA) || UNITS[el.property.value].base);
    populateUnits(el.property.value, el.unitB, localStorage.getItem(STORAGE.unitB));
    el.precision.value = localStorage.getItem(STORAGE.precision) || '2';

    // Filter initial
    applyUnitFilter('');

    // Wire events
    el.property.addEventListener('change', onCategoryChange);
    el.unitA.addEventListener('change', onUnitChange);
    el.unitB.addEventListener('change', onUnitChange);
    el.precision.addEventListener('change', onPrecisionChange);
    el.swapBtn.addEventListener('click', swapUnits);

    el.unitFilter.addEventListener('input', (e) => {
      applyUnitFilter(e.target.value);
    });

    // Input handlers with input event for immediate response
    el.inputA.addEventListener('input', () => computeFromA());
    el.inputB.addEventListener('input', () => computeFromB());

    // Enter to select all for ease of editing
    [el.inputA, el.inputB].forEach(inp => {
      inp.addEventListener('focus', (e) => e.target.select());
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') e.target.select();
      });
    });

    // Copy & clear
    el.copyA.addEventListener('click', () => copyToClipboard(el.inputA));
    el.copyB.addEventListener('click', () => copyToClipboard(el.inputB));
    el.clearA.addEventListener('click', () => clearInput('A'));
    el.clearB.addEventListener('click', () => clearInput('B'));

    // Initial compute
    computeFromA();
  }

  document.addEventListener('DOMContentLoaded', init);
})();