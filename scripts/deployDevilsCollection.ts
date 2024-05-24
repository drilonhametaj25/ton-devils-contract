import { Cell, toNano } from '@ton/core';
import { DevilsCollection } from '../wrappers/DevilsCollection';
import { compile, NetworkProvider } from '@ton/blueprint';
import { getHttpEndpoint } from '@orbs-network/ton-access';
import { TonClient } from '@ton/ton';
import * as fs from "fs";

export async function run(provider: NetworkProvider) {
    
    const devilsCollection = provider.open(DevilsCollection.createFromConfig({}, await compile('DevilsCollection')));

    console.log("Init deploy")
    await devilsCollection.sendDeploy(provider.sender(), toNano('0.05'));
    console.log("Deployed")
    await provider.waitForDeploy(devilsCollection.address);

    // run methods on `devilsCollection`
}
