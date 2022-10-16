import type {
  // CognitoUser,
  CognitoUserSession
} from 'amazon-cognito-identity-js'

import * as constants from './constants'
// import { Amplify, API } from 'aws-amplify/lib'
import { Auth as AmpAuth, CognitoHostedUIIdentityProvider } from '@aws-amplify/auth'
// import { API } from '@aws-amplify/api'
import { Hub } from '@aws-amplify/core'
import type { ICredentials } from '@aws-amplify/core'
import { RestAPI } from '@aws-amplify/api-rest'
import EventEmitter from 'events'
import type { AuthOptions } from './types'
// import axios from 'axios'

export class AuthClass extends EventEmitter {
  private readonly auth: typeof AmpAuth
  private readonly api: typeof RestAPI
  // private user?: CognitoUser
  private seed?: string

  constructor() {
    super()
    this.auth = AmpAuth
    this.api = RestAPI
    const configAuth: AuthOptions = {
      identityPoolId: constants.IDENTITY_POOL_ID,
      region: constants.AWS_REGION,
      userPoolId: constants.COGNITO_USER_POOL_ID,
      userPoolWebClientId: constants.COGNITO_CLIENT_ID,
      // OPTIONAL - This is used when autoSignIn is enabled for Auth.signUp
      // 'code' is used for Auth.confirmSignUp, 'link' is used for email link verification
      signUpVerificationMethod: 'code', // 'code' | 'link'
      // OPTIONAL - Configuration for cookie storage
      // Note: if the secure flag is set to true, then the cookie transmission requires a secure protocol
      // cookieStorage: {
      //   // REQUIRED - Cookie domain (only required if cookieStorage is provided)
      //   domain: 'localhost',
      //   // OPTIONAL - Cookie path
      //   path: '/',
      //   // OPTIONAL - Cookie expiration in days
      //   expires: 365,
      //   // OPTIONAL - See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
      //   sameSite: 'lax',
      //   // OPTIONAL - Cookie secure flag
      //   // Either true or false, indicating if the cookie transmission requires a secure protocol (https).
      //   secure: false
      // },
      // OPTIONAL - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
      // authenticationFlowType: 'USER_PASSWORD_AUTH'
      oauth: {
        // redirectSignIn: 'https://auth.finalbiome.net/signin',
        // redirectSignOut: 'https://auth.finalbiome.net/signout',
        redirectSignIn: 'http://localhost:8000',
        redirectSignOut: 'http://localhost:8000',
        clientID: constants.OAUTH_GOOGLE_CLIENT_ID,
        domain: 'finalbiome.auth.eu-west-1.amazoncognito.com',
        responseType: 'code',
        scope: [
          'phone',
          'email',
          'profile',
          'openid',
          'aws.cognito.signin.user.admin'
        ]
      }
    }
    const configApi = {
      endpoints: [
        {
          name: constants.API_AUTH_ENDPOINT_NAME,
          endpoint: constants.API_AUTH_ENDPOINT,
          custom_header: async () => {
            // return { Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}` }
            return { Authorization: `Bearer ${(await this.auth.currentSession()).getIdToken().getJwtToken()}` }
          }
        }
      ]
    }

    this.auth.configure(configAuth)
    this.api.configure(configApi)
    this.listenAuthEvent()
  }

  configure(): void {
    // Amplify.configure(config)
  }

  async signUp(email: string, password: string): Promise<void> {
    await this.auth.signUp({
      username: email,
      password,
      attributes: {
        email
      },
      autoSignIn: { // enables auto sign in after user is confirmed
        enabled: true
      }
    })
    // this.user = user
  }

  private listenAuthEvent(): void {
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#auto-sign-in-after-sign-up
    Hub.listen('auth', ({ payload }) => {
      const { event, data, message } = payload
      if (event === 'autoSignIn') {
        // this.user = payload.data
        // assign user
      } else if (event === 'autoSignIn_failure') {
        // this.user = undefined
      }

      this.emit(event as constants.AuthEvents, data, message)
    })
  }

  async confirmSignUp(email: string, code: string): Promise<void> {
    await this.auth.confirmSignUp(email, code)
  }

  async resendConfirmationCode(email: string): Promise<void> {
    await this.auth.resendSignUp(email)
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.auth.signIn({ username: email, password })
    // this.user = user
    // await this.getSeed()
  }

  async signOut(global: boolean = false): Promise<void> {
    await this.auth.signOut({ global })
    // this.user = undefined
    this.seed = undefined
  }

  private async createSeed(): Promise<string | undefined> {
    const apiName = constants.API_AUTH_ENDPOINT_NAME
    const path = '/auth/general/new'
    try {
      const response = await this.api.get(apiName, path, {})
      this.seed = response.phrase
      return this.seed
    } catch (err: any) {
      // if (axios.isAxiosError(err)) {
      if (err?.isAxiosError === true) {
        // throw new Error(err.response?.data?.message)
        console.error(err.response?.data?.message)
        return undefined
      } else {
        // throw err
        console.error(err)
        return undefined
      }
    }
  }

  private async getSeed(): Promise<string | undefined> {
    const apiName = constants.API_AUTH_ENDPOINT_NAME
    const path = '/auth/general/get'
    try {
      const response = await this.api.get(apiName, path, {})
      this.seed = response.phrase
      return this.seed
    } catch (err: any) {
      // if (axios.isAxiosError(err)) {
      if (err?.isAxiosError === true) {
        if (err.response?.status === 404) {
          // seed not exists
          return await this.createSeed()
        } else {
          // throw new Error(err.response?.data?.message)
          console.error(err.response?.data?.message)
          return undefined
        }
      } else {
        // throw err
        console.error(err)
        return undefined
      }
    }
  }

  async showSeed(): Promise<string | undefined> {
    if (this.seed) return this.seed
    return await this.getSeed()
  }

  async getCredentals(): Promise<ICredentials> {
    return await this.auth.currentCredentials()
  }

  async currentSession(): Promise<CognitoUserSession> {
    return await this.auth.currentSession()
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      const res = await this.auth.currentAuthenticatedUser()
      return !!res
    } catch (error) {
      return false
    }
  }

  async loginGoogle(): Promise<void> {
    await this.auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google })
  }
}

export const Auth = new AuthClass()
