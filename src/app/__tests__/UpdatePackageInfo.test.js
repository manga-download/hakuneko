const assert = require('assert');
const UpdatePackageInfo = require('../UpdatePackageInfo');
const publicKey =
`-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzx5ZZjtNPDbf/iGqdjQj
FyCSIWF4dXDiRUWVga7yBBMJOOEidBDlHeAhQXj64f+IrXCxu+/ySNRgXTYp/1I7
S0HJsgcRz9AlzUVm6jeBZbFs42ggxVOxPA8RQDcEZFU/YDPQuYmz82euhI8VqDoZ
VlHmFOUICTgp7GvNNK94KDxx3H0qX9kv1U3tQEdxb9FFH5kzg4dR5/5WSriFFMNS
QDVrm5yAaEfty75u2Os1hobY9r5ACHpaoxitPBUNgqX7lORseb3t+dfoDVhowTXy
P0xJDQn8Kz3JTmVUjPnZO+JFcvVjtYU2x+i0ab/qfTDSB5W62HUFQZ40EUTXeNN3
owIDAQAB
-----END PUBLIC KEY-----`;

class TestFixture {

    constructor() {
        //
    }

    // signature matches and archive is valid ZIP
    static get archiveMock() {
        return {
            signature: '87627cda741492d3c947a0b119e11cb572236d59b46c610054dfd631697f53c6ccbeba615b8a772600755f524b8537b2ae9c7fb306b3b9057d10b2f3526d6e87a074a549af4375cbd6861267fa477303a50843ded86488400d0d62b3d2482146378eb3d278ce0ce17720823e6761793116bedb4f6771c05383c4324bb514436f4f0e3d6cabc1b627ae8af15119324d034588ad884179744eec8db24fcdbeb75a6d2490d535d909ec362e3cce74612167a8ae7e28daee599b3408d4ed192ae1a6484d84a34daafbd86b9c7b9c6776f10d0a9c352183d7c0a100309999cd541cc97412898e83df40e1d6aaf9b89c0c97f06fb7490bf191ac087fb339864fadc7f6',
            archive: Buffer.from('504b03040a0300000000168e4a4b2dd936d702000000020000000a000000696e6465782e68746d6c4f4b504b01023f030a0300000000168e4a4b2dd936d702000000020000000a0024000000000000002080a48100000000696e6465782e68746d6c0a002000000000000100180000568740df41d3010029563fdf41d30100568740df41d301504b050600000000010001005c0000002a0000000000', 'hex')
        };
    }

    // signature matches, but archive is not valid ZIP
    static get emptyMock() {
        return {
            signature: '8345939337c46abdbc27fd3bffff0618af75fc5b90a9872a310a9cef7f9cd23a2354fee47d9a1a4cb0d65e26527bef56c16f218697f590238ab5a364860984c284a2a3745f8817ba15086e7227f34d4c311fa541de23a48a3d2a19396ac1a992c8a78fc8a8a315402181bc8d10e91919e42b7fb50613fedebe5160b28b5703ecc5597ca3e2aad9913df616bbc82835bd7a0927222773e42aebf8c0ee637d5aef99dad456561ff6267c33a8656efb4b5644a925e7c1b6db370af8e491528591d479b3f6c04c0914d7df7a4233cd615c6790b1f4df2f2fed5582b966fb269b9268599010addce427b3f2c1809ac96519056cc3d8bd51c440ee50a650b1968a2392',
            archive: Buffer.from('87fb74631726132b3df3387819f286d8a298fefb6c64287cb3bc7a1e92cd2e83', 'hex')
        };
    }
}

/**
 * MODULE TESTS
 */
describe('UpdatePackageInfo', function () {

    describe('validate()', function () {

        it('should get result when the signature is valid for the archive', async () => {
            let expected = TestFixture.archiveMock.archive;
            let testee = new UpdatePackageInfo('', TestFixture.archiveMock.signature, '');
            let result = await testee.validate(expected, publicKey);
            assert.equal(result, expected);
        });

        it('should throw error when the signature is invalid for the archive', async () => {
            let testee = new UpdatePackageInfo('', TestFixture.emptyMock.signature, '');
            try {
                await testee.validate(TestFixture.archiveMock.archive, publicKey);
                assert.fail('Expected error not thrown!');
            } catch(error) {
                assert.equal('Integrity check of update failed! The signature does not match the update package.', error.message);
            }
        });
    });
});