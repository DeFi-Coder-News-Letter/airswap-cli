import { ethers } from 'ethers'
import chalk from 'chalk'
import { Command } from '@oclif/command'
import setup from '../../setup'
import { getBest, confirmTransaction } from '../../utils'
import { handleTransaction, handleError } from '../../utils'
import BigNumber from 'bignumber.js'

const Swap = require('@airswap/swap/build/contracts/Swap.json')
const swapDeploys = require('@airswap/swap/deploys.json')

export default class BestOrder extends Command {
  static description = 'get a best order'
  async run() {
    setup(this, 'Best order', async (wallet: any, metadata: any) => {
      getBest(this, 'Order', metadata, wallet, (request: any, order: any) => {
        this.log(`Expiry ${chalk.green(new Date(order.expiry * 1000).toLocaleTimeString())}\n`)

        confirmTransaction(
          this,
          'swap',
          {
            signerWallet: `${order.signer.wallet}`,
            signerToken: `${order.signer.token} (${request.signerToken.name})`,
            signerAmount: `${order.signer.amount} (${new BigNumber(order.signer.amount)
              .dividedBy(new BigNumber(10).pow(request.signerToken.decimals))
              .toFixed()})`,
            senderWallet: `${order.sender.wallet} (You)`,
            senderToken: `${order.sender.token} (${request.senderToken.name})`,
            senderAmount: `${order.sender.amount} (${new BigNumber(order.sender.amount)
              .dividedBy(new BigNumber(10).pow(request.senderToken.decimals))
              .toFixed()})`,
          },
          () => {
            const swapAddress = swapDeploys[wallet.provider.network.chainId]
            new ethers.Contract(swapAddress, Swap.abi, wallet)
              .swap(order)
              .then(handleTransaction)
              .catch(handleError)
          },
        )
      })
    })
  }
}
