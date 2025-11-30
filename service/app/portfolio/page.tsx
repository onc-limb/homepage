import { getProjects, type Project } from '@/lib/portfolio';
import { Github, ExternalLink, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
function ProjectCard({ project }: { project: Project }) {
    const hasDetailPage = project.detail !== undefined;
    return (
        <div className="border border-border/50 bg-card/30 p-6 group">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <span className="text-xs text-muted-foreground tracking-elegant uppercase">
                        {project.category === 'personal' ? 'Personal' : 'Work'}
                    </span>
                    <h3 className="text-xl font-medium text-foreground tracking-elegant mt-1">
                        {project.title}
                    </h3>
                </div>
                <span className="text-xs text-muted-foreground">{project.period}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {project.description}
            </p>
            {/* Technologies */}
            <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.slice(0, 5).map((tech) => (
                    <span
                        key={tech}
                        className="text-xs px-2 py-1 bg-accent/50 text-foreground/80 tracking-elegant"
                    >
                        {tech}
                    </span>
                ))}
                {project.technologies.length > 5 && (
                    <span className="text-xs px-2 py-1 text-muted-foreground">
                        +{project.technologies.length - 5}
                    </span>
                )}
            </div>
            {/* Highlights (簡略化) */}
            {project.highlights.length > 0 && (
                <ul className="space-y-1 mb-4">
                    {project.highlights.slice(0, 3).map((highlight, index) => (
                        <li
                            key={index}
                            className="text-sm text-foreground/70 flex items-start gap-2"
                        >
                            <span className="text-muted-foreground mt-0.5">•</span>
                            <span>{highlight}</span>
                        </li>
                    ))}
                </ul>
            )}
            {/* Links */}
            <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <div className="flex gap-4">
                    {project.links?.github && (
                        <Link
                            href={project.links.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Github className="w-4 h-4" />
                            <span>GitHub</span>
                        </Link>
                    )}
                    {project.links?.demo && (
                        <Link
                            href={project.links.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>Demo</span>
                        </Link>
                    )}
                    {project.links?.article && (
                        <Link
                            href={project.links.article}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <FileText className="w-4 h-4" />
                            <span>Article</span>
                        </Link>
                    )}
                </div>
                {hasDetailPage && (
                    <Link
                        href={`/portfolio/${project.id}`}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <span>詳細を見る</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                )}
            </div>
        </div>
    );
}
const Portfolio = () => {
    const projects = getProjects();
    const personalProjects = projects.filter((p) => p.category === 'personal');
    const workProjects = projects.filter((p) => p.category === 'work');
    return (
        <main className="flex-1">
            {/* Hero Section */}
            <section className="w-full py-16 md:py-24">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-6 text-center">
                        <span className="text-xs tracking-wide-elegant text-muted-foreground uppercase">
                            Works
                        </span>
                        <h1 className="text-4xl font-light tracking-wide-elegant sm:text-5xl text-foreground">
                            Portfolio
                        </h1>
                        <div className="w-16 h-px bg-border/70 my-4" />
                        <p className="max-w-[600px] text-muted-foreground text-base md:text-lg font-light tracking-elegant">
                            作成したアプリケーション・プロジェクト
                        </p>
                    </div>
                </div>
            </section>
            {/* Divider */}
            <div className="w-full border-t border-border/30" />
            {/* Projects Section */}
            <section className="w-full py-16 md:py-20">
                <div className="container px-4 md:px-6 mx-auto max-w-4xl">
                    {/* Personal Projects */}
                    {personalProjects.length > 0 && (
                        <div className="mb-12">
                            <h2 className="text-xl font-light tracking-elegant text-foreground mb-6 pb-2 border-b border-border/30">
                                Personal Projects
                            </h2>
                            <div className="grid gap-6">
                                {personalProjects.map((project) => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Work Projects */}
                    {workProjects.length > 0 && (
                        <div className="mb-12">
                            <h2 className="text-xl font-light tracking-elegant text-foreground mb-6 pb-2 border-b border-border/30">
                                Work Experience
                            </h2>
                            <div className="grid gap-6">
                                {workProjects.map((project) => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Empty State */}
                    {projects.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                プロジェクトは準備中です
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};
export default Portfolio;
