---
target: ramos-de-atividades
total_score: 22
p0_count: 1
p1_count: 1
timestamp: 2026-07-17T23-11-40Z
slug: s-de-atividades-ramos-de-atividades-component-html
---
| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Good |
| 2 | Match System / Real World | 2 | Raw extracted text blocks |
| 3 | User Control and Freedom | 3 | Good |
| 4 | Consistency and Standards | 1 | Unstructured markup and arbitrary classes |
| 5 | Error Prevention | 3 | n/a |
| 6 | Recognition Rather Than Recall | 2 | Identical cards hide info |
| 7 | Flexibility and Efficiency | 2 | No accelerators |
| 8 | Aesthetic and Minimalist Design | 1 | Fails "Revolução Laranja" guidelines |
| 9 | Error Recovery | 3 | n/a |
| 10 | Help and Documentation | 2 | No clear CTA or guidance |
| **Total** | | **22/40** | **Acceptable** |

### Anti-Patterns Verdict
**LLM assessment**: Yes, it shows clear AI slop tells. The "Ramos de Atividades" relies entirely on the identical card grid template (a banned pattern). "Departamento Pessoal" is built from raw extracted `<span class="ds-style-*">` elements, looking like a pasted Word document rather than a crafted UI.
**Deterministic scan**: 0 findings reported by CLI.
**Visual overlays**: Skipped (no browser automation available in this session).

### Overall Impression
Both pages fail to deliver the energetic "Revolução Laranja" promised in the brand guidelines. They feel generic and unfinished, lacking the #ff3300 primary color and clear typographical hierarchy.

### What's Working
- The pages are simple and don't overwhelm with complex layouts.
- Use of standard Ionic grid gives a baseline responsive structure.

### Priority Issues
**[P0] Raw text dump in "Departamento Pessoal"**
- **Why it matters**: It looks broken, ignores the brand's typography system, and is difficult to scan.
- **Fix**: Extract the text into clean semantic HTML (`<h2>`, `<p>`, `<ul>`). Apply the "One Font Rule" properly with `Inter` and use the brand's spacing tokens.
- **Suggested command**: `$impeccable polish`

**[P1] Identical card grid in "Ramos de Atividades"**
- **Why it matters**: It feels generic, ignoring the brand's instruction to be energetic and avoid the "startup excessivamente informal" ou "burocrático".
- **Fix**: Break the grid. Use a list with strong typography, asymmetrical layout, or accordions if the list grows.
- **Suggested command**: `$impeccable layout`

**[P2] Complete absence of the brand color**
- **Why it matters**: "A Revolução Laranja" is entirely missing, making the brand indistinguishable from competitors.
- **Fix**: Introduce #ff3300 for key highlights or a primary CTA in the page header.
- **Suggested command**: `$impeccable colorize`

### Persona Red Flags
**Jordan (First-Timer)**: Sees a wall of text in "Departamento Pessoal" with scattered contact info at the bottom. No clear CTA like "Falar com um especialista". Will likely abandon.
**Casey (Distracted Mobile User)**: On "Ramos de Atividades", the 3-column grid stacks into a very long scroll of identical cards. Hard to scan quickly.

### Minor Observations
- Contact information in `departamento-pessoal` is split across 4 different `div.extracted-content` blocks instead of being grouped together into a cohesive contact card.
- No CTAs are present to convert the user.

### Questions to Consider
- Does "Ramos de Atividades" need to show all these lists, or could we use a more visual approach?
- Should the contact info in "Departamento Pessoal" be a reusable global CTA component?
