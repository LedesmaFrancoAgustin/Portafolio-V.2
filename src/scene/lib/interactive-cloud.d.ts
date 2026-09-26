declare namespace JSX {
  interface IntrinsicElements {
    'interactive-cloud': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      class?: string
      src?: string
      density?: number | string
      influence?: number | string
      strength?: number | string
      glow?: number | string
      erode?: number | string
      breathe?: number | string
    }
  }
}
