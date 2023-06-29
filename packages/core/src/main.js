// We want this to appear on top of the bundle
import './config.js';

import description_component from './components/description.js';
import player_component from './components/player.js';
import sidebar_component from './components/sidebar.js';
import thumbnail_component from './components/thumbnail.js';

function init() {
    player_component.init();
    description_component.init();
    sidebar_component.init();
    thumbnail_component.init();
}

init();
