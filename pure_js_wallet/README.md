# Using Wallet Standard

## What is Wallet Standard

Wallet Standard is an architecture with a set of methods that each wallet should
implement to be considered "compatible". Beyond this it allows for custom
methods.

All wallets compatible with Sui are implementing the
<a href="https://docs.sui.io/standards/wallet-standard">Wallet Standard</a> and
the methods to interact with them can be imported from
`@mysten/wallet-standard`.

## First step getting the wallets

Wallets, usually, come as extensions on the browser and the Wallet Standard
mysten library offers the way to get them.

In order to query the installed wallets in the user's browser first import
`import {getWallets} from "@mysten/wallet-standard";` and the full command is:
`const availableWallets = getWallets().get();`.

The return from this call is an array of "Wallet"
<a href="https://github.com/wallet-standard/wallet-standard/blob/master/packages/core/base/src/wallet.ts#L34">types</a>.

The `Wallet.icon` and `Wallet.name` can be used to display the wallet on the web
page.

A very naive implementation of the above would look like:

```js
import {getWallets} from "@mysten/wallet-standard";

const availableWallets = getWallets().get();
const container = document.getElementById("<container-id>");
wallets.forEach(wallet => {
  const itemDiv = document.createElement("div");
  const icon = document.createElement("img");
  icon.src = wallet.icon;
  icon.alt = wallet.name;
  console.log(wallet);
  const name = document.createElement("button");
  name.innerText = wallet.name;
  name.addEventListener("click", _event => {
    listener(wallet);
  });

  itemDiv.appendChild(icon);
  itemDiv.appendChild(name);
  container.appendChild(itemDiv);
});
```

To dissect the code. First we import the method and we call it to get all the wallets on the client's browser.

This example assumes a js script inside html code. So we get the element where the info will be displayed in the next line and we assign it to the `container` variable.

Next we iterate over every item in the `wallets` variable and we create a
```html
<div>
    <img/>
    <button></button>
</div>
```
setup. The source for the `<img>` is inside `wallet.icon` and the button text will have the `wallet.name` data. We also attach a listener to the button, the idea is that when the user presses the button they will iniate a connection with our app and the chosen wallet.

The `Wallet.acounts` is an array of `WalletAcount` and each `WalletAccount`
<a href="https://github.com/wallet-standard/wallet-standard/blob/master/packages/core/base/src/wallet.ts#L131">type</a>
has the `address` and `publicKey` properties that are most used while
developing. This will get filled after connection and will be cached.

In order to see how the connection happens we will have to talk about `features` first.

## Features

Both the `Wallet` type and the `WalletAccount` type have a property called
`features`. The main wallet functionality is found here. 

The mandatory features that must be implemented by any wallet can be found in the
<a href="https://docs.sui.io/standards/wallet-standard#implementing-features">documentation</a>.

Features are an object that contain keys of the type `string:string` where the first part in case of Sui is either `standard` or `sui`.
For example the connect feature is `standard:connect` but the feature for signing and executing transactions is called
`sui:signAndExecuteTransaction`. In the latter case the first string is "sui" because this is a blockchain specific call, while connection is the same for every blockchain so the string is "standard".

### Connecting a wallet

Connecting in the context of a wallet refers to a user that joins the web site
for the first time and has to choose which wallet and which addresses will he
use.

In order to achieve this the feature is called `standard:connect`:

`wallet.features['standard:connect'].connect() // connect call`

The above call will result in the wallet opening a pop-up for the user to
continue the process.

In our example the listener callback would call this feature.
The most simple example code would be
```js
const listener = async (wallet) => {
    const res = await wallet.features["standard:connect"].connect();
}
```
In practice you would save the `wallet` variable in such a way that it is accessible by other parts of your code.

### Transactions

As soon as the wallet has connected we have the necessary information such as
`address`, and the method, to execute transactions.

The transaction should be constructed separately with the `@mysten/sui`
<a href="https://sdk.mystenlabs.com/typescript/transaction-building/basics">library</a>
and then we can use the `signAndExecuteTransaction` feature to commit it to the chain. 
The actual call is:

```js
wallet.features["sui:signAndExecuteTransaction"].singAndExecuteTransaction({
    transaction: txb,
    options: {
        showEffects: true,
        showEvents: false,
        showObjectChanges: true
    }
});
```

This will open a pop-up to the user where he can review, accept or decline the transaction.

### Things to look out for

While these features are in the standard, each wallet is not forced to implement all of them. Some may be missing, for example `Stahed` wallet on purpose did not implement the `sui:signAndExecuteTransaction`, but has implemented the `sui:singTransaction` feature. So execution is possible but it needs two steps, one to build and sign the transaction and then to execute it using a `SuiClient`.
Other wallets may have omitted or added extra features. Make sure to read their docs first, especially if you will focus on a certain wallet.
