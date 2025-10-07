### Design tokens and scopes (developer guide)

このガイドは、色のデザイントークン導入とスコープ運用の最小ルールです。既存画面に視覚差を出さない範囲で徐々に置換してください。

### Layers and files

- tokens: `internal-packages/ui/styles/tokens.css`
  - Tailwind v4 の `@theme` で primitive（gray/brand/status 等）と一時的な互換トークン（white-900 など）を定義
- semantic: `internal-packages/ui/styles/semantic.css`
  - semantic（text/bg/border/focused 等）→ primitive の初期マッピング（ライト想定）
- aliases (bridge): `internal-packages/ui/styles/aliases.css`
  - v3互換・移行期限定の薄いユーティリティ。最終的に削除予定
- scopes: `internal-packages/ui/styles/scopes/*.css`
  - `:root[data-scope="stage"|"settings-apps"|"workspaces"]` 単位の上書き（必要時のみ）

読み込み順（例）
1) tokens → 2) semantic → 3) scopes（必要時）→ 4) aliases

### What to use (v4スタイルの命名)

- テキスト: `text-text`, `text-text/70`, `text-inverse`, `text-muted`
- 背景/サーフェス: `bg-bg`, `bg-surface`, `bg-surface-muted`
- ボーダー: `border-border`, `border-border-muted`, `border-border-focused`
- フォーカス: `ring-focused`, `outline-focused`
- SVG: `fill-text`, `stroke-border`
- グラデーション: `from-brand-500`, `to-brand-700`

不透明度は `/20` `/40` `/60` `/70` `/80` を優先（透明度は color-mix 相当で表現）。

### Scopes

- ルート要素に `data-scope="stage"` 等を付与し、`scopes/*.css` で semantic を上書き可能
- 例: `:root[data-scope="stage"] { --color-brand-500: ...; --color-text: ...; }`

### Migration policy

- 置換は「壊さない」ことを最優先（ガラス領域は除外）
- まずは安全置換から（例）
  - `text-black-600/20 → text-text/20`
  - `color-border-focused → ring-focused`（focus文脈）/ `border-border`（それ以外）
  - `text-white-900 → text-inverse`（暗背景が明確な場合のみ）
- 互換ユーティリティと互換トークンは段階削除：新規追加は禁止、既存は減らす

### Lint/CI

- 生色（hex/rgba/hsla/oklch）の直書き禁止（`tokens.css` を除外）
- Tailwind 直指定スケール（`text-white-900` 等）は段階的に撲滅
- CI はレポートを非ブロッキングで実行（増加failは今後導入）

### Codemods (safe-pass)

- ドライラン: `pnpm codemod:safe-pass-1`
- 適用: `pnpm codemod:safe-pass-1:apply`
- 範囲は安全置換の最小セットのみ。曖昧な箇所はスキップしてレポートへ

### Notes

- v3環境では橋渡しユーティリティで新命名を前倒し利用可。v4移行後は `@theme` 基盤で自然に解決
- 最終的に `aliases.css` と互換トークンは削除し、primitive + semantic + scopes に集約


