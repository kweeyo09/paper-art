# 一纸生花

Chinese and English paper-cutting studio, written in HTML, CSS and JavaScript, with a Three.js 3D window preview.

Run `node serve.cjs`, then open http://127.0.0.1:4173.

Choose 4/5/6-fold symmetry, sketch with the pencil, or drag a closed loop with scissors to subtract paper. Click-by-click polygon cuts can be completed with Enter and cancelled with Escape. Undo/redo supports Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z. Reveal mirrors the folded wedge into a complete design, which can be saved as a 2400-pixel transparent PNG. Local draft storage is automatic when the browser permits it.

Each visit starts with a complete, uncut sheet. Use **Resume saved work** to restore a previous draft; making new edits replaces the saved draft. The fold labels refer to radial symmetry order, not repeated physical halving. Drawing requires pointer input; buttons, dialogs and polygon completion support keyboard input. Font loading uses Google Fonts with local Chinese fallbacks.

After revealing your cutting, choose **Try it on a window**. Switch between morning light, snow, and warm sunset; drag the artwork, use arrow keys (Shift for larger moves), or resize it with the slider. The preview uses the exact paper mask and color, with no sketch guides. Returning to the studio preserves the cutting. Snow animation respects reduced-motion preferences. All preview controls support Chinese and English.

The 3D scene includes a timber frame, recessed plaster wall, glass, garden, directional shadows through the cutting, and an adjustable viewing angle. Its geometry and textures are generated locally. A flat preview remains available if WebGL cannot start. The garden is stylized; a detailed model can replace it later.

Three.js and its license are vendored in `dist/vendor`, so serving the site needs no package installation. To update these files, run `npm ci` then `npm run vendor`. Run `npm run check` for JavaScript syntax validation. The `dist` directory is the complete static website.
