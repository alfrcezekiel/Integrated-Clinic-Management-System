import { Suspense, lazy } from 'react'
import  {BrowserRouter, Route, Routes, Navigate} from "react-router-dom"
import PageNotFound from './components/pageNotFound/error.jsx'
import {useEffect} from "react"
import Loader from "./components/Loader/Loader.jsx"

const Home = lazy(() => import("./components/MainContent.jsx"));
const PatientsPortal = lazy(() => import("./components/pages/PatientsLogin.jsx"));

function App() {
  useEffect(() => {
    const TitleHeader = () => {
        document.title = "CMS | Home"
    }
    TitleHeader();
  }, [])

  return (
    <> 
      <BrowserRouter>
        <Suspense fallback={<Loader/>}>
          <Routes>
            <Route path="/" element={<Navigate to={"/cms"} replace/>} />
            <Route path="/cms" element={<Home />} />
            <Route path="/patients-portal" element={<PatientsPortal/>} />
            <Route path="*" element={<PageNotFound/>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  )
}

export default App
