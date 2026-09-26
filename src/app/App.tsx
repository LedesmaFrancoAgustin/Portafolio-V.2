import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SceneCanvas } from '../scene/components/SceneCanvas'
import { Header } from '../components/layout/Header'
import { SocialSidebar } from '../components/ui/SocialSidebar'
import { MainLayout } from './layouts/MainLayout'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProjectDetailPage } from '../features/project-detail/components/ProjectDetailPage'

function App() {
  // prototype-only toggle to preview a night variant of the scene; not a real feature yet
  const [isNight, setIsNight] = useState(false)

  return (
    <BrowserRouter>
      <div id="app">
        <SceneCanvas isNight={isNight} />
        <Header isNight={isNight} onToggleNight={() => setIsNight((v) => !v)} />
        <SocialSidebar />
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects/:slug" element={<ProjectDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MainLayout>
      </div>
    </BrowserRouter>
  )
}

export default App
