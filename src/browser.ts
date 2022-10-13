/**
 * This file is the entrypoint of browser builds.
 * The code executes when loaded in a browser.
 */
import { Auth } from './index'

declare global {
  interface Window {
    Auth: typeof Auth
  }
}
window.Auth = Auth
console.log('"Auth" was added to the window object')
