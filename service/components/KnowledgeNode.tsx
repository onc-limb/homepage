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
                className="block px-3 py-2 text-sm bg-neutral-50 hover:bg-neutral-100 rounded border-l-4 border-neutral-400 transition-colors"
            >
                📄 {displayName}
            </Link>
        );
    };
    return (
        <div className="ml-4 border-l-2 border-neutral-200 pl-4">
            <button
                onClick={() => setSubExpanded(!subExpanded)}
                className="flex items-center gap-2 w-full text-left p-2 bg-neutral-50 hover:bg-neutral-100 rounded transition-colors"
            >
                {subExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span className="font-medium">📁 {subcategory.category}</span>
                <span className="text-sm text-neutral-600">({subcategory.point} points)</span>
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
                className="block px-3 py-2 text-sm bg-neutral-50 hover:bg-neutral-100 rounded border-l-4 border-neutral-400 transition-colors"
            >
                📄 {displayName}
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
                className={`relative rounded-full border-3 transition-all duration-300 cursor-pointer flex items-center justify-center shadow-lg ${
                    isExpanded 
                        ? 'bg-red-800 border-red-900 shadow-2xl scale-110' 
                        : 'bg-gradient-to-br from-neutral-500 to-neutral-700 border-neutral-600 hover:shadow-xl hover:scale-105'
                }`}
                style={{
                    width: `${circleSize}px`,
                    height: `${circleSize}px`,
                }}
                onClick={handleToggle}
            >
                <div className="text-center text-white">
                    <div 
                        className="font-bold leading-none"
                        style={{ fontSize: `${fontSize}px` }}
                    >
                        {category.point}
                    </div>
                </div>
            </div>

            {/* Category name always displayed below the circle */}
            <div 
                className="absolute text-center font-semibold text-neutral-700 text-sm mt-2 whitespace-nowrap"
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
                const modalWidth = 350;
                const modalHeight = 300;
                
                // Calculate horizontal position
                let leftOffset = -modalWidth / 2; // Default: center
                const rightBoundary = position.x + modalWidth / 2;
                const leftBoundary = position.x - modalWidth / 2;
                
                if (rightBoundary > containerWidth - 20) {
                    leftOffset = -(modalWidth - (containerWidth - position.x - 20));
                } else if (leftBoundary < 20) {
                    leftOffset = -position.x + 20;
                }
                
                // Calculate vertical position
                let topOffset = circleSize + 35; // Default: below the node
                if (position.y + topOffset + modalHeight > containerHeight - 20) {
                    topOffset = -(modalHeight + 10); // Show above the node
                }
                
                return (
                    <div 
                        className="absolute z-50 bg-white rounded-lg shadow-2xl border border-neutral-300 p-4"
                        style={{
                            left: `${leftOffset}px`,
                            top: `${topOffset}px`,
                            width: `${modalWidth}px`,
                            maxHeight: `${modalHeight}px`,
                        }}
                    >
                        <div className="mb-3">
                            <h3 className="font-bold text-lg text-neutral-800">{category.category}</h3>
                            <span className="text-sm text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                                {category.point} points
                            </span>
                        </div>
                        
                        <div className="max-h-48 overflow-y-auto space-y-3">
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
                    </div>
                );
            })()}
        </div>
    );
}