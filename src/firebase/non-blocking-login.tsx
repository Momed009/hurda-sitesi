'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';

/**
 * Initiate anonymous sign-in.
 * Returns the promise so callers can optionally handle errors.
 * Auth state change is still handled by onAuthStateChanged listener.
 */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<UserCredential | void> {
  return signInAnonymously(authInstance).catch((error) => {
    console.error('Anonymous sign-in failed:', error);
    throw error; // Re-throw so callers can handle if they choose to
  });
}

/**
 * Initiate email/password sign-up.
 * Returns the promise so callers can optionally handle errors.
 */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<UserCredential | void> {
  return createUserWithEmailAndPassword(authInstance, email, password).catch((error) => {
    console.error('Email sign-up failed:', error);
    throw error;
  });
}

/**
 * Initiate email/password sign-in.
 * Returns the promise so callers can optionally handle errors.
 */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential | void> {
  return signInWithEmailAndPassword(authInstance, email, password).catch((error) => {
    console.error('Email sign-in failed:', error);
    throw error;
  });
}
