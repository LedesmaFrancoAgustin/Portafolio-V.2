import { useState, type RefObject } from 'react'
import { PanelLeft, PanelLeftClose } from 'lucide-react'
import { TONE_COLOR } from '../lib/code-panel-data'
import { useCodePanel } from '../hooks/useCodePanel'

interface CodePanelProps {
  /** Anchor for the projection beam's target, near the panel's edge. */
  beamTargetRef?: RefObject<HTMLSpanElement>
}

// Mismo corte que about.css (max-width: 640px, ver about-panel-float-mobile):
// en mobile el panel tiene mucho menos ancho real, así que el explorador
// arranca compactado a solo íconos en vez de robarle espacio al editor.
const MOBILE_QUERY = '(max-width: 640px)'

/**
 * Floating code editor mockup, ported from the "Hero Projection" Claude
 * Design prototype — explorer and tabs stay clickable, matching the source.
 */
export function CodePanel({ beamTargetRef }: CodePanelProps) {
  const { tree, tabs, file, lines, lang, containerRef } = useCodePanel()
  const [explorerCollapsed, setExplorerCollapsed] = useState(
    () => window.matchMedia(MOBILE_QUERY).matches,
  )

  return (
    <div className="about-code-stage" ref={containerRef}>
      <div className="about-code-panel">
        <div className="about-code-glow" aria-hidden="true" />

        <div className="about-code-surface">
          <span ref={beamTargetRef} className="about-code-beam-anchor" aria-hidden="true" />
          <div className="about-code-beam-hit" aria-hidden="true" />

          <div className="about-code-titlebar">
            <div className="about-code-dots">
              <span className="about-code-dot about-code-dot--red" />
              <span className="about-code-dot about-code-dot--yellow" />
              <span className="about-code-dot about-code-dot--green" />
            </div>
            <span className="about-code-repo">users-api</span>
            <span className="about-code-status-led" />
          </div>

          <div className={`about-code-body${explorerCollapsed ? ' about-code-body--explorer-collapsed' : ''}`}>
            <div className="about-code-explorer">
              <div className="about-code-explorer__label">
                <span className="about-code-explorer__label-text">Explorer</span>
                <button
                  type="button"
                  className="about-code-explorer__toggle"
                  onClick={() => setExplorerCollapsed((v) => !v)}
                  aria-label={explorerCollapsed ? 'Expandir explorador' : 'Compactar explorador a solo íconos'}
                  aria-expanded={!explorerCollapsed}
                >
                  {explorerCollapsed ? (
                    <PanelLeft aria-hidden="true" />
                  ) : (
                    <PanelLeftClose aria-hidden="true" />
                  )}
                </button>
              </div>
              {tree.map((node) => (
                <div key={node.name}>
                  <button
                    type="button"
                    onClick={node.toggle}
                    className="about-code-folder"
                    data-active={node.isOpen}
                    title={explorerCollapsed ? node.name : undefined}
                  >
                    <span className="about-code-chevron">{node.isOpen ? '▼' : '▶'}</span>
                    <span className="about-code-tint" style={{ background: node.tint }} />
                    <span className="about-code-label">{node.name}</span>
                  </button>
                  {node.isOpen && !explorerCollapsed && (
                    <div>
                      {node.files.map((f) => (
                        <button
                          key={f.name}
                          type="button"
                          onClick={f.select}
                          className="about-code-file"
                          data-active={f.isActive}
                          style={{ borderLeftColor: f.isActive ? '#5fc6f5' : 'transparent' }}
                        >
                          <span className="about-code-tint about-code-tint--sm" style={{ background: f.tint }} />
                          <span className="about-code-label">{f.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="about-code-editor">
              <div className="about-code-tabs">
                {tabs.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={t.select}
                    className="about-code-tab"
                    data-active={t.isActive}
                  >
                    <span className="about-code-tint about-code-tint--sm" style={{ background: t.tint }} />
                    <span className="about-code-label">{t.name}</span>
                    <span className="about-code-tab-close">×</span>
                  </button>
                ))}
              </div>

              <div className="about-code-lines">
                <div className="about-code-gutter">
                  {lines.map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <div className="about-code-source">
                  {lines.map((segs, i) => (
                    <div key={`${file}-${i}`} className="about-code-line">
                      {segs.length
                        ? segs.map(([text, tone], j) => (
                            <span key={j} style={{ color: TONE_COLOR[tone] }}>
                              {text}
                            </span>
                          ))
                        : ' '}
                    </div>
                  ))}
                </div>
                <div className="about-code-scanline" aria-hidden="true" />
                <div className="about-code-scanlines" aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="about-code-terminal">
            <span className="about-code-prompt">❯</span>
            <span className="about-code-terminal-line">claude code explain {file}</span>
            <span className="about-code-caret" />
            <span className="about-code-terminal-status">{lang}</span>
          </div>

          <div className="about-code-sweep-wrap" aria-hidden="true">
            <div className="about-code-sweep" />
          </div>
        </div>

        <div className="about-code-reflection" aria-hidden="true" />
      </div>
    </div>
  )
}
