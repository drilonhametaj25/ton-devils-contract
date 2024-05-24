import { Cell, toNano } from '@ton/core';
import { DevilsCollection } from '../wrappers/DevilsCollection';
import { compile, NetworkProvider } from '@ton/blueprint';
import { getHttpEndpoint } from '@orbs-network/ton-access';
import { TonClient } from '@ton/ton';
import * as fs from "fs";
import { DevilsItemCollection } from '../wrappers/DevilsItemCollection';

export async function run(provider: NetworkProvider) {
    
    const devilsItemCollection = provider.open(DevilsItemCollection.createFromConfig({}, await compile('DevilsItemCollection')));

    console.log("Init deploy")
    await devilsItemCollection.sendDeploy(provider.sender(), toNano('0.05'));
    console.log("Deployed")
    await provider.waitForDeploy(devilsItemCollection.address);

    // run methods on `devilsCollection`
}
