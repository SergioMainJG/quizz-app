import { Routes } from "@angular/router";
import { normalizeTitle } from "../normalize-routes";

const authRoutes: Routes = [
  {
    path: '',
    pathMatch: "full",
    redirectTo: "sign-in",
  },
  {
    path: 'sign-in',
    loadComponent: () => import('../../pages/sign-in/sign-in'),
    title: normalizeTitle('Sign in'),
    data: { background: '/images/sign-in.avif', alt: "" }, 
  },
  {
    path: 'sign-up',
    loadComponent: () => import('../../pages/sign-up/sign-up'),
    title: normalizeTitle('Sign up'),
    data: { background: '/images/sign-up.avif', alt: ""},
  }
]

export default authRoutes;