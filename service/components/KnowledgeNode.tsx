'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Category, SubCategory, getKnowledgeFilePath } from '@/lib/knowledge';
interface KnowledgeNodeProps {
    category: Category;
    maxPoint: number;
}
// SubCategory component to handle hooks properly
function SubCategoryNode({ 
    subcategory, 
    categoryName 
}: { 
    subcategory: SubCategory; 
    categoryName: string;
}) {
    const [subExpanded, setSubExpanded] = useState(false);
    const renderFileLink = (filename: string, categoryName: string, subcategoryName?: string) => {
        const filePath = getKnowledgeFilePath(categoryName, subcategoryName || null, filename);
        const displayName = filename.replace('.md', '');
        const encodedPath = encodeURIComponent(filePath.replace('.md', ''));
        return (
            <Link
                key={filename}
                href={`/knowledges/${encodedPath}`}
                className="block px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 rounded border-l-4 border-blue-400 transition-colors"
            >
                📄 {displayName}
            </Link>
        );
    };
    return (
        <div className="ml-4 border-l-2 border-gray-200 pl-4">
            <button
                onClick={() => setSubExpanded(!subExpanded)}
                className="flex items-center gap-2 w-full text-left p-2 bg-purple-50 hover:bg-purple-100 rounded transition-colors"
            >
                {subExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span className="font-medium">📁 {subcategory.category}</span>
                <span className="text-sm text-gray-600">({subcategory.point} points)</span>
            </button>
            {subExpanded && (
                <div className="mt-2 space-y-1">
                    {subcategory.names.map(filename => 
                        renderFileLink(filename, categoryName, subcategory.category)
                    )}
                </div>
            )}
        </div>
    );
}
export default function KnowledgeNode({ category, maxPoint }: KnowledgeNodeProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    // Calculate node size based on point value (20% to 100% of max size)
    const sizePercentage = Math.max(20, (category.point / maxPoint) * 100);
    const nodeSize = `${sizePercentage}%`;
    const handleToggle = () => {
        setIsExpanded(!isExpanded);
    };
    const renderFileLink = (filename: string, categoryName: string, subcategoryName?: string) => {
        const filePath = getKnowledgeFilePath(categoryName, subcategoryName || null, filename);
        const displayName = filename.replace('.md', '');
        const encodedPath = encodeURIComponent(filePath.replace('.md', ''));
        return (
            <Link
                key={filename}
                href={`/knowledges/${encodedPath}`}
                className="block px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 rounded border-l-4 border-blue-400 transition-colors"
            >
                📄 {displayName}
            </Link>
        );
    };
    return (
        <div className="knowledge-node">
            <Card 
                className={`transition-all duration-300 cursor-pointer hover:shadow-lg ${
                    isExpanded ? 'shadow-lg border-blue-500' : 'hover:border-gray-400'
                }`}
                style={{ width: nodeSize, minWidth: '200px' }}
            >
                <CardHeader onClick={handleToggle} className="pb-2">
                    <CardTitle className="flex items-center justify-between text-lg">
                        <span>🗂️ {category.category}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-normal bg-blue-100 px-2 py-1 rounded">
                                {category.point} points
                            </span>
                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </div>
                    </CardTitle>
                </CardHeader>
                {isExpanded && (
                    <CardContent className="pt-0">
                        <div className="space-y-3">
                            {/* Direct files in category */}
                            {category.names && category.names.length > 0 && (
                                <div className="space-y-1">
                                    {category.names.map(filename => 
                                        renderFileLink(filename, category.category)
                                    )}
                                </div>
                            )}
                            {/* Subcategories */}
                            {category.subCategories && category.subCategories.length > 0 && (
                                <div className="space-y-2">
                                    {category.subCategories.map(subcategory => (
                                        <SubCategoryNode 
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
        </div>
    );
}