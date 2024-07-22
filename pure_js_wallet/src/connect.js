import {getWallets} from "@mysten/wallet-standard";
import {registerStashedWallet} from "@mysten/zksend";

registerStashedWallet('Demo App Pure Html', {origin: "https://getstashed.com"});

let wallets = getWallets().get();
export const store = {currentWallet: ""};
export const listener = async (wallet) => {
    const res = await wallet.features["standard:connect"].connect();
    console.log(res);
    store.currentWallet = wallet;
}

export {wallets};