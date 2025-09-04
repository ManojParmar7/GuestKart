export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    customers: '/dashboard/customers',
    integrations: '/dashboard/integrations',
    settings: '/dashboard/settings',
    banner: '/dashboard/banner',
    categories: '/dashboard/categories',
    roles: '/dashboard/roles',
    products: '/dashboard/products',
        size: '/dashboard/size',
                color: '/dashboard/color',

          extra: '/dashboard/accessories',
            deliveryStaff: '/dashboard/deliveryStaff',
                orders: '/dashboard/orders',



             

        



  },
  errors: { notFound: '/errors/not-found' },
} as const;
