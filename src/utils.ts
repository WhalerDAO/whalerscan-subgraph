import { BigInt, Address, BigDecimal, ethereum, DataSourceContext } from '@graphprotocol/graph-ts'
import { ERC20 } from "../generated/YFI/ERC20"
import { Whale, Token, WhaleBalance } from "../generated/schema"

/**
 * Constants
 */

export let ZERO_INT = BigInt.fromI32(0)
export let ZERO_DEC = BigDecimal.fromString('0')
export let ONE_INT = BigInt.fromI32(1)
export let ONE_DEC = BigDecimal.fromString('1')
export let NEGONE_DEC = BigDecimal.fromString('-1')
export let ZERO_ADDR = '0x0000000000000000000000000000000000000000'
export let ETH_ADDR = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
export let SEPARATOR = '-'

/**
 * Entity getters
 */

export function getWhale(address: Address): Whale | null {
  let id = address.toHex()
  if (id === ZERO_ADDR) return null
  let whale = Whale.load(id)
  if (whale == null) {
    whale = new Whale(id)
    whale.address = address.toHex()
    whale.balances = []
    whale.save()
  }
  return whale
}

export function getToken(address: Address): Token | null {
  let id = address.toHex()
  if (id === ZERO_ADDR) return null
  let token = Token.load(id)
  let tokenContract = ERC20.bind(address)
  if (token == null) {
    token = new Token(id)
    token.address = address.toHex()
    token.name = tokenContract.name()
    token.symbol = tokenContract.symbol()
    token.decimals = BigInt.fromI32(tokenContract.decimals())
  }
  token.totalSupply = normalize(tokenContract.totalSupply(), tokenContract.decimals())
  token.save()
  return token
}

export function getWhaleBalance(whale: Whale | null, token: Token | null): WhaleBalance | null {
  if (whale == null || token == null) return null
  let id = join(['WhaleBalance', whale.id, token.id])
  let whaleBalance = WhaleBalance.load(id)
  let tokenContract = ERC20.bind(Address.fromString(token.address))
  if (whaleBalance == null) {
    whaleBalance = new WhaleBalance(id)
    whaleBalance.whale = whale.id
    whaleBalance.token = token.id
  }
  whaleBalance.balance = normalize(tokenContract.balanceOf(Address.fromString(whale.address)), token.decimals.toI32())
  whaleBalance.save()
  return whaleBalance
}

/**
 * Math
 */

export function tenPow(exponent: number): BigInt {
  let result = BigInt.fromI32(1)
  for (let i = 0; i < exponent; i++) {
    result = result.times(BigInt.fromI32(10))
  }
  return result
}

export function normalize(i: BigInt, decimals: number = 18): BigDecimal {
  return i.toBigDecimal().div(tenPow(decimals).toBigDecimal())
}

/**
 * Arrays
 */

export function join(arr: string[], sep: string = SEPARATOR): string {
  let result = arr[0]
  if (arr.length <= 1) return result
  for (let i = 1; i < arr.length; i++) {
    result += sep + arr[i]
  }
  return result
}