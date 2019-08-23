import VRV from './templates/VRV.mjs';

/**
 *
 */
export default class VRVCrunchyroll extends VRV {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'vrv-crunchyroll';
        super.label = 'VRV (Crunchyroll)';
        this.tags = [ 'anime', 'subbed', 'multi-lingual' ];
        // Private members for internal usage only (convenience)
        this.subscriptionID = 'crunchyroll';
    }
}