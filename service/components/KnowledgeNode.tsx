'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Category, SubCategory, getKnowledgeFilePath } from '@/lib/knowledge';
interface KnowledgeNodeProps {
    category: Category;
    maxPoint: number;
    containerWidth: number;
    containerHeight: number;
    position: { x: number; y: number };
    onPositionUpdate: (categoryName: string, position: { x: number; y: number }) => void;
    isExpanded: boolean;
    onToggle: (categoryName: string) => void;
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
                className="block px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-card/50 hover:bg-accent/50 border-l border-border/50 hover:border-foreground/30 transition-all duration-200 break-words text-muted-foreground hover:text-foreground tracking-elegant"
            >
                {displayName}
            </Link>
        );
    };
    return (
        <div className="ml-2 sm:ml-4 border-l border-border/30 pl-2 sm:pl-4">
            <button
                onClick={() => setSubExpanded(!subExpanded)}
                className="flex items-center gap-1 sm:gap-2 w-full text-left p-1.5 sm:p-2 bg-card/30 hover:bg-accent/40 transition-colors duration-200"
            >
                {subExpanded ? <ChevronDown size={14} className="sm:w-4 sm:h-4 text-muted-foreground" /> : <ChevronRight size={14} className="sm:w-4 sm:h-4 text-muted-foreground" />}
                <span className="font-light text-sm sm:text-base truncate text-foreground tracking-elegant">{subcategory.category}</span>
                <span className="text-xs sm:text-sm text-muted-foreground/70 shrink-0">({subcategory.point})</span>
            </button>
            {subExpanded && (
                <div className="mt-1 sm:mt-2 space-y-1">
                    {subcategory.names.map(filename => 
                        renderFileLink(filename, categoryName, subcategory.category)
                    )}
                </div>
            )}
        </div>
    );
}
export default function KnowledgeNode({ 
    category, 
    maxPoint, 
    containerWidth, 
    containerHeight, 
    position,
    onPositionUpdate,
    isExpanded,
    onToggle
}: KnowledgeNodeProps) {
    const nodeRef = useRef<HTMLDivElement>(null);
    // Calculate node size based on point value (50px to 120px)
    const sizePercentage = Math.max(20, (category.point / maxPoint) * 100);
    const circleSize = Math.max(50, Math.min(120, (sizePercentage / 100) * 120));
    // Calculate font size based on circle size (proportional scaling)
    const fontSize = Math.max(12, Math.min(32, circleSize / 4));
    const handleToggle = () => {
        onToggle(category.category);
    };
    const renderFileLink = (filename: string, categoryName: string, subcategoryName?: string) => {
        const filePath = getKnowledgeFilePath(categoryName, subcategoryName || null, filename);
        const displayName = filename.replace('.md', '');
        const encodedPath = encodeURIComponent(filePath.replace('.md', ''));
        return (
            <Link
                key={filename}
                href={`/knowledges/${encodedPath}`}
                className="block px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-card/50 hover:bg-accent/50 border-l border-border/50 hover:border-foreground/30 transition-all duration-200 break-words text-muted-foreground hover:text-foreground tracking-elegant"
            >
                {displayName}
            </Link>
        );
    };
    return (
        <div 
            ref={nodeRef}
            className="knowledge-node absolute"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
        >
            {/* Circular Node */}
            <div
                className={`relative rounded-full border transition-all duration-300 cursor-pointer flex items-center justify-center ${
                    isExpanded 
                        ? 'bg-foreground border-foreground scale-110' 
                        : 'bg-transparent border-muted-foreground/50 hover:border-foreground/70 hover:scale-105'
                }`}
                style={{
                    width: `${circleSize}px`,
                    height: `${circleSize}px`,
                }}
                onClick={handleToggle}
            >
                <div className={`text-center ${isExpanded ? 'text-background' : 'text-foreground'}`}>
                    <div 
                        className="font-light leading-none tracking-elegant"
                        style={{ fontSize: `${fontSize}px` }}
                    >
                        {category.point}
                    </div>
                </div>
            </div>
            {/* Category name always displayed below the circle */}
            <div 
                className="absolute text-center font-light text-muted-foreground text-sm mt-2 whitespace-nowrap tracking-elegant"
                style={{
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: `${circleSize + 5}px`,
                }}
            >
                {category.category}
            </div>
            {/* Expanded Content Modal */}
            {isExpanded && (() => {
                // Calculate modal position to stay within container bounds
                const isMobile = containerWidth < 500;
                const modalWidth = isMobile 
                    ? Math.min(containerWidth - 20, 280) // モバイル: 最大280px、コンテナ幅-20px
                    : 350; // デスクトップ: 350px
                const modalHeight = isMobile ? 220 : 300;
                // Calculate horizontal position
                const margin = isMobile ? 10 : 20;
                let leftOffset = -modalWidth / 2; // Default: center
                const rightBoundary = position.x + modalWidth / 2;
                const leftBoundary = position.x - modalWidth / 2;
                if (rightBoundary > containerWidth - margin) {
                    leftOffset = -(modalWidth - (containerWidth - position.x - margin));
                } else if (leftBoundary < margin) {
                    leftOffset = -position.x + margin;
                }
                // Calculate vertical position
                let topOffset = circleSize + 35; // Default: below the node
                if (position.y + topOffset + modalHeight > containerHeight - margin) {
                    topOffset = -(modalHeight + 10); // Show above the node
                }
                return (
                    <div 
                        className={`absolute z-50 bg-card border border-border/50 ${
                            isMobile ? 'p-3' : 'p-4'
                        }`}
                        style={{
                            left: `${leftOffset}px`,
                            top: `${topOffset}px`,
                            width: `${modalWidth}px`,
                            maxHeight: `${modalHeight}px`,
                        }}
                    >
                        <div className={isMobile ? "mb-2" : "mb-3"}>
                            <h3 className={`font-light text-foreground tracking-elegant ${
                                isMobile ? "text-base" : "text-lg"
                            }`}>{category.category}</h3>
                            <span className={`text-muted-foreground/70 tracking-elegant ${
                                isMobile ? "text-xs" : "text-sm"
                            }`}>
                                {category.point} points
                            </span>
                        </div>
                        <div className={`overflow-y-auto ${
                            isMobile ? "max-h-40 space-y-2" : "max-h-48 space-y-3"
                        }`}>
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
                                <div className={isMobile ? "space-y-1.5" : "space-y-2"}>
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
                    </div>
                );
            })()}
        </div>
    );
}