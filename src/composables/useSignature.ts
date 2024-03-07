import { sm2 } from 'sm-crypto'

export const useSignature = () => {
  const env = import.meta.env
  const priKey = env.VITE_SIG_PRI || ''
  const pubKey = env.VITE_SIG_PUB || ''

  return {
    async signature (msg: string) {
      if (priKey != '') {
        return sm2.doSignature(msg, priKey, {
          hash: true,
          der: true
        })
      }
    },
    async verify (msg: string, signature: string) {
      return sm2.doVerifySignature(msg, signature || '', pubKey, {
        hash: true,
        der: true
      })
    },
    async hasPubKey () {
      return pubKey != ''
    }
  }
}
