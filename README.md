# Three Years of Us — Anniversary Website

A romantic, fully responsive 3-year anniversary site built with plain **HTML5, CSS3, Vanilla JavaScript, and Bootstrap 5 (CDN)**. No frameworks, no build step, no backend.

## Run it

Open `index.html` in a browser, or serve the folder:

```powershell
python -m http.server 5599
# http://127.0.0.1:5599
```

Internet access is needed for the Bootstrap, Google Fonts, Bootstrap Icons, and canvas-confetti CDNs. All artwork is local, so the site still looks complete if image CDNs are unavailable.

## Files

```
index.html          All page sections and modals
style.css           Design system, layout, animations, responsive rules
script.js           Live counter, heart canvas, reveals, lightbox, confetti
assets/             Seven hand-built SVG illustrations + favicon
README.md
```

## Make it yours

### 1. Anniversary countdown date

In `script.js`, edit:

```js
const CONFIG = {
  anniversaryDate: new Date(2026, 10, 12, 0, 0, 0), // 12 Nov 2026 (month is 0-indexed)
};
```

The hero timer counts down to `anniversaryDate` in years / days / hours / minutes / seconds and reaches zero at that exact moment. After the anniversary, it stays at zero and the caption changes to "Our 3rd anniversary is here."

The relationship start date is derived as exactly three years before `anniversaryDate` (12 Nov 2023) and powers the "days together" totals.

### 2. Names and monogram

Search `index.html` for:

- `A<span class="amp">&amp;</span>J` — navbar monogram
- `A &amp; J` — envelope and footer monograms
- `12 · 11 · 2023` — hero date
- Letter date `November 12, 2026`

The brand label `est. 2023` is in the navbar too.

### 3. Photos

The gallery uses custom editorial SVG illustrations as placeholders. To use real photos:

1. Drop your images into `assets/` (JPG, PNG, WebP, or SVG).
2. Replace the six `src="assets/..."` values in the gallery `<figure>` blocks in `index.html`.
3. Also replace the three timeline thumbnails if you like.
4. Update each `alt` text and the adjacent `data-title` / `data-meta` attributes used by the lightbox.

Portrait images work best for the masonry layout. The gallery opens a keyboard-friendly lightbox with previous/next navigation.

### 4. Letter and surprises

- Edit the letter inside `#letterModal` in `index.html`.
- Edit the rotating surprise messages in the `messages` array in `script.js`.

## Included sections

- Full-screen hero with canvas heart particles and soft glows
- Live 3-year relationship counter
- Scroll-reveal vertical timeline for years 1–3
- Masonry photo gallery with lightbox
- Interactive sealed envelope + love-letter modal
- Canvas-confetti surprise with randomized pop-up messages
- Sticky glass navbar, scroll progress, active-link tracking, and back-to-top

## Accessibility & performance notes

- Respects `prefers-reduced-motion` (static hearts, no reveals, reduced confetti)
- Keyboard-accessible gallery and skip link
- Semantic HTML, unique IDs, alt text on every image, ARIA labels on icon buttons
- Lazy-loaded gallery images; animated canvas pauses off-screen

Designed to feel like a love letter — soft rose, warm red, gold, and cream.
