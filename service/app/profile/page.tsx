import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProfile } from '@/lib/profile';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
const Profile = async () => {
    const profile = await getProfile();
    const { data, content } = profile;
    // Markdownコンテンツをセクションごとに分割(## レベルのみ)
    const parseSections = () => {
        const result: { [key: string]: string } = {};
        const lines = content.split('\n');
        let currentSection = '';
        let currentContent: string[] = [];
        lines.forEach((line) => {
            // ## で始まる行はセクションタイトル
            if (line.startsWith('## ')) {
                // 前のセクションを保存
                if (currentSection) {
                    result[currentSection] = currentContent.join('\n').trim();
                }
                // 新しいセクション開始
                currentSection = line.replace('## ', '').trim();
                currentContent = [];
            } else if (currentSection) {
                // セクション内のコンテンツを追加
                currentContent.push(line);
            }
        });
        // 最後のセクションを保存
        if (currentSection) {
            result[currentSection] = currentContent.join('\n').trim();
        }
        return result;
    };
    const sectionData = parseSections();
    return (
        <main className="flex-1">
            {/* Hero Section */}
            <section className="w-full py-16 md:py-24">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-6 text-center">
                        <Avatar className="w-28 h-28 border border-border/50">
                            <AvatarImage src={data.avatar} alt={data.name} />
                            <AvatarFallback className="bg-card text-foreground">OC</AvatarFallback>
                        </Avatar>
                        <div>
                            <span className="text-xs tracking-wide-elegant text-muted-foreground uppercase">
                                {data.title}
                            </span>
                            <h1 className="text-4xl font-light tracking-wide-elegant sm:text-5xl text-foreground mt-2">
                                {data.name}
                            </h1>
                        </div>
                        <div className="w-16 h-px bg-border/70 my-4" />
                    </div>
                </div>
            </section>
            {/* Divider */}
            <div className="w-full border-t border-border/30" />
            {/* Content Section */}
            <section className="w-full py-16 md:py-20">
                <div className="container px-4 md:px-6 mx-auto max-w-3xl">
                    <div className="space-y-8">
                        {sectionData['自己紹介'] && (
                            <Card className="border-border/50 bg-card/30">
                                <CardHeader>
                                    <CardTitle className="text-lg font-light tracking-elegant">
                                        自己紹介
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="leading-relaxed prose prose-sm prose-invert prose-readable max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {sectionData['自己紹介']}
                                        </ReactMarkdown>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        {sectionData['エンジニアとしての今'] && (
                            <Card className="border-border/50 bg-card/30">
                                <CardHeader>
                                    <CardTitle className="text-lg font-light tracking-elegant">
                                        エンジニアとしての今
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose prose-sm prose-invert prose-readable max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {sectionData['エンジニアとしての今']}
                                        </ReactMarkdown>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        {sectionData['経歴'] && (
                            <Card className="border-border/50 bg-card/30">
                                <CardHeader>
                                    <CardTitle className="text-lg font-light tracking-elegant">
                                        経歴
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose prose-sm max-w-none prose-invert">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                h3: ({ children }) => (
                                                    <h3 className="font-medium text-foreground mb-1 tracking-elegant">
                                                        {children}
                                                    </h3>
                                                ),
                                                p: ({ children }) => (
                                                    <p className="text-muted-foreground mb-4">
                                                        {children}
                                                    </p>
                                                ),
                                            }}
                                        >
                                            {sectionData['経歴']}
                                        </ReactMarkdown>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        {/* Skills Link Card */}
                        <Link href="/skills" className="block group">
                            <Card className="border-border/50 bg-card/30 hover:bg-card/50 hover:border-border transition-all duration-200">
                                <CardContent className="flex items-center justify-between p-6">
                                    <div>
                                        <h3 className="text-lg font-light tracking-elegant text-foreground">
                                            技術スタック
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            使用・学習中の技術スタックと経験の詳細
                                        </p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                </CardContent>
                            </Card>
                        </Link>
                        {/* Social Link Card */}
                        <Link href="/social" className="block group">
                            <Card className="border-border/50 bg-card/30 hover:bg-card/50 hover:border-border transition-all duration-200">
                                <CardContent className="flex items-center justify-between p-6">
                                    <div>
                                        <h3 className="text-lg font-light tracking-elegant text-foreground">
                                            リンク
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            GitHub, Zenn, X など各プラットフォームへのリンク
                                        </p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
};
export default Profile;
