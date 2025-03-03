export const ROUTES = {
  login: '/',
  quizHome: '/quizzes',
  quizDetail: '/quizzes/:quizId',
  quizDetailResults: '/quizzes/:quizId/results',
} as const

export const TAB_VALUES = {
  LOGIN: 'login',
  REGISTER: 'register',
} as const

export const ERROR_TOAST_DURATION = 7000
