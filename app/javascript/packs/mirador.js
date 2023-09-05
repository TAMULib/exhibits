import Mirador from 'mirador';

const urlParams = new URLSearchParams(window.location.search);

const config = {
  id: 'mirador',
  language: 'en',
  availableLanguages: {
    en: 'English',
  },
  theme: {
    palette: {
      primary: {
        main: '#500000',
      },
    },
    transitions: {}
  },
  workspace: {
    showZoomControls: true,
    type: 'mosaic',
  },
  workspaceControlPanel: {
    enabled: true
  },
  windows: [{
    manifestId: urlParams.get('manifest'),
    defaultSideBarPanel: 'info',
    allowClose: false,
    allowMaximize: true,
    sideBarOpenByDefault: false
  }],
  catalog: []
};

Mirador.viewer(config);
