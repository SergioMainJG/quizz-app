import { Routes } from "@angular/router";
import { normalizeTitle } from "../normalize-routes";

const authRoutes: Routes = [
  {
    path: 'sign-in',
    loadComponent: () => import('../../pages/sign-in/sign-in'),
    title: normalizeTitle('Sign in'),
  },
  {
    path: 'sign-up',
    loadComponent: () => import('../../pages/sign-up/sign-up'),
    title: normalizeTitle('Sign up'),
  }
]

export default authRoutes;