# How to manage wallets in your App

## Wallet Standard
All wallets compatible with Sui are implementing the <a href="https://docs.sui.io/standards/wallet-standard">wallet standard</a> and the methods to interact with them can be imported from `@mysten/wallet-standard`.

In order to query the installed wallets in the user's browser first import `import {getWallets} from "@mysten/wallet-standard";` and the full command is:
`const availableWallets = getWallets().get();`.

The return from this call is an array of "Wallet" <a href="https://github.com/wallet-standard/wallet-standard/blob/master/packages/core/base/src/wallet.ts#L34">types</a>.

The `Wallet.icon` and `Wallet.name` can be used to display the wallet on the web page.

The `Wallet.acounts` is an array of `WalletAcount` and each `WalletAccount` <a href="https://github.com/wallet-standard/wallet-standard/blob/master/packages/core/base/src/wallet.ts#L131">type</a> has the `address` and `publicKey` properties that are most used while developing. This will get filled after connection and will be cached.

## Features

Both the `Wallet` type and the `WalletAccount` type have a property called `features`. The main wallet functionality is found here. The mandatory features that must be implemented by any wallet can be found in the <a href="https://docs.sui.io/standards/wallet-standard#implementing-features">documentation</a>.

Many wallets may choose to omit some non-mandatory features or add some custom features, be sure to check their documentation if you intend to integrate a specific wallet.

### Connecting a wallet

Connecting in the context of a wallet refers to a user that joins the web site for the first time and has to choose which wallet and which addresses will he use.

In order to achieve this the feature is called `standard:connect`:
`wallet.features['standard:connect'].connect() // connect call`

The above call will result in the wallet opening a pop-up for the user to continue the process.


### Disconnecting

In a similar manner as connectiong the feature is `standard:disconnect` and can be called like:
`wallet.features['standard:disconnect'].disconnect();`.


### Transaction -- the suggested way

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

Here we have to remember to give the wallet the transaction effects so they can be reported to the user. The wallet expects the effects b64 encoded.

```js

wallet.features['sui:reportTransactionEffects'].reportTransactionEffects(
    effects: Array.isArray(transactionResponse.effects) ? toB64(
        Uint8Array.from(transactionResponse.effects) : transactionResponse.effects,
        account: wallet.accounts[0], // for example
        chain: wallet.chains[0]
    )
```

### Transaction - the easy way

Many wallets abstract the above flow into one feature `sui:signAndExecuteTransaction`. Here the required arguments are the raw `Transaction` and the options with the desired information to be included in the response. A quick reminder, these options are:

- showEffects: to include the transaction effects
- showEvents: to include the transaction events
- showObjectChanges: to include all the objects that were deleted, created or mutated.
- showBalanceChanges: to include any coin transfer that took place.
- showInput: to include the transaction's input
- showRawInput: same as above but the format is raw


### Events emitted by wallets

The wallet emits events that can be listened to on certain user actions. These events allow your app to be responsive to user actions on their wallet.

The wallet standard only defines the `change` event that can apply to `chains`, `features` or `accounts`.

- chains: A change event on the chains means the user switched the chain the wallet operates on, eg. from `devnet` to `testnet`.
- features: The user added or removed permission for your app to access certain wallet features.
- accounts: The user added or removed an account (address) to interact with your app

Your app can subscribe to events with the following call:

`const unsubscribe = wallet.features['standard:events'].on ('change', callback)`

This call returns a function that can be called to unsubscribe from listening the events.

The `callback` is the handler that contains the logic to be performed when the event takes place. The input to the callback function is an object with the following type:

```js
{
    accounts: WalletAccount[],
    chains: IdentifierArray,
    features: IndentiferRecord<unkown>
}
```

The values here are all arrays containing the new / changed items, thus on every event only one array will be populated in most cases, the rest will be empty.

### Implementation example

Mystenlabs offers a barebones scaffold for React based applications called `@mysten/dapp-kit`. All the above concepts have been implemented there, the code can be found in the <a href="https://github.com/MystenLabs/sui/tree/main/sdk/dapp-kit">sui repo</a>.<br>
