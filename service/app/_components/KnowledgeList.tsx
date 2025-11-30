'use client';
import { useState, useEffect } from 'react';
import { getKnowledges } from '@/lib/knowledge';
import KnowledgeNode from './KnowledgeNode';
import { Category } from '@/lib/knowledge';
interface NodePosition {
    x: number;
    y: number;
    width: number;
    height: number;
    categoryName: string;
}
// Collision detection function
function checkCollision(pos1: NodePosition, pos2: NodePosition, margin = 20): boolean {
    return (
        pos1.x < pos2.x + pos2.width + margin &&
        pos1.x + pos1.width + margin > pos2.x &&
        pos1.y < pos2.y + pos2.height + margin &&
        pos1.y + pos1.height + margin > pos2.y
    );
}
// Generate non-overlapping positions
function generatePositions(categories: Category[], containerWidth: number, containerHeight: number, maxPoint: number): Record<string, { x: number; y: number }> {
    const positions: Record<string, { x: number; y: number }> = {};
    const placedNodes: NodePosition[] = [];
    // Sort categories by point value (larger first for better placement)
    const sortedCategories = [...categories].sort((a, b) => b.point - a.point);
    for (const category of sortedCategories) {
        const sizePercentage = Math.max(20, (category.point / maxPoint) * 100);
        const circleSize = Math.max(50, Math.min(120, (sizePercentage / 100) * 120));
        // Add space for external text (category name is always shown below)
        const categoryNameLength = category.category.length;
        const nodeHeight = circleSize + 30; // Always add space for text below
        const nodeWidth = Math.max(circleSize, categoryNameLength * 8); // Ensure width covers text
        let attempts = 0;
        let position: { x: number; y: number } | null = null;
        // Try to find a non-overlapping position
        while (attempts < 100 && !position) {
            const seed = category.category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + attempts;
            const x = (seed * 17) % (containerWidth - nodeWidth - 20) + 10;
            const y = (seed * 31) % (containerHeight - nodeHeight - 20) + 10;
            const newNode: NodePosition = {
                x,
                y,
                width: nodeWidth,
                height: nodeHeight,
                categoryName: category.category
            };
            // Check for collisions with existing nodes
            const hasCollision = placedNodes.some(placedNode => checkCollision(newNode, placedNode));
            if (!hasCollision) {
                position = { x, y };
                placedNodes.push(newNode);
            }
            attempts++;
        }
        // If we couldn't find a non-overlapping position, place it anyway (fallback)
        if (!position) {
            const seed = category.category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            position = {
                x: (seed * 17) % (containerWidth - nodeWidth - 20) + 10,
                y: (seed * 31) % (containerHeight - nodeHeight - 20) + 10
            };
        }
        positions[category.category] = position;
    }
    return positions;
}
export default function KnowledgeList() {
    const [metadata, setMetadata] = useState<any>(null);
    const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
    const [expandedNode, setExpandedNode] = useState<string | null>(null); // Track which node is expanded
    const [containerDimensions, setContainerDimensions] = useState({ width: 1000, height: 700 });
    // レスポンシブなコンテナサイズを計算
    useEffect(() => {
        const updateDimensions = () => {
            const viewportWidth = window.innerWidth;
            const isMobile = viewportWidth < 768;
            const containerWidth = isMobile
                ? Math.min(viewportWidth - 32, 400) // モバイル: ビューポート幅-32px、最大400px
                : Math.min(viewportWidth - 100, 1000); // デスクトップ: ビューポート幅-100px、最大1000px
            const containerHeight = isMobile ? 500 : 700;
            setContainerDimensions({ width: containerWidth, height: containerHeight });
        };
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);
    useEffect(() => {
        const loadData = async () => {
            const data = await getKnowledges();
            setMetadata(data);
            // Generate positions after data is loaded
            const maxPoint = Math.max(...data.categories.map((cat: Category) => cat.point));
            const newPositions = generatePositions(data.categories, containerDimensions.width, containerDimensions.height, maxPoint);
            setPositions(newPositions);
        };
        loadData();
    }, [containerDimensions]);
    const handlePositionUpdate = (categoryName: string, position: { x: number; y: number }) => {
        setPositions(prev => ({
            ...prev,
            [categoryName]: position
        }));
    };
    const handleNodeToggle = (categoryName: string) => {
        setExpandedNode(prev => prev === categoryName ? null : categoryName);
    };
    if (!metadata) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground tracking-elegant">Loading...</div>
            </div>
        );
    }
    const maxPoint = Math.max(...metadata.categories.map((cat: Category) => cat.point));
    return (
        <div className="mt-12">
            <div className="mb-6 text-center">
                <p className="text-xs text-muted-foreground/70 tracking-elegant">
                    Total Files: {metadata.totalFiles} |
                    Updated: {new Date(metadata.lastUpdated).toLocaleDateString('ja-JP')}
                </p>
            </div>
            <div
                className="relative mx-auto border border-border/30 bg-card/20 overflow-hidden"
                style={{
                    width: `${containerDimensions.width}px`,
                    height: `${containerDimensions.height}px`,
                }}
            >
                {metadata.categories.map((category: Category) => (
                    <KnowledgeNode
                        key={category.category}
                        category={category}
                        maxPoint={maxPoint}
                        containerWidth={containerDimensions.width}
                        containerHeight={containerDimensions.height}
                        position={positions[category.category] || { x: 0, y: 0 }}
                        onPositionUpdate={handlePositionUpdate}
                        isExpanded={expandedNode === category.category}
                        onToggle={handleNodeToggle}
                    />
                ))}
            </div>
        </div>
    );
}
