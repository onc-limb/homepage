import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProfile } from '@/lib/profile';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8 text-center">
                <Avatar className="w-32 h-32 mx-auto mb-4">
                    <AvatarImage src={data.avatar} alt={data.name} />
                    <AvatarFallback>OC</AvatarFallback>
                </Avatar>
                <h1 className="text-4xl font-bold mb-2">{data.name}</h1>
                <p className="text-xl text-muted-foreground">{data.title}</p>
            </div>
            <div className="space-y-6">
                {sectionData['自己紹介'] && (
                    <Card>
                        <CardHeader>
                            <CardTitle>自己紹介</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-muted-foreground leading-relaxed prose prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {sectionData['自己紹介']}
                                </ReactMarkdown>
                            </div>
                        </CardContent>
                    </Card>
                )}
                {sectionData['関心分野'] && (
                    <Card>
                        <CardHeader>
                            <CardTitle>関心分野</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-muted-foreground prose prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {sectionData['関心分野']}
                                </ReactMarkdown>
                            </div>
                        </CardContent>
                    </Card>
                )}
                {sectionData['技術スタック'] && (
                    <Card>
                        <CardHeader>
                            <CardTitle>技術スタック</CardTitle>
                            <CardDescription>主に使用している技術</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(() => {
                                    // ### 単位でコンテンツを分割
                                    const sections = sectionData['技術スタック'].split('### ').filter((s) => s.trim());
                                    return sections.map((section, index) => {
                                        const lines = section.split('\n');
                                        const title = lines[0].trim();
                                        const content = lines.slice(1).join('\n').trim();
                                        return (
                                            <div key={index}>
                                                <h3 className="font-semibold mb-2 text-foreground">{title}</h3>
                                                <div className="prose prose-sm max-w-none dark:prose-invert">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            ul: ({ children }) => (
                                                                <ul className="space-y-1 text-muted-foreground list-none pl-0">
                                                                    {children}
                                                                </ul>
                                                            ),
                                                            li: ({ children }) => <li className="pl-0">• {children}</li>,
                                                        }}
                                                    >
                                                        {content}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                )}
                {sectionData['経歴'] && (
                    <Card>
                        <CardHeader>
                            <CardTitle>経歴</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        h3: ({ children }) => (
                                            <h3 className="font-semibold text-foreground mb-1">{children}</h3>
                                        ),
                                        p: ({ children }) => (
                                            <p className="text-muted-foreground mb-4">{children}</p>
                                        ),
                                    }}
                                >
                                    {sectionData['経歴']}
                                </ReactMarkdown>
                            </div>
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle>リンク</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <a
                                href={data.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                GitHub
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
export default Profile;
