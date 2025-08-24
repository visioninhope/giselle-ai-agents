This folder contains the NavigationRail component.

The NavigationRail component is implemented based on Material Design 3's Navigation Rail, customized to fit the use cases of this project.

### Summary of Navigation Rail in  Material Design 3

- Purpose: provides access to primary destinations on mid-sized devices (tablet/desktop) and lets people switch between app views.
- Types: two variants — Collapsed navigation rail (original) and Expanded navigation rail (M3 Expressive). Expanded replaces the navigation drawer and can transition to collapsed.
- Anatomy: container; optional menu; optional FAB/Extended FAB; item icon; active indicator; label text; optional large/small badges. These elements apply to both collapsed and expanded rails.
- M3 Expressive: expanded and collapsed rails match visually and can transition into each other; expanded is non-modal and behaves like a drawer replacement.
- Key properties (Android reference):
  - Container: background tint (surface), elevation 0dp, fitsSystemWindows, optional top/bottom inset padding, optional top content margin, optional scrolling.
  - Header: custom header layout and bottom margin.
  - Menu: gravity (default top/center), optional submenu dividers (visible when expanded).
  - Items: menu resource, ripple colors, label visibility mode, min heights for collapsed/expanded, spacing, item gravity.
  - Active indicator: color (secondary container), width/height, rounded shape, horizontal margin, label padding.
- Color: active label color uses the secondary color in M3.
- Sizing: default collapsed container width is 80dp; expanded is wider to accommodate labels and content.
- References: design spec at m3.material.io and Android API reference at developer.android.com.

### Component structure

- `navigation-rail.tsx`: stateful wrapper that toggles between collapsed/expanded variants.
  - Props: `user: Promise<UserDataForNavigationRail>` (consumed via Suspense in children).
  - Manages `NavigationRailState` with `useState("expanded")` and animates width using `motion.div` and `AnimatePresence`.
- `navigation-rail-expanded.tsx` and `navigation-rail-collapsed.tsx`: presentational variants.
  - Shared sections: `NavigationRailHeader`, `NavigationRailContentsContainer` with `NavigationList`/`NavigationListItem`, and `NavigationRailFooter` with `NavigationRailFooterMenu`.
  - Header: shows app icon/label and a `MenuButton` to toggle state (open/close icons via `lucide-react`).
- `navigation-items.ts`: declarative list of nav destinations.
  - Shape: `{ id, type: "link", icon, label, href, isActive? }`.
  - Icons: from `lucide-react` or internal icon set.
- `navigation-list*.tsx`: lightweight wrappers for list and list items.
  - `NavigationListItem` renders a `Link` with icon and, when expanded, the label.
- `navigation-rail-*-container.tsx`: layout primitives for rail, header, contents, and footer.
  - `NavigationRailContainer` applies `w-navigation-rail-collapsed|expanded` and transitions.
- `navigation-rail-footer-menu.tsx`: account menu in the footer.
  - Uses `DropdownMenu` and `AvatarImage`; handles internal/external links and a special "Log out" action via `SignOutButton`.
- `types.ts`: `NavigationRailState` and `UserDataForNavigationRail` definitions.

### How to change that?

- Add a new navigation item
  - Edit `navigation-items.ts` and append a new object:
    - `{ id: "reports-link", type: "link", icon: BarChart3Icon, label: "Reports", href: "/stage/reports", isActive: (p) => p.startsWith("/stage/reports") }`.
  - Import the icon from `lucide-react` or your icon library.
  - If you need non-link behaviors, extend `NavigationListItem` to support more `type`s.

- Change labels, icons, or routes
  - Update the corresponding fields in `navigation-items.ts`.
  - If you use `isActive`, ensure the predicate still matches the new route.

- Show active state styling
  - Option A: compute the current pathname in `NavigationListItem` and apply styles when `navigationItem.isActive?.(pathname)` is true.
  - Option B: pass the active pathname down from the page/layout and style in `NavigationListItem` accordingly.

- Adjust default collapsed/expanded state
  - In `navigation-rail.tsx`, change `useState<NavigationRailState>("expanded")` to `"collapsed"`.
  - The toggle buttons already call `setState("collapsed"|"expanded")`.

- Customize widths or transition
  - Update CSS tokens `--spacing-navigation-rail-collapsed` and `--spacing-navigation-rail-expanded` to change the animated widths.
  - The Tailwind utilities `w-navigation-rail-collapsed|expanded` should map to those tokens; update your design tokens/Tailwind config if needed.
  - Motion: tweak `initial/animate/exit` props in `navigation-rail.tsx` or container class names for timing via `transition-*` utilities.

- Change header content
  - Expanded header shows the product icon and the text label "Stage". Edit `navigation-rail-expanded.tsx` to adjust branding/content.
  - Collapsed header shows only the toggle button; update icons or hover behavior in `navigation-rail-collapsed.tsx` and `menu-button.tsx`.

- Modify footer/account menu
  - Edit the `items` array in `navigation-rail-footer-menu.tsx`.
  - For external links, set `external: true` to render an `<a target="_blank" rel="noopener">`.
  - The special `{ value: "log-out" }` item renders `SignOutButton` in `renderItem`.

- Change user loading behavior
  - Caution: This change affects the overall page experience (loading behavior and Suspense boundaries). Make changes carefully. If you have not already aligned on this with a software engineer, consult one before proceeding.
  - The rail receives `user` as a Promise and uses React Suspense (`use(userPromise)`).
  - If you prefer resolved data, change props to `user: UserDataForNavigationRail` and remove Suspense/`use()` in the footer menu.

- Make it visible on small screens
  - The rail is currently `hidden` below `md`. To support mobile, remove `hidden md:block` and consider overlay/drawer patterns instead of a fixed rail.

- Theming and tokens
  - Colors and spacing rely on design tokens (e.g., `text-text-muted`, `ghost-element-hover`). Adjust tokens/utilities to propagate visual changes consistently
