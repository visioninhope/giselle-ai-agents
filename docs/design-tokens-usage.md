### Design tokens usage (必須ガイド)

このガイドは最小限の運用ルールです。新規コードは semantic 優先・生色禁止を徹底してください。

### 読み込み順
1) `internal-packages/ui/styles/tokens.css`（@theme, primitive/互換トークン）
2) `internal-packages/ui/styles/semantic.css`（semantic→primitive の初期マッピング）
3) `internal-packages/ui/styles/scopes/*.css`（必要時のみ）
4) `internal-packages/ui/styles/aliases.css`（移行期限定。最終削除）

### 推奨ユーティリティ（v4スタイル）
- テキスト: `text-text`, `text-text/70`, `text-inverse`, `text-muted`
- 背景: `bg-bg`, `bg-surface`, `bg-surface-muted`, `hover:bg-surface-hover`
- ボーダー: `border-border`, `border-border-muted`, `border-border-focused`
- フォーカス: `ring-focused`, `outline-focused`
- SVG: `fill-text`, `stroke-border`
- グラデーション: `from-brand-500`, `to-brand-700`

### 除外・許容（移行中の特例）
- ガラス表現（backdrop-blur/半透明/重ね影）は視覚差回避のため現状維持可
- 3rdパーティコンポーネントで生色が必須な場合は `tokens.css` にトークンを追加してから使用

### 移行チェックリスト（安全置換の前提）
- 生色の直書き（hex/rgba/hsla/oklch）を追加しない（既存は削減対象）
- `text-black-600/20 → text-text/20`
- `color-border-focused → ring-focused`（focus文脈）/ `border-border`（それ以外）
- `text-white-900 → text-inverse`（暗背景が明確な場合のみ）
- SVGの #000/#fff は `currentColor` + 親に `text-*` 付与、または `fill-text`/`stroke-border`

詳細な段階削除計画は `docs/plan-v3-bridge-removal.md` を参照。


