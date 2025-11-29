'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getKnowledges, getKnowledgeFilePath, Category, SubCategory } from '@/lib/knowledge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
interface SubCategoryItemProps {
    subcategory: SubCategory;
    categoryName: string;
}
function SubCategoryItem({ subcategory, categoryName }: SubCategoryItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div className="ml-4 sm:ml-6 border-l border-border/30 pl-3 sm:pl-4 mt-2">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 w-full text-left p-2 sm:p-3 bg-card/30 hover:bg-accent/40 transition-colors duration-200 group"
            >
                {isExpanded ? (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
                ) : (
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
                )}
                <span className="font-light text-sm sm:text-base text-foreground flex-1 truncate tracking-elegant">
                    {subcategory.category}
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground/70 shrink-0 tracking-elegant">
                    {subcategory.point}
                </span>
            </button>
            {isExpanded && (
                <div className="mt-2 space-y-1 sm:space-y-2">
                    {subcategory.names.map((filename) => {
                        const filePath = getKnowledgeFilePath(
                            categoryName,
                            subcategory.category,
                            filename,
                        );
                        const displayName = filename.replace('.md', '');
                        const encodedPath = encodeURIComponent(filePath.replace('.md', ''));
                        return (
                            <Link
                                key={filename}
                                href={`/knowledges/${encodedPath}`}
                                className="flex items-center gap-2 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-muted-foreground bg-card/50 hover:bg-accent/50 border-l border-border/50 hover:border-foreground/30 transition-all duration-200 group tracking-elegant"
                            >
                                <span className="flex-1 break-words group-hover:text-foreground">
                                    {displayName}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
interface CategoryItemProps {
    category: Category;
}
function CategoryItem({ category }: CategoryItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasContent =
        (category.names && category.names.length > 0) ||
        (category.subCategories && category.subCategories.length > 0);
    return (
        <Card className="overflow-hidden">
            <CardHeader
                className={`${hasContent ? 'cursor-pointer' : ''} hover:bg-accent/30 transition-colors duration-200`}
                onClick={() => hasContent && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    {hasContent && (
                        <div className="shrink-0">
                            {isExpanded ? (
                                <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                            )}
                        </div>
                    )}
                    <CardTitle className="text-lg sm:text-xl flex-1 truncate font-light tracking-elegant">
                        {category.category}
                    </CardTitle>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm sm:text-base text-muted-foreground tracking-elegant">
                            {category.point}
                        </span>
                    </div>
                </div>
            </CardHeader>
            {isExpanded && hasContent && (
                <CardContent className="pt-0 pb-4">
                    <div className="space-y-3 sm:space-y-4">
                        {/* Direct files in category */}
                        {category.names && category.names.length > 0 && (
                            <div className="space-y-1 sm:space-y-2">
                                {category.names.map((filename) => {
                                    const filePath = getKnowledgeFilePath(
                                        category.category,
                                        null,
                                        filename,
                                    );
                                    const displayName = filename.replace('.md', '');
                                    const encodedPath = encodeURIComponent(
                                        filePath.replace('.md', ''),
                                    );
                                    return (
                                        <Link
                                            key={filename}
                                            href={`/knowledges/${encodedPath}`}
                                            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-muted-foreground bg-card/50 hover:bg-accent/50 border-l border-border/50 hover:border-foreground/30 transition-all duration-200 group tracking-elegant"
                                        >
                                            <span className="flex-1 break-words group-hover:text-foreground">
                                                {displayName}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                        {/* Subcategories */}
                        {category.subCategories && category.subCategories.length > 0 && (
                            <div className="space-y-2 sm:space-y-3">
                                {category.subCategories.map((subcategory) => (
                                    <SubCategoryItem
                                        key={subcategory.category}
                                        subcategory={subcategory}
                                        categoryName={category.category}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
export default function KnowledgeHierarchy() {
    const [metadata, setMetadata] = useState<{
        categories: Category[];
        totalFiles: number;
        lastUpdated: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getKnowledges();
                setMetadata(data);
            } catch (error) {
                console.error('Failed to load knowledge metadata:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b border-foreground"></div>
                    <p className="mt-4 text-muted-foreground tracking-elegant">Loading...</p>
                </div>
            </div>
        );
    }
    if (!metadata) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <p className="text-muted-foreground tracking-elegant">データの取得に失敗しました</p>
                </div>
            </div>
        );
    }
    return (
        <div className="w-full mt-8 sm:mt-12">
            <div className="mb-6 sm:mb-8 p-4 border border-border/30 bg-card/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground tracking-elegant">
                    <span>
                        Total Files: <span className="text-foreground">{metadata.totalFiles}</span>
                    </span>
                    <span>
                        Updated:{' '}
                        <span className="text-foreground">
                            {new Date(metadata.lastUpdated).toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </span>
                    </span>
                </div>
            </div>
            <div className="space-y-4 sm:space-y-6">
                {metadata.categories.map((category) => (
                    <CategoryItem key={category.category} category={category} />
                ))}
            </div>
        </div>
    );
}
