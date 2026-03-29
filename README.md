# Text Annotation App (Angular 21)

Test assignment for UNADESK.

## Goal

Build an SPA that allows users to create articles and annotate selected text fragments.

---

## Features

- Create, edit and delete articles
- Select text and add annotation (color + note)
- Highlight annotated text
- Show tooltip on hover
- Store data in `localStorage`

---

## Implementation Highlights

- **Text-based rendering** (no DOM mutation via Range API)
- **Stable annotation anchoring** using:
  - selected text (`quote`)
  - position (`start`, `end`)
  - surrounding context
- **Separation of concerns**:
  - `pages` — orchestration
  - `services` — logic & data
  - `lib` — pure functions
  - `ui` — presentational components
- **Modern Angular**:
  - standalone components
  - signals (`signal`, `input`, `output`)
  - strict typing

---

## Run

```bash
npm install
ng serve
```

Open http://localhost:4200

---

## Notes

- `innerHTML` is used intentionally with full escaping
- No external libraries (as required)

---

## Author

Mikhail Kanavalov for UNADESK
