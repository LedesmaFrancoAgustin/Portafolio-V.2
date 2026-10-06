interface SceneLoaderProps {
  progress: number
  done: boolean
}

export function SceneLoader({ progress, done }: SceneLoaderProps) {
  return (
    <div className={`scene-loader${done ? ' is-done' : ''}`}>
      <span className="scene-loader-label">Cargando escena</span>
      <span className="scene-loader-track">
        <span className="scene-loader-bar" style={{ transform: `scaleX(${progress})` }} />
      </span>
    </div>
  )
}
