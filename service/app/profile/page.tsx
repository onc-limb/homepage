import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
const Profile = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8 text-center">
                <Avatar className="w-32 h-32 mx-auto mb-4">
                    <AvatarImage src="/MainLogo.jpg" alt="onclimb" />
                    <AvatarFallback>OC</AvatarFallback>
                </Avatar>
                <h1 className="text-4xl font-bold mb-2">onclimb</h1>
                <p className="text-xl text-muted-foreground">Software Engineer</p>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>自己紹介</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                            フルスタックエンジニアとして、Webアプリケーションの設計・開発に携わっています。
                            モダンな技術スタックを活用し、ユーザー体験を重視したプロダクト開発を心がけています。
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>関心分野</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-muted-foreground">
                            <li>• モダンなWebアプリケーション開発</li>
                            <li>• レスポンシブ・アクセシブルなUI/UX設計</li>
                            <li>• RESTful API設計と実装</li>
                            <li>• クラウドインフラの構築と運用</li>
                            <li>• パフォーマンス最適化</li>
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>技術スタック</CardTitle>
                        <CardDescription>主に使用している技術</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold mb-2">フロントエンド</h3>
                                <ul className="space-y-1 text-muted-foreground">
                                    <li>• React / Next.js</li>
                                    <li>• TypeScript</li>
                                    <li>• Tailwind CSS</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">バックエンド</h3>
                                <ul className="space-y-1 text-muted-foreground">
                                    <li>• Node.js</li>
                                    <li>• Python</li>
                                    <li>• REST API / GraphQL</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">インフラ・ツール</h3>
                                <ul className="space-y-1 text-muted-foreground">
                                    <li>• AWS / Cloudflare</li>
                                    <li>• Docker</li>
                                    <li>• Git / GitHub</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">データベース</h3>
                                <ul className="space-y-1 text-muted-foreground">
                                    <li>• PostgreSQL</li>
                                    <li>• DynamoDB</li>
                                    <li>• Redis</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>リンク</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <a
                                href="https://github.com/onc-limb"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                GitHub
                            </a>
                            {/* 必要に応じて他のリンクを追加 */}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
export default Profile;
