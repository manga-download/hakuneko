import VRV from './templates/VRV.mjs';

/**
 *
 */
export default class VRVHiDive extends VRV {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'vrv-hidive';
        super.label = 'VRV (HiDive)';
        this.tags = [ 'anime', 'dubbed', 'english' ];
        // Private members for internal usage only (convenience)
        this.subscriptionID = 'hidive';
    }
}