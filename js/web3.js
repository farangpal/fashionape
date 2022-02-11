const web3 = new Web3(window.ethereum);
import { contractABI } from "./ABI.js";
import {
  getPrice,
  workflow,
  tokenPerWalletWL,
  privateSalePrice,
  verifyProof,
  getMAXIMUM_MINT_WL,
  tokensPerWalletRaffle,
  preSaleMint,
  publicSaleMint,
  getMAXIMUM_MINT_RAFFLE,
  getETHBalance,
} from "./utils.js";

const price = document.querySelector(".eth");
const doubleClickIf = document.querySelector("#doubleClickIf");
const btnConnect = document.querySelector(".button-3.hide.btn.mint.w-inline-block");
const textConnect = document.querySelector(".text-button > strong");

//************   Balise de vartion des Text => front        ***************** */
const saleStatusText = document.querySelector(".subheading-2");
const quantityBlock = document.querySelector(".w-form");
const ErrorMsg = document.querySelector("#ErrorMsg");
const PendingMsg = document.querySelector("#WaitingMsg");
const raffleBlock = document.querySelector(".success-message.w-form-done");
const raffleMsg = document.querySelector(".text-block-31");

const metaMsg = document.querySelector(".meta-seeker");
const symbol = document.querySelector(".image-132");

const nbToMint = document.querySelector(".counterfield");
const downBtn = document.querySelector(".sub");
const upBtn = document.querySelector(".add");
// const Plive = document.querySelector(".section-heading.h4");
// const Hlive = document.querySelector(".paragraphe-mint");

let WL;
let whitelistAddresses = [];

async function setWL() {
  await fetch("./js/whitelist.json").then(async (res) => {
    WL = await res.json();
  });
  await WL.map((e) => {
    if (whitelistAddresses.includes(e.toLowerCase())) {
    } else {
      whitelistAddresses.push(e.toLowerCase());
    }
  });
}
setWL();

web3.eth.setProvider(window.ethereum);

const contract = new web3.eth.Contract(contractABI, "0x6d200bb6E0d75daF29992b9Ec25D61Fa0d99cc92");

let accounts;
let workflowCount;

let maxMintWL;
let tokenOwnerWL;

let maxMintRF;
let tokenOwnerRF;

let privatePrice;
let salePrice;

let balanceToLoose;
let isLooser;

/**** Merkle info ****/
let Pindex;
let PmerkleResult;
let Pproof;

let quantity = 0;

async function connect() {
  if (window.ethereum) {
    try {
      accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      //requête de connection au wallet
      window.ethereum.on("accountsChanged", (accounts) => {
        //event écoute si l'utilisateur change de wallet => refresh la page pour relancé toute les fonction d'initialisation
        window.location.reload();
        console.log("websocket detected : " + accounts);
      });
    } catch (err) {}

    if (window.ethereum.selectedAddress) {
      //********blockchain data*****//
      workflowCount = await workflow(contract);
      tokenOwnerWL = await tokenPerWalletWL(contract, accounts[0]);
      tokenOwnerRF = await tokensPerWalletRaffle(contract, accounts[0]);
      privatePrice = await privateSalePrice(contract);
      salePrice = await getPrice(contract);
      maxMintWL = await getMAXIMUM_MINT_WL(contract);
      maxMintRF = await getMAXIMUM_MINT_RAFFLE(contract);
      isLooser = await setLooser();
      // await whitelistSoldOut();

      //****** Front injection *****/
      await setPrice();

      setText();

      if (workflowCount < 2) {
        const leafNodes = whitelistAddresses.map((addr) => keccak256(addr));
        const merkleTree = new MerkleTree(leafNodes, keccak256, {
          sortPairs: true,
        });
        const root = merkleTree.getHexRoot();
        Pindex = whitelistAddresses.indexOf(accounts[0]);
        console.log("WhiteList Merkle Root : " + root);

        if (Pindex >= 0) {
          Pproof = merkleTree.getHexProof(leafNodes[Pindex]);
        } else {
          Pproof = merkleTree.getHexProof(leafNodes[0]);
        }
        PmerkleResult = await verifyProof(contract, accounts[0], Pproof);
      }
    } else {
      textConnect.textContent = "Connect";
    }
  } else {
    metaMsg.textContent = "Metamask is not detected on your browser";
    btnConnect.href = "https://metamask.app.link/dapp/mint.fashionapenft.io";
    textConnect.textContent = "Open in Metamask";
  }
}
connect();

//--------------------- script -------------------------------//

//-------Price in ETH ------//
async function setPrice() {
  if (workflowCount <= 1) price.textContent = `${(privatePrice / 10 ** 18).toFixed(2)} ETH`;
  if (workflowCount == 2) price.textContent = `${(salePrice / 10 ** 18).toFixed(2)} ETH`;
}

//------------------------------------//

//---------------------- Text indicatif ----------//

function setText() {
  symbol.style.display = "block";
  quantityBlock.style.display = "flex";

  if (Number(workflowCount) == 0) {
    textConnect.textContent = "MINT";
    saleStatusText.textContent = "MINT HAS NOT STARTED";
  }
  if (Number(workflowCount) == 1) {
    doubleClickIf.style.display = "initial";
    textConnect.textContent = "MINT";
    saleStatusText.textContent = "PRESALE IS LIVE !";
  }
  if (Number(workflowCount) === 2) {
    doubleClickIf.style.display = "initial";
    textConnect.textContent = "MINT";
    raffleBlock.style.display = "flex";
    saleStatusText.textContent = "RAFFLE IS LIVE !";
    if (isLooser) {
      raffleMsg.textContent = "You are not selected on the raffle";
      raffleMsg.style.color = "red";
    }
  }
  if (Number(workflowCount) >= 3) {
    saleStatusText.textContent = "SOLD OUT !";
  }
}

async function setLooser() {
  return false;
}

// ---------------  front javascript intéraction----------------//

//-----------------------------------------------//

function NBquantity() {
  nbToMint.value = `${quantity}`;
}

//--------------------------------------------------------------//

// --------------- set Quantity ----------------//

upBtn.addEventListener("click", () => {
  if (Number(workflowCount) === 1) {
    if (quantity < maxMintWL - tokenOwnerWL) quantity++;
    NBquantity();
  } else if (Number(workflowCount) === 2 && !isLooser) {
    if (quantity < maxMintRF - tokenOwnerRF) quantity++;
    NBquantity();
  }
});
downBtn.addEventListener("click", () => {
  if (quantity > 0) quantity--;
  NBquantity();
});

//-----------------------------------------------//

//------------- Mint Click----------------------//

btnConnect.addEventListener("click", async () => {
  if (accounts !== undefined) {
    // condition utilisateur connecté ?
    if (Number(workflowCount) === 1) {
      if (quantity <= maxMintWL - tokenOwnerWL && quantity > 0) {
        if (PmerkleResult) {
          raffleMsg.style.display = "none";
          PendingMsg.style.display = "block";
          await preSaleMint(contract, accounts[0], Pproof, privatePrice, quantity);
        } else {
          ErrorMsg.style.display = "block";
          setTimeout(() => {
            ErrorMsg.style.display = "none";
          }, 2000);
        }
      }
    } else if (Number(workflowCount) === 2) {
      if (isLooser) alert("You are not selected on the raffle !");
      if (quantity <= maxMintRF - tokenOwnerRF && quantity > 0) {
        raffleMsg.style.display = "none";
        PendingMsg.style.display = "block";
        await publicSaleMint(contract, accounts[0], salePrice, quantity);
      }
    }
  } else {
    console.log("try to connect");
    connect();
  }
});
