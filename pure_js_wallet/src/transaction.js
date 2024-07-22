import {Transaction} from "@mysten/sui/transactions";
import {SuiClient, getFullnodeUrl} from "@mysten/sui/client";
import { store } from "./connect";

export const sampleTransction = async () => {
    console.log(store.currentWallet);
    const client = new SuiClient({url: getFullnodeUrl("testnet")});

    const tx = new Transaction();
    tx.setSender(store.currentWallet.accounts[0].address);
    const amount = 100000000; // 0.1 SU00I
    const coin = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]);
    tx.transferObjects([coin], tx.pure.address("0x6f2d5e80dd21cb2c87c80b227d662642c688090dc81adbd9c4ae1fe889dfaf71"));

    // const bytes = await tx.build({client});
    const result = store.currentWallet.features["sui:signAndExecuteTransaction"].signAndExecuteTransaction({
        transaction: tx,
        options: {
            showEffect: true
        }
    })
    console.log(result);

    // client.executeTransactionBlock({
    //     transactionBlock: sig.bytes,
    //     signature: sig.signature,
    //     options: {
    //         showEffects: true
    //     }
    // })

}