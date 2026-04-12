import { describe, expect, it, vi } from 'vitest'

describe('admin config', () => {
  it('supports multiple admin env variable names and separators', async () => {
    const previousAddress = process.env.ADMIN_WALLET_ADDRESS
    const previousAddresses = process.env.ADMIN_WALLET_ADDRESSES
    const previousWallets = process.env.ADMIN_WALLETS

    delete process.env.ADMIN_WALLET_ADDRESS
    process.env.ADMIN_WALLET_ADDRESSES = '0xABC,\n0xDEF'
    delete process.env.ADMIN_WALLETS

    vi.resetModules()
    const mod = await import('@/lib/admin/config')

    expect(mod.getAdminWallets()).toEqual(['0xabc', '0xdef'])

    process.env.ADMIN_WALLET_ADDRESS = previousAddress
    process.env.ADMIN_WALLET_ADDRESSES = previousAddresses
    process.env.ADMIN_WALLETS = previousWallets
  })
})
