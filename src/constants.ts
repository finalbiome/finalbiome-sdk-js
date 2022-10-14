export const IDENTITY_POOL_ID = 'eu-west-1:0ff94cf9-8bef-4898-b9f3-3f3c1e14faaf'
// USERPOOLID=$(aws cloudformation describe-stack-resource --stack-name finalbiome-jimmy --logical-resource-id UserPool --query 'StackResourceDetail.PhysicalResourceId' --output text)
export const COGNITO_USER_POOL_ID = 'eu-west-1_XCvAvEDAy'
// CLIENT_ID=$(aws cloudformation describe-stack-resource --stack-name finalbiome-jimmy --logical-resource-id UserPoolTokenClient --query 'StackResourceDetail.PhysicalResourceId' --output text)
export const COGNITO_CLIENT_ID = '3ff5uh044oh7e31mjn9ugh0437'

export const AWS_REGION = 'eu-west-1'

export const API_AUTH_ENDPOINT_NAME = 'ApiGatewayAuth'
export const API_AUTH_ENDPOINT = 'https://vawrz6lyya.execute-api.eu-west-1.amazonaws.com/prod'

export const enum AuthEvents {
  SignIn = 'signIn',
  SignUp = 'signUp',
  SignOut = 'signOut',
  SignInFailure = 'signIn_failure',
  TokenRefresh = 'tokenRefresh',
  TokenRefreshFailure = 'tokenRefresh_failure',
  AutoSignIn = 'autoSignIn',
  AutoSignInFailure = 'autoSignIn_failure',
  Configured = 'configured',

}
