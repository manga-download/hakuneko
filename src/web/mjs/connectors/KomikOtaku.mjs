import Kyuroku from './Kyuroku.mjs';

/**
 * Alias for backward compatibility
 */
export default class KomikOtaku extends Kyuroku {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'komikotaku';
        super.label = 'KomikOtaku';
    }
}