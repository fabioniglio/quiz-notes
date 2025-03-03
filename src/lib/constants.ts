export const ROUTES = {
  login: '/',
  quizHome: '/quizzes',
  quizDetail: '/quizzes/:id',
  quizDetailResults: '/quizzes/:id/results',
} as const

export const TAB_VALUES = {
  LOGIN: 'login',
  REGISTER: 'register',
} as const

export const ERROR_TOAST_DURATION = 7000
