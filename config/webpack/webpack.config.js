// config/webpack/webpack.config.js
const { generateWebpackConfig, merge } = require('shakapacker');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

function gemRoot(gem) {
  try {
    return execSync(`bundle show ${gem}`, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim();
  } catch (_) {
    return null;
  }
}

function firstExisting(paths) {
  return paths.find(p => fs.existsSync(p)) || null;
}

const aliases = {};

// --- blacklight-gallery alias ---
const blg = gemRoot('blacklight-gallery');
if (blg) {
  const candidates = [
    path.join(blg, 'app/javascript/blacklight-gallery.js'),
    path.join(blg, 'app/javascript/blacklight_gallery.js'),
    path.join(blg, 'app/javascript/blacklight-gallery/index.js'),
    path.join(blg, 'app/javascript/blacklight_gallery/index.js')
  ];
  const target = firstExisting(candidates);
  if (target) {
    aliases['blacklight-gallery'] = target;         // supports: import 'blacklight-gallery'
    aliases['blacklight_gallery'] = target;         // just in case underscore is used
  }
}

// (optional) similar aliases if your packs import these by name
for (const [key, gem] of Object.entries({
  'blacklight': 'blacklight',
  'blacklight-spotlight': 'blacklight-spotlight'
})) {
  const root = gemRoot(gem);
  if (root) {
    const dir = path.join(root, 'app/javascript');
    if (fs.existsSync(dir)) aliases[key] = dir;
  }
}

const custom = {
  resolve: {
    alias: aliases,
    modules: [
      path.resolve(__dirname, '../../app/javascript'),
      'node_modules'
    ],
    extensions: ['.js', '.jsx', '.mjs', '.ts', '.tsx', '.coffee']
  }
};

module.exports = merge(generateWebpackConfig(), custom);
