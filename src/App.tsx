import "@fontsource-variable/inter";
import { Route, Routes } from "react-router";
import { AuthenticatedLayout } from "./layouts/authenticated";
import { ROUTES } from "./lib/constants";
import { LoginPage } from "./pages/login";
import { QuizDetailPage } from "./pages/quiz-detail";
import { QuizHomePage } from "./pages/quiz-home";
import { QuizResultsPage } from "./pages/quiz-results";

function App() {
  return (
    <>
      <Routes>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route element={<AuthenticatedLayout />}>
          <Route path={ROUTES.quizHome} element={<QuizHomePage />} />
          <Route path={ROUTES.quizDetail} element={<QuizDetailPage />} />
          <Route
            path={ROUTES.quizDetailResults}
            element={<QuizResultsPage />}
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
