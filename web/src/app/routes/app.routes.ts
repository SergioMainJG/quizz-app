import { Routes } from "@angular/router";
import Homepage from "../pages/homepage/homepage";
import { normalizeTitle } from "./normalize-routes";


export const routes: Routes = [
  {
    path: '',
    component: Homepage,
    title: normalizeTitle('Home')
  },
  {
    path: 'auth',
    loadComponent: () => import('../layouts/auth/auth.layout'),
    loadChildren: () => import('./auth/auth.routes'),
  }
  
];
