"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { TeamCard } from "./team-card";

interface CarouselItem {
	id: string;
	name: string;
	profileImageUrl?: string;
}

interface CircularCarouselProps {
	items: CarouselItem[];
	selectedId?: string;
	onItemSelect?: (item: CarouselItem) => void;
}

export function CircularCarousel({
	items,
	selectedId: _selectedId,
	onItemSelect,
}: CircularCarouselProps) {
	const [currentIndex, setCurrentIndex] = useState(
		Math.floor(items.length / 2),
	);
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	// Drag state
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState(0);
	const [dragOffset, setDragOffset] = useState(0);

	// Carousel settings
	const visibleCards = Math.min(7, items.length); // Show up to 7 cards when available
	const radius = 400;
	const centerX = 0;
	const centerY = 500;

	// Get visible cards around current index
	const getVisibleCards = () => {
		const cards = [];
		const halfVisible = Math.floor(visibleCards / 2);

		for (let i = -halfVisible; i <= halfVisible; i++) {
			const index = currentIndex + i;
			if (index >= 0 && index < items.length) {
				cards.push({
					item: items[index],
					originalIndex: index,
					positionIndex: i,
				});
			}
		}
		return cards;
	};

	// Calculate card position on semicircle
	const getCardPosition = (positionIndex: number) => {
		const isCenter = positionIndex === 0;

		// Semicircle angle calculation - tighter arc to bring cards closer
		const totalAngle = visibleCards > 5 ? Math.PI * 0.6 : Math.PI * 0.5; // Wider arc for more spacing between cards
		const angleStep = totalAngle / (visibleCards - 1);
		const angle = Math.PI / 2 + angleStep * positionIndex;

		// Add drag offset
		const dragAngle = isDragging ? dragOffset * 0.008 : 0;
		const finalAngle = angle + dragAngle;

		// Position on semicircle - adjust Y so card bottom follows the arc
		const x = centerX + radius * Math.cos(finalAngle);
		const y = centerY - radius * Math.sin(finalAngle) - 144; // Offset by card height so bottom edge aligns with arc

		// Rotate card to tilt outward from center
		const cardRotation = -(finalAngle - Math.PI / 2) * (180 / Math.PI);

		// Visual effects - edge cards more visible but smaller
		const distanceFromCenter = Math.abs(positionIndex);
		const isEdgeCard = Math.abs(positionIndex) >= Math.floor(visibleCards / 2);
		const opacity = isEdgeCard
			? Math.max(0.4, 1 - distanceFromCenter * 0.2)
			: Math.max(0.6, 1 - distanceFromCenter * 0.15);
		const scale = 1.0; // All cards same size
		const zIndex = isCenter ? 50 : Math.max(1, 30 - distanceFromCenter * 5);

		return {
			x,
			y,
			rotation: cardRotation,
			scale,
			opacity,
			zIndex,
			isCenter,
		};
	};

	// Navigation functions
	const moveLeft = () => {
		if (currentIndex > 0) {
			setCurrentIndex(currentIndex - 1);
			setSelectedIndex(null);
		}
	};

	const moveRight = () => {
		if (currentIndex < items.length - 1) {
			setCurrentIndex(currentIndex + 1);
			setSelectedIndex(null);
		}
	};

	// Handle card click
	const handleCardClick = (originalIndex: number, isCenter: boolean) => {
		if (isCenter) {
			// Toggle selection for center card
			setSelectedIndex(selectedIndex === originalIndex ? null : originalIndex);
			if (onItemSelect) {
				onItemSelect(items[originalIndex]);
			}
		} else {
			// Move clicked card to center
			setCurrentIndex(originalIndex);
			setSelectedIndex(null);
		}
	};

	// Drag handlers
	const handleDragStart = (clientX: number) => {
		setIsDragging(true);
		setDragStart(clientX);
		setDragOffset(0);
	};

	const handleDragMove = (clientX: number) => {
		if (!isDragging) return;
		const distance = clientX - dragStart;
		setDragOffset(distance);
	};

	const handleDragEnd = () => {
		if (!isDragging) return;

		const threshold = 50;
		if (Math.abs(dragOffset) > threshold) {
			if (dragOffset > 0) {
				moveLeft();
			} else {
				moveRight();
			}
		}

		setIsDragging(false);
		setDragStart(0);
		setDragOffset(0);
	};

	// Mouse events
	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		handleDragStart(e.clientX);
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		handleDragMove(e.clientX);
	};

	// Touch events
	const handleTouchStart = (e: React.TouchEvent) => {
		handleDragStart(e.touches[0].clientX);
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		handleDragMove(e.touches[0].clientX);
	};

	const visibleCardsList = getVisibleCards();
	const centerCard = visibleCardsList.find((card) => card.positionIndex === 0);

	return (
		<div
			className="relative w-full overflow-hidden"
			style={{ height: "250px" }}
		>
			{/* Carousel container */}
			<div
				className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleDragEnd}
				onMouseLeave={handleDragEnd}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleDragEnd}
				style={{
					userSelect: "none",
					WebkitUserSelect: "none",
				}}
			>
				{visibleCardsList.map(({ item, originalIndex, positionIndex }) => {
					const position = getCardPosition(positionIndex);

					return (
						<div
							key={`${item.id}-${originalIndex}`}
							className="absolute cursor-pointer select-none"
							style={{
								transform: `
                  translate(${position.x}px, ${position.y}px)
                  rotate(${position.rotation}deg)
                  scale(${position.scale})
                `,
								zIndex: position.zIndex,
								opacity: position.opacity,
								transition: isDragging
									? "none"
									: "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease",
							}}
							onClick={() => handleCardClick(originalIndex, position.isCenter)}
						>
							<div
								className={
									position.isCenter
										? "ring-2 ring-blue-400 ring-offset-2 ring-offset-transparent shadow-xl shadow-blue-500/60 relative"
										: "relative"
								}
								style={{
									filter: position.isCenter
										? "drop-shadow(0 0 12px rgba(59, 130, 246, 0.7))"
										: "none",
								}}
							>
								<TeamCard
									team={{
										id: item.id,
										name: item.name,
										profileImageUrl: item.profileImageUrl,
									}}
								/>

								{/* Center card highlight */}
								{position.isCenter && (
									<div className="absolute inset-0 rounded-lg bg-blue-400/5 pointer-events-none" />
								)}

								{/* Selected card pulse effect */}
								{selectedIndex === originalIndex && position.isCenter && (
									<div className="absolute inset-0 rounded-lg bg-green-400/10 pointer-events-none animate-pulse" />
								)}
							</div>
						</div>
					);
				})}
			</div>

			{/* Left arrow */}
			<button
				type="button"
				onClick={moveRight}
				disabled={currentIndex === items.length - 1}
				className="absolute left-6 top-1/3 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed z-50"
			>
				<ChevronLeft size={20} />
			</button>

			{/* Right arrow */}
			<button
				type="button"
				onClick={moveLeft}
				disabled={currentIndex === 0}
				className="absolute right-6 top-1/3 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed z-50"
			>
				<ChevronRight size={20} />
			</button>

			{/* INSERT label (only when center card is selected) */}
			{centerCard && selectedIndex === centerCard.originalIndex && (
				<div
					className="absolute left-1/2 transform -translate-x-1/2 text-center z-60"
					style={{ top: "75%" }}
				>
					<div className="text-gray-300 text-sm font-medium mb-1 tracking-wide">
						INSERT
					</div>
					<div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent border-t-gray-300 mx-auto"></div>
				</div>
			)}

			{/* Bottom slot */}
			<div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
				<div className="w-32 h-3 bg-blue-900/40 rounded-full border border-blue-600/40 shadow-inner"></div>
			</div>
		</div>
	);
}
