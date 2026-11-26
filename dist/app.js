// Standalone entry: the same studio that kixizz.com mounts at /paper-art/studio.
// Add ?edit to the URL on a local server to open the layout editor.
import {mountStudio} from './studio.js';
const local = ['localhost', '127.0.0.1'].includes(location.hostname);
mountStudio(document.querySelector('#paper-studio'), {homeHref: './', editLayout: local && new URLSearchParams(location.search).has('edit')});
