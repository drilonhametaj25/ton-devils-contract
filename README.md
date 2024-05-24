# devils

## Project structure

-   `contracts` - source code of all the smart contracts of the project and their dependencies.
-   `wrappers` - wrapper classes (implementing `Contract` from ton-core) for the contracts, including any [de]serialization primitives and compilation functions.
-   `tests` - tests for the contracts.
-   `scripts` - scripts used by the project, mainly the deployment scripts.

## How to use

### Build

`npx blueprint build` or `yarn blueprint build`

### Test

`npx blueprint test` or `yarn blueprint test`

### Deploy or run another script

`npx blueprint run` or `yarn blueprint run`

### Add a new contract

`npx blueprint create ContractName` or `yarn blueprint create ContractName`


### Collection
Inside the deploy/contracts you can see the `NftCollection.ts` for the config about the collection and the `NftItem.ts` for the single NFT.

### Deploy collection with PINATA
Inside the deploy folder there is a `collection.ts` file where to put all the config for metadata and images from PINATA and runing this file you will deploy a new NFT EDITABLE COLLECTION

### Deploy single NFT
Inside the deploy folder there is a `item.ts` file where you have to pass the config about collection deployed before and then you can mint one item or if you want you can create a loop to mint all the NFTs

### Reveal/Update NFT
Inside the deploy folder there is a `update.ts` file where you have to pass the config about collection ecc... and you can see that we call a update function that is compisite about new body for updating only the info about NFT, you need to specify each address of NFT to update it.

In this way you can create a `reveal system`in TON blockchain