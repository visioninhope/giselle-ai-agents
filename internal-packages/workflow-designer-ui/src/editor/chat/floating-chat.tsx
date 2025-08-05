"use client";

import { useEffect, useRef } from "react";
import { ChatPanel } from "./chat-panel";

interface FloatingChatProps {
	isOpen: boolean;
	onClose: () => void;
}

export function FloatingChat({ isOpen, onClose }: FloatingChatProps) {
	const chatRef = useRef<HTMLDivElement>(null);

	// Handle click outside to close
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]);

	// Handle escape key
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 pointer-events-none">
			<div
				ref={chatRef}
				className="absolute bottom-12 right-6 pointer-events-auto"
				style={{
					animation: isOpen ? "fadeInSlideUp 0.2s ease-out" : undefined,
				}}
			>
				<div className="relative">
					{/* Chat Panel */}
					<ChatPanel />
				</div>
			</div>

			<style jsx>{`
        @keyframes fadeInSlideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
		</div>
	);
}
