const translations = new Map([
  ['继续上次的剪纸', 'Resume saved work'], ['从一张完整的纸开始', 'Start with a fresh sheet'],
  ['观察角度', 'Viewing angle'], ['正在准备三维光影…', 'Preparing the 3D window…'],
  ['三维实景 · 拖动剪纸或调整视角', '3D window · Drag your cutting or change the viewing angle'],
  ['此设备暂不支持三维，已显示平面预览', '3D is unavailable on this device. Showing the flat preview.'],
  ['贴上窗，看看光影', 'Try it on a window'],
  ['回到剪纸台', 'Back to the studio'], ['纸映窗间', 'Paper, glass & light'], ['窗模型', 'Window model'], ['暂停微风', 'Pause breeze'], ['开启微风', 'Resume breeze'],
  ['把心意贴上窗，让光穿过你的剪纸。', 'Place your artwork on the glass and let the light through.'],
  ['选择窗外光线', 'Choose the light outside'], ['阳光', 'Sunlight'], ['雪景', 'Snow'], ['暖色晨曦', 'Warm dawn'],
  ['窗上的剪纸，可拖动或使用方向键移动', 'Your paper cutting on the window. Drag or use arrow keys to move it.'],
  ['拖动剪纸，找到喜欢的位置；方向键也能移动。', 'Drag your cutting into place, or use the arrow keys.'],
  ['剪纸大小', 'Paper size'], ['重新居中', 'Center artwork'],
  ['阳光穿过窗，照亮剪纸的每一处细节。', 'Sunlight finds its way through every cut.'],
  ['雪落无声，一抹纸色暖了整扇窗。', 'Snow falls quietly. A little color warms the whole window.'],
  ['黎明的暖光，轻轻染上窗与纸。', 'Warm dawn light gently colors your window and paper.'],
  ['一纸生花', 'Paper in Bloom'],
  ['指 尖 上 的 剪 纸 工 坊', 'THE PAPER-CUTTING STUDIO'],
  ['以纸为笺，以剪为笔', 'A sheet of paper. A world of possibility.'],
  ['剪纸小笺', 'How to create'],
  ['一纸一剪，', 'One sheet. '],
  ['万象生花。', 'Endless possibilities.'],
  ['方寸之间', 'A little paper'], ['自有天地', 'a world within'],
  ['折纸', 'Paper folds'], ['起于一张纸', 'Begin here'],
  ['四折', '4-fold'], ['五折', '5-fold'], ['六折', '6-fold'],
  ['纸色', 'Paper color'], ['朱砂', 'Vermilion'], ['胭脂', 'Rouge'], ['秋香', 'Ochre'], ['松烟', 'Pine'],
  ['执笔与剪', 'Sketch & cut'], ['剪刀', 'Scissors'], ['画笔', 'Pencil'],
  ['圈选一处，轻轻剪去', 'Trace a loop to cut'], ['先勾勒心中的图案', 'Sketch your idea first'],
  ['剪', 'Cut'], ['绘', 'Draw'],
  ['显示折痕参考线', 'Show fold guide'],
  ['慢慢来，', 'Take your time.'], ['美好藏在留白里。', 'Beauty lives in the spaces.'],
  ['虚实相生 · 剪出心意', 'Make room for imagination'],
  ['按住拖动，圈出想剪去的部分，松开即可裁剪', 'Drag a loop around the area to remove. Release to cut.'],
  ['在纸上轻轻勾画，草图不会出现在成品中', 'Sketch on the paper. Pencil marks stay out of the finished piece.'],
  ['展开 · 见惊喜', 'Unfold & reveal'],
  ['从一朵花开始', 'A little inspiration'],
  ['不妨借一缕灵感，', 'Start with a little inspiration,'], ['再剪出自己的模样。', 'then make it your own.'],
  ['团花', 'Blossom'], ['花开圆满', 'In full bloom'], ['繁星', 'Starlight'], ['星河入梦', 'A sky of stars'], ['叶语', 'Leaves'], ['一叶知秋', 'An autumn whisper'],
  ['点击花样，接着创作', 'Choose a pattern to make your own'],
  ['心', '心'], ['剪去的是纸，留下的是心意。', 'A little paper. A piece of you.'],
  ['作品仅保存在此浏览器', 'Your work stays in this browser'],
  ['已自动保存 · 仅此浏览器', 'Autosaved in this browser'],
  ['暂未保存，请下载作品', 'Not saved — please download your artwork'],
  ['已找回上次的剪纸', 'Your last artwork has been restored'],
  ['折 · 画 · 剪 · 展', 'FOLD · SKETCH · CUT · REVEAL'],
  ['一张纸的奇妙旅程', 'A little paper, a little wonder'],
  ['折一折', 'Fold'], ['画一画', 'Sketch'], ['剪一剪', 'Cut'], ['展一展', 'Reveal'],
  ['选择四折、五折或六折，得到四、五或六重对称的花样。这里的折数指花样的对称方式。', 'Choose 4-, 5-, or 6-fold symmetry. The number describes how the design repeats around its center, rather than how many times the paper is physically halved.'],
  ['用画笔在红纸上勾勒草图。铅笔线只是参考，展开与导出时不会显示。', 'Use the pencil to sketch a guide on your paper. These marks are only a reference: they disappear when you unfold or download your artwork.'],
  ['选中剪刀，按住拖动圈出一个区域，松开即剪去。也可逐点点击，按回车闭合裁剪。剪过纸边，可以改变轮廓；剪在纸内，可以镂空。', 'Select the scissors, drag a loop, and release to cut. You can also click point by point and press Enter to finish. Cut across an edge to shape the outline, or inside the paper to create a hole.'],
  ['点击展开，看看你的剪纸。还可以收起继续剪，或保存透明背景的图片。', 'Unfold to reveal your artwork. Fold it back to keep cutting, or download a PNG image with a transparent background.'],
  ['剪错了也没关系，撤销即可。花样按钮会替换当前作品。', 'Made a cut you don’t like? Undo it. Choosing a starter pattern replaces the current artwork.'],
  ['开始我的剪纸', 'Start creating'],
  ['一纸生花首页', 'Paper in Bloom home'], ['剪纸工作台', 'Paper-cutting studio'], ['折纸方式', 'Fold symmetry'], ['选择纸色', 'Choose a paper color'],
  ['朱砂红', 'Vermilion red'], ['胭脂红', 'Rouge red'], ['秋香金', 'Ochre gold'], ['松烟绿', 'Pine green'],
  ['撤销', 'Undo'], ['重做', 'Redo'], ['重新开始', 'Start over'], ['关闭说明', 'Close instructions'],
  ['撤销（Ctrl+Z）', 'Undo (Ctrl/Cmd+Z)'], ['重做（Ctrl+Shift+Z）', 'Redo (Ctrl/Cmd+Shift+Z)'],
  ['剪纸画布。拖动画笔勾画；使用剪刀拖动圈选，松开后剪去。也可点击逐点圈选，按回车完成，退出键取消。', 'Paper canvas. Drag to sketch with the pencil, or trace a loop with the scissors and release to cut. You can also click point by point, press Enter to finish, or Escape to cancel.'],
  ['浏览器暂时无法保存，请展开后下载作品', 'Your browser could not save this draft. Unfold and download your artwork to keep it.'],
  ['圈出的范围太小，再试着剪大一点', 'That loop is too small. Try cutting a slightly larger area.'],
  ['没有剪到纸，请把圈选范围移到纸上', 'That cut missed the paper. Move your loop onto the sheet.'],
  ['继续点击圈选，按回车完成，退出键取消', 'Keep clicking to trace a shape. Enter to cut, Escape to cancel.'],
  ['这会替换当前作品。是否继续？', 'This will replace your current artwork. Continue?'],
  ['新纸已铺好，重新落剪吧', 'A fresh sheet is ready. Make your first cut.'],
  ['方寸红纸，展开便是满眼风华。', 'A single sheet, a world revealed.'],
  ['收起继续剪', 'Fold & keep cutting'], ['保存我的剪纸', 'Download artwork'],
  ['图片生成失败，请重试', 'The image could not be created. Please try again.'],
  ['剪纸已保存为透明背景图片', 'Your artwork has been downloaded with a transparent background.'],
  ['花样已铺好，添上属于你的一剪', 'Your pattern is ready. Add your own cuts.'],
  ['尚未落剪', 'No cuts yet'], ['展开 · 一纸生花', 'Unfolded · Paper in Bloom'], ['折纸 · 心意渐成', 'Folded · Taking shape'], ['折纸 · 待你落剪', 'Folded · Ready for your first cut'],
]);
const originals = new Map([...translations].map(([zh, en]) => [en.trim(), zh]));
const textSources = new WeakMap();
export let language = 'zh';
try { if (localStorage.getItem('yizhi-language') === 'en') language = 'en'; } catch {}
export function t(zh, en = translations.get(zh) || zh) { return language === 'en' ? en : zh; }
export function toggleLanguage() {
  language = language === 'zh' ? 'en' : 'zh';
  try { localStorage.setItem('yizhi-language', language); } catch {}
}
export function translateDocument() {
  document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
  document.title = t('一纸生花 · 剪纸工坊', 'Paper in Bloom · Paper-cutting Studio');
  document.querySelector('meta[name="description"]').content = t('一张红纸，一把剪刀。勾画、裁剪、展开，在指尖创造属于你的中式窗花。', 'Fold, sketch, cut and unfold your own Chinese-inspired paper art.');
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest('script, style, .seal, .dialog-seal, #language-toggle')) continue;
    // Keep each text node's exact source: distinct Chinese labels can share
    // an English translation, and repeated toggles must not add whitespace.
    const prior = textSources.get(node);
    const source = prior && node.nodeValue === prior.rendered ? prior.source : node.nodeValue;
    const value = source.trim();
    const zh = translations.has(value) ? value : originals.get(value);
    if (zh && translations.has(zh)) {
      const rendered = source.replace(value, t(zh));
      textSources.set(node, {source, rendered});
      node.nodeValue = rendered;
    }
  }
  document.querySelectorAll('[aria-label], [title]').forEach(el => {
    if (el.id === 'language-toggle') return;
    for (const attr of ['aria-label', 'title']) {
      const value = el.getAttribute(attr);
      const zh = originals.get(value) || value;
      if (translations.has(zh)) el.setAttribute(attr, t(zh));
    }
  });
  const button = document.querySelector('#language-toggle');
  button.textContent = language === 'en' ? '中文' : 'English';
  button.lang = language === 'en' ? 'zh-CN' : 'en';
  button.setAttribute('aria-label', language === 'en' ? '切换到中文' : 'Switch to English');
}
