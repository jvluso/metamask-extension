const Wallet = require('ethereumjs-wallet')
const importers = require('ethereumjs-wallet/thirdparty')
const ethUtil = require('ethereumjs-util')

const accountImporter = {

  async importAccount (strategy, args, keyringController) {
    try {
      const importer = this.strategies[strategy]
      const keyringArgs = importer.apply(null, args)
      return await keyringController.addNewKeyring(this.keyringType[strategy], keyringArgs)
    } catch (e) {
      return Promise.reject(e)
    }
  },

  keyringType: {
    'Private Key': 'Simple Key Pair',
    'JSON File': 'Simple Key Pair',
    'Debug': 'Debug Key',
    'Dao': 'Aragon Key'
  },

  strategies: {
    'Private Key': (privateKey) => {
      if (!privateKey) {
        throw new Error('Cannot import an empty key.')
      }

      const prefixed = ethUtil.addHexPrefix(privateKey)
      const buffer = ethUtil.toBuffer(prefixed)

      if (!ethUtil.isValidPrivate(buffer)) {
        throw new Error('Cannot import invalid private key.')
      }

      const stripped = ethUtil.stripHexPrefix(prefixed)
      return [stripped]
    },
    'JSON File': (input, password) => {
      let wallet
      try {
        wallet = importers.fromEtherWallet(input, password)
      } catch (e) {
        console.log('Attempt to import as EtherWallet format failed, trying V3...')
      }

      if (!wallet) {
        wallet = Wallet.fromV3(input, password, true)
      }

      return [walletToPrivateKey(wallet)]
    },
    'Debug': (props) => {
      return props 
    },
    'Dao': (props) => {
      return props 
    },
  },

}

function walletToPrivateKey (wallet) {
  const privateKeyBuffer = wallet.getPrivateKey()
  return ethUtil.bufferToHex(privateKeyBuffer)
}

module.exports = accountImporter
