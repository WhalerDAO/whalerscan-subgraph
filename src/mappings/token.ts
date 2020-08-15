import { BigInt, Address } from "@graphprotocol/graph-ts"
import { ERC20, Transfer } from "../../generated/YFI/ERC20"
import { Whale } from "../../generated/schema"
import * as Utils from '../utils'

export function handleTransfer(event: Transfer): void {
  let token = Utils.getToken(event.address)

  // update token balances
  let whaleFrom = Utils.getWhale(event.params.from)
  Utils.getWhaleBalance(whaleFrom, token)
  let whaleTo = Utils.getWhale(event.params.to)
  Utils.getWhaleBalance(whaleTo, token)
}
