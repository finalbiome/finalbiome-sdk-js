import { Auth } from './auth'

describe('Auth cust', () => {
  it('signup', async () => {
    const email = 'sergey@weedydidie.com'
    const password = 'qQ123456'
    try {
      await Auth.signUp(email, password)
    } catch (e) {
      console.log(e)
    }
  })

  it('confirmSignUp', async () => {
    const email = 'sergey@weedydidie.com'
    const code = '118659'
    try {
      await Auth.confirmSignUp(email, code)
    } catch (e) {
      console.log(e)
    }
  })

  it('signIn', async () => {
    const email = 'sergey@weedydidie.com'
    const password = 'qQ123456'
    try {
      await Auth.signIn(email, password)
      const c = await Auth.getCredentals()
      console.log(c)
    } catch (e) {
      console.log(e)
    }
  })

  it('any test', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const email = 'sergey@weedydidie.com'
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const password = 'qQ123456'
    try {
      const a = Auth
      const c = await a.getCredentals()
      await Auth.signIn(email, password)
      const c1 = await a.getCredentals()
      const d = await a.currentSession()
      const s = await a.showSeed()
      console.log(c, c1, d, s)
    } catch (e) {
      console.log(e)
    }
  })
})
