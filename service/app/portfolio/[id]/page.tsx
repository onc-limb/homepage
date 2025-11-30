import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Github, ExternalLink, FileText, ArrowLeft, Server, Code, Layers } from 'lucide-react';
import { getProjectById, getProjectIds, type Project, type ArchitectureComponent as ArchitectureComponentType } from '@/lib/portfolio';
// 静的パスを生成
export function generateStaticParams() {
    const ids = getProjectIds();
    return ids.map((id) => ({ id }));
}
// メタデータを生成
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = getProjectById(id);
    if (!project) {
        return { title: 'Project Not Found' };
    }
    return {
        title: `${project.title} | Portfolio`,
        description: project.description,
    };
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-12">
            <h2 className="text-xl font-light tracking-elegant text-foreground mb-6 pb-2 border-b border-border/30">
                {title}
            </h2>
            {children}
        </section>
    );
}
function ArchitectureComponent({ component }: { component: ArchitectureComponentType }) {
    return (
        <div className="border border-border/50 bg-card/30 p-4">
            <h4 className="text-base font-medium text-foreground tracking-elegant mb-2">
                {component.name}
            </h4>
            <p className="text-sm text-muted-foreground mb-3">{component.description}</p>
            <div className="flex flex-wrap gap-2">
                {component.technologies.map((tech) => (
                    <span
                        key={tech}
                        className="text-xs px-2 py-1 bg-accent/50 text-foreground/80 tracking-elegant"
                    >
                        {tech}
                    </span>
                ))}
            </div>
        </div>
    );
}
export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = getProjectById(id);
    if (!project || !project.detail) {
        notFound();
    }
    const { detail } = project;
    return (
        <main className="flex-1">
            {/* Hero Section */}
            <section className="w-full py-16 md:py-24">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-6 text-center">
                        {/* Back Link */}
                        <Link
                            href="/portfolio"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Portfolio に戻る</span>
                        </Link>
                        <span className="text-xs tracking-wide-elegant text-muted-foreground uppercase">
                            {project.category === 'personal' ? 'Personal Project' : 'Work Experience'}
                        </span>
                        <h1 className="text-4xl font-light tracking-wide-elegant sm:text-5xl text-foreground">
                            {project.title}
                        </h1>
                        <div className="w-16 h-px bg-border/70 my-4" />
                        <p className="max-w-[700px] text-muted-foreground text-base md:text-lg font-light tracking-elegant">
                            {project.longDescription || project.description}
                        </p>
                        {/* Meta Info */}
                        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mt-4">
                            <div>
                                <span className="text-xs uppercase tracking-wide">期間</span>
                                <p className="text-foreground">{project.period}</p>
                            </div>
                            <div>
                                <span className="text-xs uppercase tracking-wide">担当</span>
                                <p className="text-foreground">{project.role}</p>
                            </div>
                        </div>
                        {/* Links */}
                        {project.links && (
                            <div className="flex gap-4 mt-4">
                                {project.links.github && (
                                    <Link
                                        href={project.links.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 border border-border/50 text-sm text-foreground hover:bg-accent transition-colors"
                                    >
                                        <Github className="w-4 h-4" />
                                        <span>GitHub</span>
                                    </Link>
                                )}
                                {project.links.demo && (
                                    <Link
                                        href={project.links.demo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 border border-border/50 text-sm text-foreground hover:bg-accent transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        <span>Demo</span>
                                    </Link>
                                )}
                                {project.links.article && (
                                    <Link
                                        href={project.links.article}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 border border-border/50 text-sm text-foreground hover:bg-accent transition-colors"
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span>Article</span>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>
            {/* Divider */}
            <div className="w-full border-t border-border/30" />
            {/* Content Section */}
            <section className="w-full py-16 md:py-20">
                <div className="container px-4 md:px-6 mx-auto max-w-4xl">
                    {/* Technologies */}
                    <Section title="使用技術">
                        <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech) => (
                                <span
                                    key={tech}
                                    className="text-sm px-3 py-1.5 bg-accent/50 text-foreground tracking-elegant"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </Section>
                    {/* Overview */}
                    {detail.overview && (
                        <Section title="概要">
                            <p className="text-muted-foreground leading-relaxed">
                                {detail.overview}
                            </p>
                        </Section>
                    )}
                    {/* Background */}
                    {detail.background && (
                        <Section title="背景・課題">
                            <p className="text-muted-foreground leading-relaxed">
                                {detail.background}
                            </p>
                        </Section>
                    )}
                    {/* Architecture */}
                    {detail.architecture && (
                        <Section title="アーキテクチャ">
                            <div className="space-y-6">
                                <p className="text-muted-foreground leading-relaxed">
                                    {detail.architecture.description}
                                </p>
                                {detail.architecture.components && detail.architecture.components.length > 0 && (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {detail.architecture.components.map((component, index) => (
                                            <ArchitectureComponent key={index} component={component} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Section>
                    )}
                    {/* Technical Points */}
                    {detail.technicalPoints && detail.technicalPoints.length > 0 && (
                        <Section title="技術的な工夫">
                            <div className="space-y-6">
                                {detail.technicalPoints.map((point, index) => (
                                    <div key={index} className="border-l-2 border-border/50 pl-4">
                                        <h3 className="text-base font-medium text-foreground tracking-elegant mb-2">
                                            {point.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {point.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}
                    {/* Challenges */}
                    {detail.challenges && detail.challenges.length > 0 && (
                        <Section title="課題と解決策">
                            <div className="space-y-6">
                                {detail.challenges.map((challenge, index) => (
                                    <div key={index} className="border border-border/50 bg-card/30 p-4">
                                        <div className="mb-3">
                                            <span className="text-xs text-muted-foreground uppercase tracking-wide">
                                                課題
                                            </span>
                                            <p className="text-foreground mt-1">{challenge.problem}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-muted-foreground uppercase tracking-wide">
                                                解決策
                                            </span>
                                            <p className="text-foreground/80 mt-1">{challenge.solution}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}
                    {/* Results */}
                    {detail.results && detail.results.length > 0 && (
                        <Section title="成果・学び">
                            <ul className="space-y-2">
                                {detail.results.map((result, index) => (
                                    <li
                                        key={index}
                                        className="text-muted-foreground flex items-start gap-2"
                                    >
                                        <span className="text-foreground/50 mt-1">•</span>
                                        <span>{result}</span>
                                    </li>
                                ))}
                            </ul>
                        </Section>
                    )}
                    {/* Future Work */}
                    {detail.futureWork && detail.futureWork.length > 0 && (
                        <Section title="今後の展望">
                            <ul className="space-y-2">
                                {detail.futureWork.map((work, index) => (
                                    <li
                                        key={index}
                                        className="text-muted-foreground flex items-start gap-2"
                                    >
                                        <span className="text-foreground/50 mt-1">•</span>
                                        <span>{work}</span>
                                    </li>
                                ))}
                            </ul>
                        </Section>
                    )}
                    {/* Back to Portfolio */}
                    <div className="mt-16 pt-8 border-t border-border/30 text-center">
                        <Link
                            href="/portfolio"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Portfolio 一覧に戻る</span>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
