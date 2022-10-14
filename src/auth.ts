import type {
  // CognitoUser,
  ICookieStorageData,
  ICognitoStorage,
  CognitoUserSession
} from 'amazon-cognito-identity-js'

import * as constants from './constants'
// import { Amplify, API } from 'aws-amplify/lib'
import { Auth as AmpAuth } from '@aws-amplify/auth'
// import { API } from '@aws-amplify/api'
import { Hub } from '@aws-amplify/core'
import type { ICredentials } from '@aws-amplify/core'
import { RestAPI } from '@aws-amplify/api-rest'
import EventEmitter from 'events'
// import axios from 'axios'

// const userPool = new CognitoUserPool(constants.CognitoPoolData)

// export function signUp(email: string, password: string): Promise<CognitoUser | undefined> {
//   const dataEmail: ICognitoUserAttributeData = {
//     Name: 'email',
//     Value: email
//   }
//   const attributeEmail = new CognitoUserAttribute(dataEmail)
//   return new Promise((resolve, reject) => {
//     userPool.signUp(email, password, [attributeEmail], [], function (err, result) {
//       if (err) {
//         // const message = err?.message || JSON.stringify(err)
//         // console.error(message)
//         reject(err)
//       }
//       const cognitoUser = result?.user
//       // console.log('user name is ', cognitoUser?.getUsername())
//       resolve(cognitoUser)
//     })
//   })
// }

// export function confirmRegistration(email: string, code: string): Promise<void> {
//   const userData = {
//     Username: email,
//     Pool: userPool
//   }

//   const cognitoUser = new CognitoUser(userData)
//   return new Promise((resolve, reject) => {
//     cognitoUser.confirmRegistration(code, true, function (err, result) {
//       if (err) {
//         reject(err)
//       }
//       resolve()
//     })
//   })
// }

// export function resendConfirmationCode(email: string): Promise<void> {
//   const userData = {
//     Username: email,
//     Pool: userPool
//   }

//   const cognitoUser = new CognitoUser(userData)
//   return new Promise((resolve, reject) => {
//     cognitoUser.resendConfirmationCode(function (err, result) {
//       if (err) {
//         reject(err)
//       }
//       resolve()
//     })
//   })
// }

// export function authenticate(email: string, password: string): Promise<CognitoUserSession> {
//   const authenticationData = {
//     Username: email,
//     Password: password
//   }
//   const authenticationDetails = new AuthenticationDetails(
//     authenticationData
//   )

//   const userData = {
//     Username: email,
//     Pool: userPool
//   }

//   const cognitoUser = new CognitoUser(userData)
//   return new Promise((resolve, reject) => {
//     cognitoUser.authenticateUser(authenticationDetails, {
//       onSuccess: function (result) {
//         // User authentication was successful
//         resolve(result)
//       },
//       onFailure: function (err) {
//         // User authentication was not successful
//         reject(err)
//       }
//     })
//   })
// }

export type OAuthOpts = AwsCognitoOAuthOpts | Auth0OAuthOpts
export interface AwsCognitoOAuthOpts {
  domain: string
  scope: string[]
  redirectSignIn: string
  redirectSignOut: string
  responseType: string
  options?: object
  urlOpener?: (url: string, redirectUrl: string) => Promise<any>
}
export interface Auth0OAuthOpts {
  domain: string
  clientID: string
  scope: string
  redirectUri: string
  audience: string
  responseType: string
  returnTo: string
  urlOpener?: (url: string, redirectUrl: string) => Promise<any>
}

export interface AuthOptions {
  userPoolId?: string
  userPoolWebClientId?: string
  identityPoolId?: string
  region?: string
  mandatorySignIn?: boolean
  cookieStorage?: ICookieStorageData
  oauth?: OAuthOpts
  refreshHandlers?: object
  storage?: ICognitoStorage
  authenticationFlowType?: string
  identityPoolRegion?: string
  clientMetadata?: any
  endpoint?: string
  signUpVerificationMethod?: 'code' | 'link'
}

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
      authenticationFlowType: 'USER_PASSWORD_AUTH'
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
    // Amplify.configure({
    //   Auth: configAuth,
    //   API: configApi
    // })
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
    await this.getSeed()
  }

  async signOut(global: boolean = false): Promise<void> {
    await this.auth.signOut({ global })
    // this.user = undefined
    this.seed = undefined
  }

  private async createSeed(): Promise<void> {
    const apiName = constants.API_AUTH_ENDPOINT_NAME
    const path = '/auth/general/new'
    try {
      const response = await this.api.get(apiName, path, {})
      this.seed = response.data?.phrase
    } catch (err: any) {
      // if (axios.isAxiosError(err)) {
      if (err?.isAxiosError === true) {
        throw new Error(err.response?.data?.message)
      } else {
        throw err
      }
    }
  }

  private async getSeed(): Promise<void> {
    const apiName = constants.API_AUTH_ENDPOINT_NAME
    const path = '/auth/general/get'
    try {
      const response = await this.api.get(apiName, path, { response: true })
      this.seed = response.data?.phrase
    } catch (err: any) {
      // if (axios.isAxiosError(err)) {
      if (err?.isAxiosError === true) {
        if (err.response?.status === 404) {
          // seed not exists
          await this.createSeed()
        } else {
          throw new Error(err.response?.data?.message)
        }
      } else {
        throw err
      }
    }
  }

  showSeed(): string | undefined {
    return this.seed
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
}

export const Auth = new AuthClass()
