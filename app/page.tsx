import Image from "next/image";
import Hero from "@/components/Hero";
import Tilt from "@/components/Tilt";
import { profile, projects } from "@/data/profile";

export default function Home() {
  const links = [
    profile.email && { label: profile.email, href: `mailto:${profile.email}` },
    profile.github && { label: "GitHub", href: profile.github },
    profile.linkedin && { label: "LinkedIn", href: profile.linkedin },
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  return (
    <>
      <header className="nav">
        <a className="nav-name" href="#top">
          {profile.name}
        </a>
        <nav aria-label="Sections">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          {profile.resume && (
            <a className="nav-cta" href={profile.resume} download>
              Resume
            </a>
          )}
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-scene">
            <Hero />
          </div>
          <div className="hero-copy">
            <p className="hero-role">
              {profile.role}
              {profile.location && `, ${profile.location}`}
            </p>
            <h1>{profile.headline}</h1>
            <p className="hero-intro">{profile.intro}</p>
            <div className="hero-actions">
              <a className="btn" href="#work">
                See the work
              </a>
              {profile.email && (
                <a className="btn btn-line" href={`mailto:${profile.email}`}>
                  Email me
                </a>
              )}
            </div>
          </div>
          <p className="hero-hint">Move over the portrait, select it, or pick one of the three objects circling it.</p>
        </section>

        <section id="work" aria-label="Work">
          {projects.map((project) => (
            <article key={project.slug} id={project.slug} className={`panel panel-${project.slug}`}>
              <div className="panel-inner">
                <div className="panel-copy">
                  <h2>{project.name}</h2>
                  <p className="panel-tagline">{project.tagline}</p>
                  <p className="panel-description">{project.description}</p>
                  <ul className="panel-highlights">
                    {project.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <ul className="panel-stack" aria-label="Built with">
                    {project.stack.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  {(project.live || project.source) && (
                    <div className="panel-links">
                      {project.live && (
                        <a className="btn" href={project.live} target="_blank" rel="noreferrer">
                          Open the live app
                        </a>
                      )}
                      {project.source && (
                        <a className="btn btn-line" href={project.source} target="_blank" rel="noreferrer">
                          Read the code
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <Tilt className="panel-shot">
                  <Image src={project.shot} alt={project.shotAlt} width={2400} height={1500} sizes="(max-width: 1000px) 100vw, 62vw" />
                </Tilt>
              </div>
            </article>
          ))}
        </section>

        <section id="about" className="about">
          <div className="about-text">
            <h2>About</h2>
            {profile.about.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {profile.earlier.length > 0 && (
              <div className="earlier">
                <h3>Earlier projects</h3>
                {profile.earlier.map((item) => (
                  <p key={item.name}>
                    <a href={item.link} target="_blank" rel="noreferrer">
                      {item.name}
                    </a>
                    {item.what}
                  </p>
                ))}
              </div>
            )}
          </div>
          <dl className="skills">
            {profile.skills.map((skill) => (
              <div key={skill.group}>
                <dt>{skill.group}</dt>
                <dd>{skill.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </section>

        {(profile.experience.length > 0 || profile.education.length > 0) && (
          <section className="history">
            {profile.experience.length > 0 && (
              <div>
                <h2>{profile.experienceTitle}</h2>
                {profile.experience.map((job) => (
                  <div className="entry" key={job.role + job.org}>
                    <p className="entry-period">{job.period}</p>
                    <div>
                      <h3>
                        {job.role}, {job.org}
                      </h3>
                      {job.points.length > 0 && (
                        <ul>
                          {job.points.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {profile.education.length > 0 && (
              <div>
                <h2>Education</h2>
                {profile.education.map((school) => (
                  <div className="entry" key={school.degree + school.school}>
                    <p className="entry-period">{school.period}</p>
                    <div>
                      <h3>{school.degree}</h3>
                      <p>
                        {school.school}
                        {school.detail && `, ${school.detail}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section id="contact" className="contact">
          <h2>Looking for an intern who ships? Let&apos;s talk.</h2>
          {links.length > 0 && (
            <ul>
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target={link.href.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>
          {profile.name}, {new Date().getFullYear()}
        </p>
        <p>Built with Next.js and React Three Fiber.</p>
      </footer>
    </>
  );
}
