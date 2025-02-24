import { useState } from 'react'
import MainContent from './components/MainContent.jsx'
import  {BrowserRouter, Route, Routes, Navigate} from "react-router-dom"
import PageNotFound from './components/pageNotFound/error.jsx'
import PureCounter from '@srexi/purecounterjs'

function App() {
  return (
    <> 
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to={"/cms"} />} />
          <Route path="/cms" element={<MainContent/>} />
          <Route path="*" element={<PageNotFound/>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
