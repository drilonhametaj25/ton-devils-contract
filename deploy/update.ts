import * as dotenv from "dotenv";

import { toNano } from "ton-core";
import { readdir } from "fs/promises";

import { openWallet } from "./utils";
import { waitSeqno } from "./delay";
import { NftCollection } from "./contracts/NftCollection";
import { NftItem } from "./contracts/NftItem";
import { updateMetadataFiles, uploadFolderToIPFS } from "./metadata";
import { GetGemsSaleData, NftSale } from "./contracts/NftSale";
import { NftMarketplace } from "./contracts/NftMarketplace";

dotenv.config();

async function init() {
  const metadataFolderPath = "./data/metadata/";
  const imagesFolderPath = "./data/images/";

  const wallet = await openWallet(process.env.MNEMONIC!.split(" "), true);


  console.log("Started uploading metadata files to IPFS...");
  //await updateMetadataFiles(metadataFolderPath, imagesIpfsHash);
  const metadataIpfsHash = "QmfG4vUTPTdjcNsBfcFtagGqK2MtMS6A4HXtfxSQ5dFLLR" //= await uploadFolderToIPFS(metadataFolderPath);
  console.log(
    `Successfully uploaded the metadata to ipfs: https://gateway.pinata.cloud/ipfs/${metadataIpfsHash}`
  );

  console.log("Start deploy of nft collection...");
  const collectionData = {
    ownerAddress: wallet.contract.address,
    royaltyPercent: 0.05, // 0.05 = 5%
    royaltyAddress: wallet.contract.address,
    nextItemIndex: 0,
    collectionContentUrl: `ipfs://${metadataIpfsHash}/collection.json`,
    commonContentUrl: `ipfs://${metadataIpfsHash}/`,
  };
  const collection = new NftCollection(collectionData);
  //let seqno = await collection.deploy(wallet);
  console.log(`Collection deployed: ${collection.address}`);
  //await waitSeqno(seqno, wallet);

  // Deploy nft items
  const files = await readdir(metadataFolderPath);
  files.pop();
  let index = 0;

  let seqno = await collection.topUpBalance(wallet, files.length);
  await waitSeqno(seqno, wallet);
  console.log(`Balance top-upped`);

  //for (const file of files) {
    console.log(`Start deploy of ${index + 1} NFT`);
    const mintParams = {
      queryId: 0,
      itemOwnerAddress: wallet.contract.address,
      editorAddress: wallet.contract.address,
      itemIndex: index,
      passAmount: toNano("0.05"),
      itemContent: files[3],
    };
    const nftItem = new NftItem(collection);
    seqno = await nftItem.update(wallet, mintParams);
    console.log(`Successfully deployed ${index + 1} NFT`);
    await waitSeqno(seqno, wallet);
    index++;
  //}
}

void init();
