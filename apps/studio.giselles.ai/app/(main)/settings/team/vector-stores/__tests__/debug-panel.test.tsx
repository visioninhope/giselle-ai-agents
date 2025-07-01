import { fireEvent, render, screen } from "@testing-library/react";
import { DebugPanel } from "../debug-panel";

// Mock window.location
const mockLocation = {
	href: "http://localhost:3000/settings/team/vector-stores",
	search: "",
	pathname: "/settings/team/vector-stores",
};

Object.defineProperty(window, "location", {
	value: mockLocation,
	writable: true,
});

// Mock window.location.href assignment
(window as Window & typeof globalThis).location = undefined as never;
window.location = { ...mockLocation } as Location;

describe("DebugPanel", () => {
	beforeEach(() => {
		// Reset NODE_ENV to development for tests
		process.env.NODE_ENV = "development";

		// Reset location mock
		window.location.href = "http://localhost:3000/settings/team/vector-stores";
		window.location.search = "";
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("should render debug panel in development mode", () => {
		render(<DebugPanel currentState="unauthorized" />);

		expect(screen.getByText(/Debug Panel \(Dev Only\)/)).toBeInTheDocument();
	});

	it("should not render debug panel in production mode", () => {
		process.env.NODE_ENV = "production";

		render(<DebugPanel currentState="unauthorized" />);

		expect(
			screen.queryByText(/Debug Panel \(Dev Only\)/),
		).not.toBeInTheDocument();
	});

	it("should display current state and repository count", () => {
		render(<DebugPanel currentState="connected" repositoryCount={5} />);

		fireEvent.click(screen.getByText(/Debug Panel \(Dev Only\)/));

		expect(
			screen.getByText("Current: connected (5 repos)"),
		).toBeInTheDocument();
	});

	it("should display current state without repository count when not provided", () => {
		render(<DebugPanel currentState="unauthorized" />);

		fireEvent.click(screen.getByText(/Debug Panel \(Dev Only\)/));

		expect(screen.getByText("Current: unauthorized")).toBeInTheDocument();
	});

	it("should show/hide debug controls when clicked", () => {
		render(<DebugPanel currentState="connected" />);

		const toggleButton = screen.getByText(/Debug Panel \(Dev Only\)/);

		// Initially hidden
		expect(
			screen.queryByText("🔒 GitHub Auth Required"),
		).not.toBeInTheDocument();

		// Click to show
		fireEvent.click(toggleButton);
		expect(screen.getByText("🔒 GitHub Auth Required")).toBeInTheDocument();

		// Click to hide
		fireEvent.click(toggleButton);
		expect(
			screen.queryByText("🔒 GitHub Auth Required"),
		).not.toBeInTheDocument();
	});

	it("should have all debug state buttons", () => {
		render(<DebugPanel currentState="connected" />);

		fireEvent.click(screen.getByText(/Debug Panel \(Dev Only\)/));

		expect(screen.getByText("🔒 GitHub Auth Required")).toBeInTheDocument();
		expect(screen.getByText("❌ GitHub Error")).toBeInTheDocument();
		expect(screen.getByText("📱 No GitHub App")).toBeInTheDocument();
		expect(screen.getByText("✅ Connected (Empty)")).toBeInTheDocument();
		expect(screen.getByText("📚 Multiple Repos")).toBeInTheDocument();
		expect(screen.getByText("🔄 Reset to Real State")).toBeInTheDocument();
	});

	it("should highlight active state button", () => {
		render(<DebugPanel currentState="error" />);

		fireEvent.click(screen.getByText(/Debug Panel \(Dev Only\)/));

		const errorButton = screen.getByText("❌ GitHub Error");
		expect(errorButton).toHaveClass("bg-red-600", "text-white");

		const connectedButton = screen.getByText("✅ Connected (Empty)");
		expect(connectedButton).toHaveClass("bg-gray-600", "text-gray-300");
	});

	it("should update URL when state button is clicked", () => {
		const mockHref = jest.fn();
		Object.defineProperty(window.location, "href", {
			set: mockHref,
			configurable: true,
		});

		render(<DebugPanel currentState="connected" />);

		fireEvent.click(screen.getByText(/Debug Panel \(Dev Only\)/));
		fireEvent.click(screen.getByText("🔒 GitHub Auth Required"));

		expect(mockHref).toHaveBeenCalledWith(
			"http://localhost:3000/settings/team/vector-stores?debug=unauthorized",
		);
	});

	it("should remove debug param when clicking same state", () => {
		window.location.search = "?debug=unauthorized";
		const mockHref = jest.fn();
		Object.defineProperty(window.location, "href", {
			set: mockHref,
			configurable: true,
		});

		render(<DebugPanel currentState="unauthorized" />);

		fireEvent.click(screen.getByText(/Debug Panel \(Dev Only\)/));
		fireEvent.click(screen.getByText("🔒 GitHub Auth Required"));

		expect(mockHref).toHaveBeenCalledWith(
			"http://localhost:3000/settings/team/vector-stores",
		);
	});

	it("should reset to real state when reset button is clicked", () => {
		window.location.search = "?debug=multiple-repos";
		const mockHref = jest.fn();
		Object.defineProperty(window.location, "href", {
			set: mockHref,
			configurable: true,
		});

		render(<DebugPanel currentState="multiple-repos" />);

		fireEvent.click(screen.getByText(/Debug Panel \(Dev Only\)/));
		fireEvent.click(screen.getByText("🔄 Reset to Real State"));

		expect(mockHref).toHaveBeenCalledWith(
			"http://localhost:3000/settings/team/vector-stores",
		);
	});

	it("should display help text", () => {
		render(<DebugPanel currentState="connected" />);

		fireEvent.click(screen.getByText(/Debug Panel \(Dev Only\)/));

		expect(
			screen.getByText(/💡 Click a state to simulate it/),
		).toBeInTheDocument();
		expect(
			screen.getByText(/This panel only appears in development/),
		).toBeInTheDocument();
	});
});
