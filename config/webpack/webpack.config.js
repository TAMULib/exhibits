// config/webpack/webpack.config.js
const { generateWebpackConfig, merge } = require('shakapacker');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

function gemRoot(gem) {
  try {
    return execSync(`bundle show ${gem}`, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim();
  } catch {
    return null;
  }
}

function firstExisting(paths) {
  return paths.find(p => fs.existsSync(p)) || null;
}

const aliases = {};

// ---- blacklight-gallery ----
(() => {
  const root = gemRoot('blacklight-gallery');
  if (!root) return;
  const target = firstExisting([
    path.join(root, 'app/javascript/blacklight-gallery.js'),
    path.join(root, 'app/javascript/blacklight_gallery.js'),
    path.join(root, 'app/javascript/blacklight-gallery/index.js'),
    path.join(root, 'app/javascript/blacklight_gallery/index.js'),
    path.join(root, 'app/javascript'), // fallback if index.js exists here
  ]);
  if (target) {
    aliases['blacklight-gallery'] = target;
    aliases['blacklight_gallery'] = target;
  }
})();

// ---- blacklight-oembed ----
(() => {
  const root = gemRoot('blacklight-oembed');
  if (!root) return;

  // Try ES-style files ONLY (no folder fallback)
  const esTarget = firstExisting([
    path.join(root, 'app/javascript/blacklight-oembed.js'),
    path.join(root, 'app/javascript/blacklight_oembed.js'),
    path.join(root, 'app/javascript/blacklight-oembed/index.js'),
    path.join(root, 'app/javascript/blacklight_oembed/index.js'),
  ]);
  if (esTarget) {
    aliases['blacklight-oembed$'] = esTarget;
    aliases['blacklight_oembed$'] = esTarget;
    return;
  }

  // Fallback to the legacy Sprockets asset shipped by the gem
  const legacyTarget = firstExisting([
    path.join(root, 'app/assets/javascripts/blacklight/oembed.js'),
    path.join(root, 'vendor/assets/javascripts/blacklight/oembed.js'),
    path.join(root, 'app/assets/javascripts/blacklight-oembed.js'),
    path.join(root, 'app/assets/javascripts/blacklight_oembed.js'),
  ]);
  if (legacyTarget) {
    // $ ensures `import 'blacklight-oembed'` resolves to THIS file
    aliases['blacklight-oembed$'] = legacyTarget;
    aliases['blacklight_oembed$'] = legacyTarget;
  }
})();

// --- blacklight-spotlight alias for `import 'spotlight'` ---
(() => {
  const root = gemRoot('blacklight-spotlight');
  if (!root) return;
  const target = firstExisting([
    // common entry locations across Spotlight versions
    path.join(root, 'app/javascript/spotlight.js'),
    path.join(root, 'app/javascript/spotlight/index.js'),
    path.join(root, 'app/javascript/spotlight.esm.js'),
    path.join(root, 'app/javascript/spotlight'), // directory with index.js
    // older fallbacks
    path.join(root, 'app/assets/javascripts/spotlight.js'),
    path.join(root, 'app/javascript') // last-resort if gem ships an index.js there
  ]);
  if (target) {
    aliases['spotlight'] = target;
  }
})();

// Optional: make these importable by name if your packs use them
for (const [alias, gem] of Object.entries({
  'blacklight': 'blacklight',
  'blacklight-spotlight': 'blacklight-spotlight',
  'openseadragon': 'openseadragon',
})) {
  const root = gemRoot(gem);
  if (!root) continue;
  const dir = path.join(root, 'app/javascript');
  if (fs.existsSync(dir)) aliases[alias] = dir;
}

const custom = {
  resolve: {
    alias: aliases,
    modules: [
      path.resolve(__dirname, '../../app/javascript'),
      'node_modules',
    ],
    extensions: ['.js', '.jsx', '.mjs', '.ts', '.tsx', '.coffee'],
  },
};

module.exports = merge(generateWebpackConfig(), custom);
