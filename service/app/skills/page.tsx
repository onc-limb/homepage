import {
    getSkillsByCategory,
    categoryLabels,
    categoryOrder,
    levelLabels,
    type Skill,
    type SkillCategory,
} from '@/lib/skills';
function SkillCard({ skill }: { skill: Skill }) {
    const levelInfo = levelLabels[skill.level];
    return (
        <div className="border border-border/50 bg-card/30 p-6">
            <div className="flex items-center gap-3 mb-4">
                <span className="text-lg">{levelInfo.icon}</span>
                <h3 className="text-lg font-medium text-foreground tracking-elegant">
                    {skill.name}
                </h3>
                <span className={`text-xs ${levelInfo.color}`}>
                    {levelInfo.label}
                </span>
            </div>
            {skill.experience.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm text-muted-foreground mb-2 tracking-elegant">
                        やったこと
                    </h4>
                    <ul className="space-y-1">
                        {skill.experience.map((exp, index) => (
                            <li
                                key={index}
                                className="text-sm text-foreground/80 flex items-start gap-2"
                            >
                                <span className="text-muted-foreground mt-1">•</span>
                                <span>{exp}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {skill.knowledge.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm text-muted-foreground mb-2 tracking-elegant">
                        知っていること
                    </h4>
                    <ul className="space-y-1">
                        {skill.knowledge.map((know, index) => (
                            <li
                                key={index}
                                className="text-sm text-foreground/80 flex items-start gap-2"
                            >
                                <span className="text-muted-foreground mt-1">•</span>
                                <span>{know}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {skill.relatedTech.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm text-muted-foreground mb-2 tracking-elegant">
                        関連技術
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {skill.relatedTech.map((tech, index) => (
                            <span
                                key={index}
                                className="text-xs px-2 py-1 bg-muted/50 text-foreground/70 rounded"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            {skill.relatedBooks.length > 0 && (
                <div>
                    <h4 className="text-sm text-muted-foreground mb-2 tracking-elegant">
                        📚 関連書籍
                    </h4>
                    <ul className="space-y-1">
                        {skill.relatedBooks.map((book, index) => (
                            <li
                                key={index}
                                className="text-sm text-foreground/80 flex items-start gap-2"
                            >
                                <span className="text-muted-foreground mt-1">•</span>
                                <span>{book}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
function SkillCategorySection({
    category,
    skills,
}: {
    category: SkillCategory;
    skills: Skill[];
}) {
    if (skills.length === 0) return null;
    return (
        <div className="mb-12">
            <h2 className="text-xl font-light tracking-elegant text-foreground mb-6 pb-2 border-b border-border/30">
                {categoryLabels[category]}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
                {skills.map((skill) => (
                    <SkillCard key={skill.name} skill={skill} />
                ))}
            </div>
        </div>
    );
}
export default function SkillsPage() {
    // カテゴリごとにスキルをグループ化
    const skillsByCategory = getSkillsByCategory();
    return (
        <main className="flex-1">
            {/* Hero Section */}
            <section className="w-full py-16 md:py-24">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-6 text-center">
                        <span className="text-xs tracking-wide-elegant text-muted-foreground uppercase">
                            Tech Stack
                        </span>
                        <h1 className="text-4xl font-light tracking-wide-elegant sm:text-5xl text-foreground">
                            Skills
                        </h1>
                        <div className="w-16 h-px bg-border/70 my-4" />
                        <p className="max-w-[600px] text-muted-foreground text-base md:text-lg font-light tracking-elegant">
                            使用・学習中の技術スタックと経験
                        </p>
                    </div>
                </div>
            </section>
            {/* Divider */}
            <div className="w-full border-t border-border/30" />
            {/* Legend Section */}
            <section className="w-full py-8 bg-card/30">
                <div className="container px-4 md:px-6 mx-auto max-w-5xl">
                    <div className="flex flex-wrap justify-center gap-6 text-sm">
                        {Object.entries(levelLabels).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2">
                                <span>{value.icon}</span>
                                <span className="text-muted-foreground">{value.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* Divider */}
            <div className="w-full border-t border-border/30" />
            {/* Skills Section */}
            <section className="w-full py-16 md:py-20">
                <div className="container px-4 md:px-6 mx-auto max-w-5xl">
                    {categoryOrder.map((category) => (
                        <SkillCategorySection
                            key={category}
                            category={category}
                            skills={skillsByCategory[category]}
                        />
                    ))}
                </div>
            </section>
        </main>
    );
}
