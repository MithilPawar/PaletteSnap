# PaletteSnap

PaletteSnap is a browser-based color palette extractor for real production workflows.

It pulls dominant colors from any image and returns:
- HEX codes
- RGB values
- CSS variables
- WCAG contrast audit across color pairs

## Why This Project

PaletteSnap solves a common design-development handoff problem:
- Designers can quickly identify exact brand/reference colors.
- Developers can paste ready-to-use CSS variables directly into code.
- Content and marketing teams can validate visual consistency and brand color usage.

## Features

- Drag-and-drop image upload
- URL-based image loading (with validation)
- Configurable palette size (4, 6, 8, 12)
- Dominant color extraction with color-share percentage
- One-click copy:
  - Single HEX
  - All HEX values
  - CSS variable block
- Palette PNG export
- Accessibility audit:
  - Contrast ratio for each color pair
  - WCAG AA/AAA pass/fail badges
- Responsive UI for desktop and mobile

## Tech Stack

- HTML5
- CSS (modular component files)
- Vanilla JavaScript (ES modules, feature-based structure)

## Project Structure

```text
.
|-- index.html
|-- README.md
|-- js/
|   |-- app.js
|   |-- core/
|   |   |-- state.js
|   |   `-- utils.js
|   `-- features/
|       |-- app/
|       |   `-- controller.js
|       |-- export/
|       |   `-- palette-actions.js
|       |-- import/
|       |   `-- image-loader.js
|       `-- palette/
|           |-- extractor.js
|           `-- view.js
`-- styles/
    |-- main.css
    |-- base.css
    |-- layout.css
    |-- inputs.css
    |-- results.css
    `-- feedback.css
```

## Run Locally

This is a static frontend project.

1. Open `index.html` in your browser.
2. Upload an image or paste an image URL.
3. Extract colors and use export/copy actions.

## Usage Example

Client sends a logo and asks: "Match the website colors to this."

With PaletteSnap:
1. Drop logo into the app.
2. Extract 6 dominant colors.
3. Copy generated CSS variables.
4. Paste directly into your stylesheet.

## Notes

- Some image URLs may block pixel access due to CORS. If that happens, download and upload the image file directly.
- Contrast checks are based on WCAG ratio thresholds and help guide accessible UI color combinations.

## Future Improvements

- Design token export (`JSON`)
- Tailwind config export
- "Best text pair" recommendations for UI themes
- Save recent palettes in local storage
