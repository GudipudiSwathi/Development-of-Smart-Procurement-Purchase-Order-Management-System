import { inject } from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';


export const authGuard: CanActivateFn = (
  route
) => {

  const router = inject(Router);


  // ==========================================
  // GET LOGIN INFORMATION
  // ==========================================

  const token =
    localStorage.getItem('token');

  const role =
    localStorage.getItem('role');


  console.log(
    'AUTH GUARD - TOKEN:',
    token ? 'FOUND' : 'NOT FOUND'
  );

  console.log(
    'AUTH GUARD - ROLE:',
    role || 'NO ROLE'
  );


  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (!token) {

    console.log(
      'AUTH GUARD - NOT LOGGED IN'
    );

    return router.createUrlTree([
      '/login'
    ]);

  }


  // ==========================================
  // CHECK ADMIN ROUTE
  // ==========================================

  const isAdminRoute =
    route.routeConfig?.path === 'admin-dashboard';


  if (isAdminRoute) {

    console.log(
      'AUTH GUARD - ADMIN ROUTE'
    );


    // ----------------------------------------
    // USER IS NOT ADMIN
    // ----------------------------------------

    if (
      role?.toUpperCase() !== 'ADMIN'
    ) {

      console.log(
        'AUTH GUARD - ACCESS DENIED'
      );

      return router.createUrlTree([
        '/dashboard'
      ]);

    }


    // ----------------------------------------
    // USER IS ADMIN
    // ----------------------------------------

    console.log(
      'AUTH GUARD - ADMIN ACCESS GRANTED'
    );

    return true;

  }


  // ==========================================
  // NORMAL AUTHENTICATED ROUTES
  // ==========================================

  console.log(
    'AUTH GUARD - ACCESS GRANTED'
  );

  return true;

};
