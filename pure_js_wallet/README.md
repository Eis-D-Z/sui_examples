# How to find wallets with pure JS

## Wallet Standard
All wallets compatible with Sui are implementing the <a href="https://docs.sui.io/standards/wallet-standard">wallet standard</a> and the methods to interact with them can be imported from `@mysten/wallet-standard`.

In order to query the installed wallets in the user's browser first import `import {getWallets} from "@mysten/wallet-standard";` and the full command is:
`const availableWallets = getWallets().get();`.

The return from this call is an array of "Wallet" <a href="https://github.com/wallet-standard/wallet-standard/blob/master/packages/core/base/src/wallet.ts#L34">types</a>.

The `Wallet.icon` and `Wallet.name` can be used to display the wallet on the web page.

The `Wallet.acounts` is an array of `WalletAcount` and each `WalletAccount` <a href="https://github.com/wallet-standard/wallet-standard/blob/master/packages/core/base/src/wallet.ts#L131">type</a> has the `address` and `publicKey` properties that are most used while developing. This will get filled after connection and will be cached.

## Features

Both the `Wallet` type and the `WalletAccount` type have a property called `features`. The main wallet functionality is found here. The mandatory features that must be implemented by any wallet can be found in the <a href="https://docs.sui.io/standards/wallet-standard#implementing-features">documentation</a>.

### Connecting a wallet

Connecting in the context of a wallet refers to a user that joins the web site for the first time and has to choose which wallet and which addresses will he use.

In order to achieve this the feature is called `standard:connect`:
`wallet.features['standard:connect'].connect() // connect call`

The above call will result in the wallet opening a pop-up for the user to continue the process.


### Transaction
As soon as the wallet has connected we have the necessary information such as `address`, and the method, to execute transactions.

The transaction should be constructed separately with the `@mysten/sui` <a href="https://sdk.mystenlabs.com/typescript/transaction-building/basics">library</a> and then signed with the private key of the user. This is achieved using the `sui:signTransaction` feature:

`wallet.features[sui:signTransaction].singTransaction(<Transaction>, <WalletAccount>)`

This again will open a pop-up for the user to either accept or decline and return an object `{bytes: String, signature: Uint8Array}`.
`bytes` is the b64 enconding of the transaction and `signature` is self-explanatory.

To execute the transaction we can use the `SuiClient` from `@mysten/sui`:


```js
const client: SuiClient
client.executeTransactionBlock({
    transactionBlock: bytes,
    signature: signature,
    options: {}
})
```



