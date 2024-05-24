import {
  Address,
  Cell,
  internal,
  beginCell,
  contractAddress,
  StateInit,
  SendMode,
} from "ton-core";
import { encodeOffChainContent, OpenedWallet } from "../utils";

export type collectionData = {
  ownerAddress: Address;
  royaltyPercent: number;
  royaltyAddress: Address;
  nextItemIndex: number;
  collectionContentUrl: string;
  commonContentUrl: string;
};

export type mintParams = {
  queryId: number;
  itemOwnerAddress: Address;
  editorAddress: Address;
  itemIndex: number;
  passAmount: bigint;
  itemContent: string;
};

export class NftCollection {
  private data: collectionData;

  constructor(data: collectionData) {
    this.data = data;
  }

  public async deploy(wallet: OpenedWallet): Promise<number> {
    const seqno = await wallet.contract.getSeqno();
    await wallet.contract.sendTransfer({
      seqno,
      secretKey: wallet.keyPair.secretKey,
      messages: [
        internal({
          value: "0.05",
          to: this.address,
          init: this.stateInit,
        }),
      ],
      sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
    });
    return seqno;
  }

  public async topUpBalance(
    wallet: OpenedWallet,
    nftAmount: number
  ): Promise<number> {
    const seqno = await wallet.contract.getSeqno();
    const amount = nftAmount * 0.026;

    await wallet.contract.sendTransfer({
      seqno,
      secretKey: wallet.keyPair.secretKey,
      messages: [
        internal({
          value: amount.toString(),
          to: this.address.toString({ bounceable: false }),
          body: new Cell(),
        }),
      ],
      sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
    });

    return seqno;
  }

  public createMintBody(params: mintParams): Cell {
    const msgbody = beginCell();
    msgbody.storeUint(1, 32);
    msgbody.storeUint(params.queryId || 0, 64);
    msgbody.storeUint(params.itemIndex, 64);
    msgbody.storeCoins(params.passAmount);
    
    const itemContent = beginCell();
    itemContent.storeBuffer(Buffer.from(params.itemContent));
    
    const nftItemMessage = beginCell();
    nftItemMessage.storeRef(itemContent.endCell());
    nftItemMessage.storeAddress(params.itemOwnerAddress);
    nftItemMessage.storeAddress(params.editorAddress);


    msgbody.storeRef(nftItemMessage.endCell());
    return msgbody.endCell();
  }

  public createUpdateBody(params: mintParams): Cell {
    const msgbody = beginCell();
    msgbody.storeUint(0x1a0b9d51, 32);
    msgbody.storeUint(params.queryId || 0, 64);
    
    const contentCell = beginCell();
    contentCell.storeBuffer(Buffer.from(params.itemContent));
    
    const nftItemMessage = beginCell();
    nftItemMessage.storeRef(contentCell.endCell());


    msgbody.storeRef(nftItemMessage.endCell());
    return msgbody.endCell();
  }

  public get stateInit(): StateInit {
    const code = this.createCodeCell();
    const data = this.createDataCell();

    return { code, data };
  }

  public get address(): Address {
    return contractAddress(0, this.stateInit);
  }

  private createCodeCell(): Cell {
    const NftCollectionCodeBoc =
      "te6ccgECFAEAAh8AART/APSkE/S88sgLAQIBYgIDAgLNBAUCASAODwTn0QY4BIrfAA6GmBgLjYSK3wfSAYAOmP6Z/2omh9IGmf6mpqGEEINJ6cqClAXUcUG6+CgOhBCFRlgFa4QAhkZYKoAueLEn0BCmW1CeWP5Z+A54tkwCB9gHAbKLnjgvlwyJLgAPGBEuABcYES4AHxgRgZgeACQGBwgJAgEgCgsAYDUC0z9TE7vy4ZJTE7oB+gDUMCgQNFnwBo4SAaRDQ8hQBc8WE8s/zMzMye1Ukl8F4gCmNXAD1DCON4BA9JZvpSCOKQakIIEA+r6T8sGP3oEBkyGgUyW78vQC+gDUMCJUSzDwBiO6kwKkAt4Ekmwh4rPmMDJQREMTyFAFzxYTyz/MzMzJ7VQALDI0AfpAMEFEyFAFzxYTyz/MzMzJ7VQAPI4V1NQwEDRBMMhQBc8WE8s/zMzMye1U4F8EhA/y8AIBIAwNAD1FrwBHAh8AV3gBjIywVYzxZQBPoCE8trEszMyXH7AIAC0AcjLP/gozxbJcCDIywET9AD0AMsAyYAAbPkAdMjLAhLKB8v/ydCACASAQEQAlvILfaiaH0gaZ/qamoYLehqGCxABDuLXTHtRND6QNM/1NTUMBAkXwTQ1DHUMNBxyMsHAc8WzMmAIBIBITAC+12v2omh9IGmf6mpqGDYg6GmH6Yf9IBhAALbT0faiaH0gaZ/qamoYCi+CeAI4APgCw";
    return Cell.fromBase64(NftCollectionCodeBoc);
  }

  private createDataCell(): Cell {
    const data = this.data;
    const dataCell = beginCell();

    dataCell.storeAddress(data.ownerAddress);
    dataCell.storeUint(data.nextItemIndex, 64);

    const contentCell = beginCell();

    const collectionContent = encodeOffChainContent(data.collectionContentUrl);

    const commonContent = beginCell();
    commonContent.storeBuffer(Buffer.from(data.commonContentUrl));

    contentCell.storeRef(collectionContent);
    contentCell.storeRef(commonContent.asCell());
    dataCell.storeRef(contentCell);

    const NftItemCodeCell = Cell.fromBase64(
      "te6ccgECEwEAA0IAART/APSkE/S88sgLAQIBYgIDAgLOBAUCASAREgIBIAYHAgEgDxAEvQyIccAkl8D4NDTAwFxsJJfA+D6QPpAMfoAMXHXIfoAMfoAMHOptADwAgWz4wIH0x/TP4IQX8w9FFIwuo6MMhBIEDcQJhBFAts84IIQL8smolIwuuMCghAcBEEqUjC6gCAkKCwARPpEMHC68uFNgANJbbCI0UjLHBfLhlQH6QNT6QCUQNVRENgHwAyHHAcAAjkQB+gAhjjqCEAUTjZFwyFAGzxZYzxYQNEEwc3CAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAkl8E4pJfA+IB9lE2xwXy4ZH6QCHwAfpA0gAx+gCCCvrwgByhIZRTFaCh3iLXCwHDACCSBqGRNuIgwv/y4ZIhjj6CEAUTjZHIUArPFlAMzxZxJEoUVEawcIAQyMsFUAfPFlAF+gIVy2oSyx/LPyJus5RYzxcBkTLiAckB+wAQWJQQKzhb4gwAgBNfAzMzNDRwghCLdxc1BMjL/1jPFkQwEoBAcIAQyMsFUAfPFlAF+gIVy2oSyx/LPyJus5RYzxcBkTLiAckB+wABYo6MMhBIEDcQJhBFAts84DE2NzeCEBoLnVEWup5RMccF8uGaAdQwRADwA+BfBoQP8vANAIICjjUn8AGCENUydtsQOEUAbXFwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7AJMwMzXiVQPwAwH2UTTHBfLhkfpAIfAB+kDSADH6AIIK+vCAHKEhlFMVoKHeItcLAcMAIJIGoZE24iDC//LhkiGOPoIQURpEY8hQCM8WUAzPFnEkSBRURpBwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7ABA4lBArNlviDgCCAo41J/ABghDVMnbbEDhIAG1xcIAQyMsFUAfPFlAF+gIVy2oSyx/LPyJus5RYzxcBkTLiAckB+wCTMDYw4lUD8AMAQTtRNDTP/pAINdJwgCcfwH6QNT6QDAQNRA04DBwWW1tbYAAlATIyz9QA88WAc8WzAHPFsntVIAANvwOngBNijAALvH5/gBGE"
    );
    // const NftItemCodeCell = Cell.fromBase64(
    //   "te6cckECDQEAAdAAART/APSkE/S88sgLAQIBYgMCAAmhH5/gBQICzgcEAgEgBgUAHQDyMs/WM8WAc8WzMntVIAA7O1E0NM/+kAg10nCAJp/AfpA1DAQJBAj4DBwWW1tgAgEgCQgAET6RDBwuvLhTYALXDIhxwCSXwPg0NMDAXGwkl8D4PpA+kAx+gAxcdch+gAx+gAw8AIEs44UMGwiNFIyxwXy4ZUB+kDUMBAj8APgBtMf0z+CEF/MPRRSMLqOhzIQN14yQBPgMDQ0NTWCEC/LJqISuuMCXwSED/LwgCwoAcnCCEIt3FzUFyMv/UATPFhAkgEBwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7AAH2UTXHBfLhkfpAIfAB+kDSADH6AIIK+vCAG6EhlFMVoKHeItcLAcMAIJIGoZE24iDC//LhkiGOPoIQBRONkchQCc8WUAvPFnEkSRRURqBwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7ABBHlBAqN1viDACCAo41JvABghDVMnbbEDdEAG1xcIAQyMsFUAfPFlAF+gIVy2oSyx/LPyJus5RYzxcBkTLiAckB+wCTMDI04lUC8ANqhGIu"
    // );
    dataCell.storeRef(NftItemCodeCell);

    const royaltyBase = 1000;
    const royaltyFactor = Math.floor(data.royaltyPercent * royaltyBase);

    const royaltyCell = beginCell();
    royaltyCell.storeUint(royaltyFactor, 16);
    royaltyCell.storeUint(royaltyBase, 16);
    royaltyCell.storeAddress(data.royaltyAddress);
    dataCell.storeRef(royaltyCell);

    return dataCell.endCell();
  }
}
