'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Folder, File } from 'lucide-react';
import { getKnowledges, getKnowledgeFilePath, Category, SubCategory } from '@/lib/knowledge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
interface SubCategoryItemProps {
    subcategory: SubCategory;
    categoryName: string;
}
function SubCategoryItem({ subcategory, categoryName }: SubCategoryItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div className="ml-4 sm:ml-6 border-l-2 border-neutral-200 pl-3 sm:pl-4 mt-2">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 w-full text-left p-2 sm:p-3 bg-neutral-50 hover:bg-neutral-100 rounded-md transition-colors group"
            >
                {isExpanded ? (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600 shrink-0" />
                ) : (
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600 shrink-0" />
                )}
                <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
                <span className="font-medium text-sm sm:text-base text-neutral-700 flex-1 truncate">
                    {subcategory.category}
                </span>
                <span className="text-xs sm:text-sm text-neutral-500 bg-neutral-200 px-2 py-1 rounded-full shrink-0">
                    {subcategory.point} pt
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
                                className="flex items-center gap-2 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-neutral-700 bg-white hover:bg-neutral-50 rounded border-l-4 border-blue-400 transition-colors group"
                            >
                                <File className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
                                <span className="flex-1 break-words group-hover:text-blue-600">
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
                className={`${hasContent ? 'cursor-pointer' : ''} hover:bg-neutral-50 transition-colors`}
                onClick={() => hasContent && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    {hasContent && (
                        <div className="shrink-0">
                            {isExpanded ? (
                                <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-600" />
                            ) : (
                                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-600" />
                            )}
                        </div>
                    )}
                    <Folder className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 shrink-0" />
                    <CardTitle className="text-lg sm:text-xl flex-1 truncate">
                        {category.category}
                    </CardTitle>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm sm:text-base text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full font-medium">
                            {category.point} pt
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
                                            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-neutral-700 bg-neutral-50 hover:bg-neutral-100 rounded-md border-l-4 border-emerald-400 transition-colors group"
                                        >
                                            <File className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
                                            <span className="flex-1 break-words group-hover:text-emerald-600">
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
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
                    <p className="mt-4 text-neutral-600">Loading...</p>
                </div>
            </div>
        );
    }
    if (!metadata) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <p className="text-neutral-600">データの取得に失敗しました</p>
                </div>
            </div>
        );
    }
    return (
        <div className="w-full mt-8 sm:mt-12">
            <div className="mb-6 sm:mb-8 p-4 bg-neutral-100 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-neutral-600">
                    <span className="font-medium">
                        📚 総ファイル数: <span className="text-neutral-900">{metadata.totalFiles}</span>
                    </span>
                    <span className="font-medium">
                        🕒 最終更新:{' '}
                        <span className="text-neutral-900">
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
