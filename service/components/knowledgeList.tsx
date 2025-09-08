import { getKnowledges } from '@/lib/knowledge';
import KnowledgeNode from './KnowledgeNode';
export default async function KnowledgeList() {
    const metadata = await getKnowledges();
    // Find the maximum point value for sizing
    const maxPoint = Math.max(...metadata.categories.map(cat => cat.point));
    return (
        <div className="mt-12">
            <div className="mb-6 text-center">
                <p className="text-sm text-muted-foreground">
                    総ファイル数: {metadata.totalFiles} | 
                    最終更新: {new Date(metadata.lastUpdated).toLocaleDateString('ja-JP')}
                </p>
            </div>
            <div className="grid gap-6 justify-items-center" style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
            }}>
                {metadata.categories.map((category) => (
                    <KnowledgeNode
                        key={category.category}
                        category={category}
                        maxPoint={maxPoint}
                    />
                ))}
            </div>
        </div>
    );
}
