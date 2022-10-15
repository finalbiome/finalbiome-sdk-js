type OAuthOpts = AwsCognitoOAuthOpts | Auth0OAuthOpts
interface AwsCognitoOAuthOpts {
  domain: string
  scope: string[]
  redirectSignIn: string
  redirectSignOut: string
  responseType: string
  options?: object
  urlOpener?: (url: string, redirectUrl: string) => Promise<any>
}
interface Auth0OAuthOpts {
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
