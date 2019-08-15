import HakuNeko from './HakuNeko.mjs'
import FrontendLoader from './FrontendLoader.mjs'

window.HakuNeko = new HakuNeko();
// TODO: remove backward compatibility when all references are set to HakuNeko engine
//window.Engine = window.HakuNeko;

// TODO: remove backward compatibility for global aliases of enums
// when all their references are set to HakuNeko engine
window.Input = window.HakuNeko.Enums.Input;
window.EpisodeFormat = window.HakuNeko.Enums.EpisodeFormat;
window.ChapterFormat = window.HakuNeko.Enums.ChapterFormat;
window.HistoryFormat = window.HakuNeko.Enums.HistoryFormat;
window.DownloadStatus = window.HakuNeko.Enums.DownloadStatus;
window.EventListener = window.HakuNeko.Enums.EventListener;

// load a UI frontend after HakuNeko engine is globally accessable
let option = { value: 'frontend@classic-dark', name: 'Classic (Dark)' };
//let option = { value: 'frontend@classic-light', name: 'Classic (Light)' };
console.log('Loading Frontend:', option.name);
FrontendLoader.load(option.value);