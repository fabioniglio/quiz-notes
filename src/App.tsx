import '@fontsource-variable/inter'
import { Route, Routes } from 'react-router'
import { AuthenticatedLayout } from './layouts/authenticated'
import { ROUTES } from './lib/constants'
import { LoginPage } from './pages/login'
import { QuizDetail } from './pages/quiz-detail'
import { QuizHome } from './pages/quiz-home'
import { QuizResults } from './pages/quiz-results'

function App() {
  return (
    <Routes>
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route element={<AuthenticatedLayout />}>
        <Route path={ROUTES.quizHome} element={<QuizHome />} />
        <Route path={ROUTES.quizDetail} element={<QuizDetail />} />
        <Route path={ROUTES.quizDetailResults} element={<QuizResults />} />
      </Route>
    </Routes>
  )
}

export default App
