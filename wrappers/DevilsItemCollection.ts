import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type DevilsItemCollectionConfig = {};

export function devilsItemCollectionConfigToCell(config: DevilsItemCollectionConfig): Cell {
    return beginCell().endCell();
}

export class DevilsItemCollection implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new DevilsItemCollection(address);
    }

    static createFromConfig(config: DevilsItemCollectionConfig, code: Cell, workchain = 0) {
        const data = devilsItemCollectionConfigToCell(config);
        const init = { code, data };
        return new DevilsItemCollection(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
