# 一纸生花
<!-- impeccable:product-schema 1 -->
## Platform
web
## Product Purpose
An interactive Chinese paper-cutting studio. Select four-, five-, or six-fold radial symmetry, sketch a guide, cut freehand closed selections, and unfold the resulting art.
## Brand Commitments
Elegant Chinese styling. English by default (changed at the user's request, November 2026), with a large 中文 toggle for the entire interface. Remember the language choice in this browser. The header line “以纸为笺，以剪为笔” was removed at the user's request. The introductory sentence beginning “折一张纸” and footer sentence beginning “让传统的美” were removed at the user's request.
## Capabilities and Constraints
Pointer drawing, scissor lasso subtraction, reveal. Implementation additions: undo/redo, paper colors, sample patterns, transparent PNG export, local draft persistence. Four/five/six denotes repeated mirrored sectors, explicitly explained in help.
Finished artwork can be placed on a window with morning light, snow or warm sunset. The preview uses the exact cutting and paper color, supports dragging and keyboard positioning, and has an adjustable size. Both interface languages apply.
## Stack
Implementation choice: dependency-free HTML/CSS/JavaScript with Canvas rendering; no account required for editor state. `studio.js` exports `mountStudio(root, options)` so kixizz.com can serve the studio as its own full page at /paper-art.
