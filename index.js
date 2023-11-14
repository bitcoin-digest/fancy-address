const bip39 = require("bip39");
const bitcoin = require("bitcoinjs-lib");

const mnemonic =
  "action action action action action action action action action action action action";
const pattern = "^3(AAAAA|BBBBB)";
const prifix = "Pri";

findFancyAddress(mnemonic);

function findFancyAddress(mnemonic) {
  let passphraseNumber = 1;
  let lastPassphraseNumber = passphraseNumber;
  let address;
  let startTime = new Date();
  do {
    const passphrase = passphraseNumber.toString();
    address = getBip49Address(mnemonic, prifix + passphrase);
    if (address.startsWith("3AA")) {
      let printRound = passphraseNumber - lastPassphraseNumber;
      let endTime = new Date();
      console.log(
        "[" +
          endTime.toLocaleTimeString() +
          "][speed = " +
          ((printRound / (endTime - startTime)) * 1000).toFixed(0) +
          " Hash/s]" +
          "[" +
          passphraseNumber +
          "][" +
          address +
          "]"
      );
      startTime = new Date();
      lastPassphraseNumber = passphraseNumber;
    }
    passphraseNumber++;
  } while (!address.match(pattern));

  console.log("fancy address = ", address);
  console.log("passphrase number =", passphraseNumber - 1);
}

function getBip49Address(mnemonic, passphrase) {
  // 根据助记词和passphrase生成种子
  const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase);

  // 使用bitcoinjs-lib生成主密钥对
  const master = bitcoin.bip32.fromSeed(seed, bitcoin.networks.bitcoin);

  // 派生BIP49路径
  const path = `m/49'/0'/0'/0/0`;
  const child = master.derivePath(path);

  // 生成P2WPKH嵌套在P2SH地址
  const { address } = bitcoin.payments.p2sh({
    redeem: bitcoin.payments.p2wpkh({ pubkey: child.publicKey }),
    network: bitcoin.networks.bitcoin,
  });

  return address;
}
