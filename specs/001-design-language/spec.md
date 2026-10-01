# Design Language — Ayurami Web (Retro Ledger)

- **Feature ID**: 001-design-language
- **Status**: Draft
- **Scope**: `banana-project-web`
- **Related issues**: #50 (tokens), #51 (dashboard cohesion), #52 (copy), #53 (a11y/typography)

## 1. Direction

Keep the retro/comic back-office identity: thick black borders, flat offset shadows, warm
paper on deep emerald, with crimson and gold accents. Add one new layer — a *ledger /
receipt* data vernacular (monospace figures, tabular alignment) — so the money and admin
content has its own voice.

## 2. Palette (core unchanged, plus 2 semantic tokens)

| Token | Value | Role |
| --- | --- | --- |
| `ink` | `#1a1208` | Borders and text on paper surfaces |
| `paper` / `cream` | `#FFFDD0` | Light surfaces |
| `crimson` | `#b73301` | Primary surface / action |
| `emerald` | `#016a4d` | App background |
| `gold` (`golden-title`) | `#fab214` | Accent / display pops |
| `goldenrod` | `#FFD700` | Brand pop |
| `guayaba` | `#de9a7f` | Secondary accent |

**Semantic aliases (new):** `ink` (already core) and `muted #6f6152` for secondary text.
Data accents are restricted to the existing `sky-blue` / `turquoise`. No new colour
families.

## 3. Typography

- **Display & UI:** Outfit (400 / 600 / 800 / 900).
- **Data & labels:** one monospace — **Space Mono** (400 / 700) — for figures, IDs, dates,
  and numeric table cells. This is the single "clearly distinct" second family.
- **Retired:** Nunito.
- Sentence case for labels/keys; ALL CAPS is reserved for the brand title treatment, not
  applied to every label.

## 4. Layout & hierarchy

Three tiers:

1. **Panels** — `retro-panel-*`: section containers, border-6 + offset shadow.
2. **Cards** — list rows and KPIs; retro borders, not soft SaaS chips.
3. **Chips** — quiet inner metadata; thin border, flat.

**Hero rule:** the revenue / "today" moment is the single loud element at the top; the KPI
grid is quiet support around it. Content is left-aligned; numbers are right-aligned and
mono-tabular.

## 5. Motion

- One orchestrated entrance per view; no hover-lift on every card.
- Honour `prefers-reduced-motion`.
- Motion answers an action (open, expand, confirm), it is not decoration.

## 6. Voice and copy

- Spanish only; no English leakage.
- CTAs are active and consistent: the button name equals the resulting toast.
- Errors state what happened and how to fix it; empty states invite action.
- Brand emojis are kept (intentional), used sparingly.

## 7. Quality floor

- Visible keyboard focus on all interactive controls.
- `lang="es"` and a meta description; fonts loaded non-blocking.
- Dialogs expose `role="dialog"`, `aria-modal`, Esc to close, and a focus trap; nav marks
  the current item with `aria-current`.
- Text is selectable except inside explicit drag surfaces.

## 8. Non-goals

- No new colour families.
- No redesign of the retro shell / navigation.
- No dark mode in this pass.
