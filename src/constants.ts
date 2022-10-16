export const API_AUTH_ENDPOINT = 'https://fq7urbuui6.execute-api.eu-west-1.amazonaws.com/prod'

export const OAUTH_GOOGLE_CLIENT_ID = '137309833944-r5ipo98ndju3sf9qe0fko4mtnhdk75n2.apps.googleusercontent.com'

export const enum AuthEvents {
  SignIn = 'signIn',
  SignUp = 'signUp',
  SignUpFailure = 'signUp_failure',
  SignOut = 'signOut',
  SignOutFailure = 'signOut_failure',
  SignInFailure = 'signIn_failure',
  TokenRefresh = 'tokenRefresh',
  TokenRefreshFailure = 'tokenRefresh_failure',
  AutoSignIn = 'autoSignIn',
  AutoSignInFailure = 'autoSignIn_failure',
  Configured = 'configured',

}
