import { PROJECTS } from '../../../content/projects'
import { useInView } from '../../../shared/hooks/useInView'
import { FeaturedGallery } from './FeaturedGallery'
import { ProjectCard } from './ProjectCard'
import { ProjectShowcase } from './ProjectShowcase'
import '../projects.css'

export function Projects() {
  const featuredProject = PROJECTS.find((project) => project.featured)
  const otherProjects = PROJECTS.filter((project) => project !== featuredProject)

  // El video del showcase y los de la galería (6 clips) se posponen hasta que la
  // sección esté cerca del viewport en vez de cargar todo apenas entra el home.
  const [featuredRef, featuredInView] = useInView<HTMLDivElement>()

  return (
    <section id="projects" className="projects-section">
      <div className="projects-content section-text-scrim">
        <p className="projects-eyebrow">Proyectos</p>
        <h2 className="projects-heading">Cosas que construí.</h2>
        <p className="projects-paragraph">
          Una selección de productos en los que trabajé, de principio a fin.
        </p>

        {featuredProject && (
          <div className="projects-featured" ref={featuredRef}>
            <p className="projects-subheading">Proyecto destacado</p>
            <div className="projects-featured-grid">
              <ProjectCard project={featuredProject} featured />
              {featuredProject.liveUrl &&
                featuredProject.showcaseVideo &&
                (featuredInView ? (
                  <ProjectShowcase
                    url={featuredProject.liveUrl}
                    name={featuredProject.name}
                    video={featuredProject.showcaseVideo}
                  />
                ) : (
                  <div className="project-showcase project-showcase--placeholder" aria-hidden="true" />
                ))}
            </div>

            {featuredProject.galleryItems &&
              featuredProject.galleryItems.length > 0 &&
              (featuredInView ? (
                <FeaturedGallery items={featuredProject.galleryItems} />
              ) : (
                <div className="featured-gallery" aria-hidden="true" />
              ))}
          </div>
        )}

        {otherProjects.length > 0 && (
          <div className="projects-others">
            <p className="projects-subheading">Más proyectos</p>
            <div className="projects-grid">
              {otherProjects.map((project) => (
                <ProjectCard project={project} key={project.slug} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
