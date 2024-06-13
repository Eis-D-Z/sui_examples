import {wallets, listener} from "./connect.js";
import { sampleTransction } from "./transaction.js";


const container = document.getElementById("container");
const txButton = document.getElementById("tx-button");

txButton.addEventListener("click", sampleTransction);

wallets.forEach(wallet => {
    const itemDiv = document.createElement('div');
    const icon = document.createElement('img');
    icon.src = wallet.icon;
    icon.alt = wallet.name;
    console.log(wallet)
    const name = document.createElement("button");
    name.innerText = wallet.name;
    name.addEventListener("click",(_event) => {listener(wallet)});

    itemDiv.appendChild(icon);
    itemDiv.appendChild(name);
    container.appendChild(itemDiv);

})
