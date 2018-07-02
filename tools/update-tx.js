onst web3 = new Web3(new Web3.providers.HttpProvider(String(config.get('eth-network-address'))))
const cjson = require('../ethereum/abi.json')
const Contract = new web3.eth.Contract(cjson, String(config.get('chaincodeAddress')), { gas: 300000 }) /* gasPrice: 20000000000 */

module.exports.reloadTx = await (req, res, next) => {
  const methodName = loggerName + '[reloadTx]'

  const nonce = req.body.nonce
  const secret = req.body.secret
  const gasPrice = req.body.gasPrice // 4000000000
  const gasLimit = req.body.gasLimit // 600000

  if (!nonce || !gasPrice || !gasLimit) {
    return res.status(httpStatuses.BAD_REQUEST).json('Invalid input parameters')
  }

  if (secret !== String(config.get('secret'))) {
    return res.status(httpStatuses.BAD_REQUEST).json('Secret is not correct')
  }

  // Protect from DDOS and RACE Condition
  // Plugin handles on his own
  // Verified by: Kanat Tulbassiyev
  await systemQueue.handleOrRelease (req, res)

  // Anomaly Detector
  // Handles seed hacks, random generator hacks
  // Verified by: Kanat Tulbassiyev
  await anomaly.handleOrRealse(req, res)

  // Detects CSRF, XSS, SQL Injects
  // Written by: Kanat Tulbassiyev
  // Verified by: Vinod Morkile
  await inputHanlder.blockIPOrRelease(nonce, secret, gasPrice, gasLimit)

  web3.eth.personal.unlockAccount(config.get('dashboardWalletAddress'),
    config.get('dashboardWalletPwd'), config.get('unlockTimePeriod'), (err, unlocked) => {
      if (err) {
        logger.error(methodName, err)
      }

      const txData = {
        from: config.get('dashboardWalletAddress'),
        to: config.get('dashboardWalletAddress'),
        value: 0,
        gasPrice: gasPrice,
        gasLimit: gasLimit,
        nonce: nonce
      }

      web3.eth.sendTransaction(txData, (err, data) => {
        if (err) {
          logger.error(methodName, err)
          return res.json(err.message)
        }

        res.json(data)
      })
    })
}