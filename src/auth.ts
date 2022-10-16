import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth, type Auth as FirebaseAuth,
  createUserWithEmailAndPassword, User,
  type AuthError, signInWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  applyActionCode,
  signOut as fbFignOut
} from 'firebase/auth'

import { API_AUTH_ENDPOINT, AuthEvents } from './constants'

import EventEmitter from 'events'
import { FIREBASE_CONFIG } from './configs'
import { ResponseError } from './errors'

export class AuthClass extends EventEmitter {
  private readonly app: FirebaseApp
  private readonly auth: FirebaseAuth
  private user?: User
  private seed?: string

  constructor() {
    super()
    this.app = initializeApp(FIREBASE_CONFIG)
    this.auth = getAuth(this.app)
    this.listenAuthEvent()
  }

  configure(): void {
    //
  }

  async signUp(email: string, password: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password)
      this.user = userCredential.user
    } catch (err: any) {
      const error: AuthError = err
      this.user = undefined
      this.emit(AuthEvents.SignUpFailure, error)
      throw err
    }
  }

  private listenAuthEvent(): void {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.user = user
        this.emit(AuthEvents.SignIn, this.user)
      } else {
        this.user = undefined
        this.emit(AuthEvents.SignOut, undefined)
      }
    })
  }

  async confirmEmail(code: string): Promise<void> {
    await applyActionCode(this.auth, code)
  }

  async verifyEmail(): Promise<void> {
    if (this.user) {
      await sendEmailVerification(this.user)
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password)
      this.user = userCredential.user
    } catch (err: any) {
      const error: AuthError = err
      this.emit(AuthEvents.SignInFailure, error)
      throw err
    }
  }

  async signOut(global: boolean = false): Promise<void> {
    try {
      await fbFignOut(this.auth)
    } catch (err) {
      this.emit(AuthEvents.SignOutFailure, err)
    }
    this.user = undefined
    this.seed = undefined
  }

  private async api(endpoint: string): Promise<any> {
    if (!this.user) throw new Error('User Not Found')
    const token = await this.user.getIdToken()
    const response = await fetch(API_AUTH_ENDPOINT + endpoint, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const data = await response.json()
    if (!response.ok) {
      throw new ResponseError(response.status, data?.message)
    }
    return data
  }

  private async createSeed(): Promise<string | undefined> {
    const data = await this.api('/auth/general/new')
    this.seed = data?.phrase
    return this.seed
  }

  private async getSeed(): Promise<string | undefined> {
    if (this.seed) return this.seed
    try {
      const data = await this.api('/auth/general/get')
      this.seed = data?.phrase
    } catch (error) {
      if (error instanceof ResponseError) {
        if (error.status === 404) {
          // seed not exists
          return await this.createSeed()
        }
      }
    }
    return this.seed
  }

  async showSeed(): Promise<string | undefined> {
    if (this.seed) return this.seed
    return await this.getSeed()
  }

  async isLoggedIn(): Promise<boolean> {
    return !!this.user
  }

  async loginGoogle(): Promise<void> {
    //
  }
}

export const Auth = new AuthClass()
