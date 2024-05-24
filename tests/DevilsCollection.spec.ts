import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { DevilsCollection } from '../wrappers/DevilsCollection';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('DevilsCollection', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('DevilsCollection');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let devilsCollection: SandboxContract<DevilsCollection>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        devilsCollection = blockchain.openContract(DevilsCollection.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await devilsCollection.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: devilsCollection.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and devilsCollection are ready to use
    });
});
