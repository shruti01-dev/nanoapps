import { initializeApp } from 'firebase/app'
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type ActionCodeSettings,
} from 'firebase/auth'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseReady = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId)

const auth = firebaseReady ? getAuth(initializeApp(config)) : null

const continueUrl = (): ActionCodeSettings => ({
  url: `${window.location.origin}/login`,
  handleCodeInApp: false,
})

const friendlyAuthError = (error: unknown) => {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
  if (code === 'auth/email-already-in-use') return 'User already exists'
  if (code === 'auth/invalid-email') return 'Enter a valid email'
  if (code === 'auth/weak-password' || code === 'auth/password-does-not-meet-requirements') {
    return 'Password must be at least 6 characters'
  }
  if (code === 'auth/too-many-requests') return 'Too many attempts. Wait a little and try again.'
  if (code === 'auth/user-not-found') return 'user-not-found'
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/invalid-login-credentials') {
    return 'invalid-credential'
  }
  if (!firebaseReady) return 'Email verification is not configured.'
  return 'Something went wrong. Try again.'
}

export const isFirebaseCredentialError = (error: unknown) => {
  const message = error instanceof Error ? error.message : ''
  return message === 'invalid-credential'
}

export const registerWithFirebase = async (name: string, email: string, password: string) => {
  if (!auth) throw new Error('Email verification is not configured.')
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
    await updateProfile(cred.user, { displayName: name.trim() })
    await sendEmailVerification(cred.user, continueUrl())
    await signOut(auth)
  } catch (error) {
    throw new Error(friendlyAuthError(error))
  }
}

export const loginWithFirebase = async (email: string, password: string) => {
  if (!auth) throw new Error('invalid-credential')
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password)
    if (!cred.user.emailVerified) {
      await signOut(auth)
      throw new Error('Please verify your email first')
    }
    const idToken = await cred.user.getIdToken()
    const name = cred.user.displayName || ''
    await signOut(auth)
    return { idToken, name }
  } catch (error) {
    if (error instanceof Error && error.message === 'Please verify your email first') throw error
    throw new Error(friendlyAuthError(error))
  }
}

export const resendFirebaseVerification = async (email: string, password: string) => {
  if (!auth) throw new Error('Email verification is not configured.')
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password)
    if (!cred.user.emailVerified) {
      await sendEmailVerification(cred.user, continueUrl())
    }
    await signOut(auth)
  } catch (error) {
    if (error instanceof Error && error.message === 'Please verify your email first') throw error
    throw new Error(friendlyAuthError(error))
  }
}

export const sendFirebasePasswordReset = async (email: string) => {
  if (!auth) throw new Error('Email verification is not configured.')
  try {
    await sendPasswordResetEmail(auth, email.trim(), continueUrl())
  } catch (error) {
    const message = friendlyAuthError(error)
    if (message === 'user-not-found') return
    throw new Error(message)
  }
}
