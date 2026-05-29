import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import FullScreenLayout from '@/components/layout/FullScreenLayout.vue'
import NotFound from '@/views/NotFound.vue'
import { useAuthStore } from '@/stores/auth.ts'
import { storeToRefs } from 'pinia'
import { useRefreshToken, useSetTokens } from '@/composables/useRefreshAuth.ts'
import { getCookie } from '@/utils/cookie.ts'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },

  routes: [
    {
      component: AdminLayout,
      path: '/',
      children: [
        {
          path: '/',
          name: 'Dashboard',
          component: () => import('../views/Dashboard.vue'),
          meta: { title: 'Дашборд'},
        },
        {
          path: '/create-offer',
          name: 'CreateOffer',
          component: () => import('../views/Offer/Create.vue'),
          meta: { title: 'Создать предложение' },

        },
        {
          path: '/my-offers',
          name: 'MyOffers',
          component: () => import('../views/Offer/MyOffers.vue'),
          meta: { title: 'Мои предложения'},
        },
        {
          path: '/preview-offer/:id',
          name: 'PreviewOffer',
          component: () => import('../views/Offer/Preview.vue'),
          meta: { title: 'Предпросмотр'},
        },
        {
          path: '/edit-offer/:id',
          name: 'EditOffer',
          component: () => import('../views/Offer/Edit.vue'),
          meta: { title: 'Редактировать предложение' },
        },
        {
          path: '/offer-reviews/:id',
          name: 'OfferReviews',
          component: () => import('../views/Offer/Reviews.vue'),
          meta: { title: 'Отзывы предложения' },
        },
        {
          path: '/seller-profile',
          name: 'SellerProfile',
          component: () => import('../views/SellerProfile/index.vue'),
          meta: { title: 'Профиль компании' },
        },
        {
          path: '/calendar',
          name: 'Calendar',
          component: () => import('../views/Others/Calendar.vue'),
          meta: { title: 'Календарь'},
        },
        {
          path: '/basic-tables',
          name: 'BasicTables',
          component: () => import('../views/Tables/BasicTables.vue'),
          meta: { title: 'Таблицы'},
        },
      ]
    },
    {
      path: '/signin',
      component: FullScreenLayout,
      children: [
        {
          path: '/signin',
          name: 'Signin',
          component: () => import('../views/Auth/Signin.vue'),
          meta: { title: 'Войти',  public: true },
        },
        {
          path: '/signup',
          name: 'Signup',
          component: () => import('../views/Auth/Signup.vue'),
          meta: { title: 'Регистрация', public: true },
        },
      ],
    },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  ],
})

let isAuthInitialized = false

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const { isLogged } = storeToRefs(authStore)
  const isPublic = to.meta.public
  const refreshToken = getCookie('refreshToken')

  if (!isAuthInitialized) {
    if (refreshToken) {
      try {
        const data = await useRefreshToken()
        useSetTokens(data)
        isLogged.value = true
      } catch (error) {
        console.error('Token refresh failed:', error)
      }
    }
    isAuthInitialized = true
  }

  if (!isPublic && !isLogged.value) {
    return next('/signin')
  }

  if (isLogged.value && (to.path === '/signin' || to.path === '/signup')) {
    return next('/')
  }

  document.title = `${to.meta.title ?? 'LocaFun'} | LocaFun sellers`
  next()
})

export default router
