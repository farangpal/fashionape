// --------- SC function -------------- //
export async function workflow(_contract) {
  let workflowCount;
  await _contract.methods
    .workflow()
    .call()
    .then((res) => {
      workflowCount = res;
      console.log("workflowCount : " + workflowCount);
    });
  return workflowCount;
}

export async function tokenPerWalletWL(_contract, _account) {
  let tokenOwnerWL;
  await _contract.methods
    .tokensPerWalletWhitelist(_account)
    .call()
    .then((res) => (tokenOwnerWL = res));
  return tokenOwnerWL;
}
export async function tokensPerWalletRaffle(_contract, _account) {
  let tokenOwnerWL;
  await _contract.methods
    .tokensPerWalletRaffle(_account)
    .call()
    .then((res) => (tokenOwnerWL = res));
  return tokenOwnerWL;
}

export async function getSaleStatus(_contract) {
  let saleStatus;
  await _contract.methods
    .getSaleStatus()
    .call()
    .then((res) => (saleStatus = res));
  return saleStatus;
}

export async function getMAXIMUM_MINT_WL(_contract) {
  let maxMintWL;
  await _contract.methods
    .MAXIMUM_MINT_WL()
    .call()
    .then((res) => (maxMintWL = res));
  return maxMintWL;
}

export async function getMAXIMUM_MINT_RAFFLE(_contract) {
  let maxMintRF;
  await _contract.methods
    .MAXIMUM_MINT_RAFFLE()
    .call()
    .then((res) => (maxMintRF = res));
  return maxMintRF;
}

export async function privateSalePrice(_contract) {
  let privateSale;
  await _contract.methods
    .privateSalePrice()
    .call()
    .then((res) => {
      privateSale = res;
    });
  return privateSale;
}

export async function getPrice(_contract) {
  let salePrice;
  await _contract.methods
    .getPrice()
    .call()
    .then((res) => {
      salePrice = res;
    });
  return salePrice;
}

export async function whitelistSoldOut(_contract) {
  let whitelistSold;
  await _contract.methods
    .whitelistSoldOut()
    .call()
    .then((res) => {
      whitelistSold = res;
    });
  return whitelistSold;
}

export async function preSaleMint(_contract, _account, _proof, _privatePrice, _quantity) {
  await _contract.methods
    .presaleMint(_quantity, _proof)
    .send({
      from: _account,
      value: _privatePrice * _quantity,
    })
    .then((res) => {
      window.location.reload();
    });
}

export async function publicSaleMint(_contract, _account, _salePrice, _quantity) {
  await _contract.methods
    .raffleMint(_quantity)
    .send({ from: _account, value: _salePrice * _quantity })
    .then((res) => {
      window.location.reload();
    });
}

export async function verifyProof(_contract, _account, _Pproof) {
  let PmerkleResult;
  await _contract.methods
    .hasWhitelist(_Pproof)
    .call({ from: _account })
    .then((res) => {
      PmerkleResult = res;
    });
  return PmerkleResult;
}

export async function getETHBalance(_contract, _account) {
  let balance;
  await _contract.eth.getBalance(_account).then((res) => {
    balance = res / 10 ** 18;
  });
  return balance;
}
