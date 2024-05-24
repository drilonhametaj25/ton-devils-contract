import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type DevilsCollectionConfig = {};

export function devilsCollectionConfigToCell(config: DevilsCollectionConfig): Cell {
    return beginCell().endCell();
}

export class DevilsCollection implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new DevilsCollection(address);
    }

    static createFromConfig(config: DevilsCollectionConfig, code: Cell, workchain = 0) {
        const data = devilsCollectionConfigToCell(config);
        const init = { code, data };
        return new DevilsCollection(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
