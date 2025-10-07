### Compat tokens inventory (snapshot)

対象: `--color-white-900`, `--color-black-600`, `--color-black-850`, `--color-white-850`（tokens.css除外）

実行: `pnpm report:compat-tokens`

出力例（抜粋）

```
Token: --color-white-900
  ./apps/playground/app/globals.css:32:  --color-white-900: hsl(220, 60%, 98%);
  ./apps/playground/app/globals.css:139:   color: var(--color-white-900);
  ./apps/playground/app/globals.css:243:   color: var(--color-white-900);
  ./apps/studio.giselles.ai/app/globals.css:32:  --color-white-900: hsl(220, 60%, 98%);
  ./apps/studio.giselles.ai/app/globals.css:39:  --color-white: var(--color-white-900);
  ... (more)

Token: --color-black-600
  ./apps/playground/app/globals.css:15:  --color-black-600: hsl(222, 17%, 53%);
  ./apps/studio.giselles.ai/app/globals.css:15:  --color-black-600: hsl(222, 17%, 53%);

Token: --color-black-850
  ./apps/playground/app/globals.css:12:  --color-black-850: hsl(231, 62%, 6%);
  ./apps/studio.giselles.ai/app/globals.css:12:  --color-black-850: hsl(231, 62%, 6%);

Token: --color-white-850
  ./apps/playground/app/globals.css:33:  --color-white-850: hsl(0, 0%, 96%);
  ./apps/studio.giselles.ai/app/globals.css:33:  --color-white-850: hsl(0, 0%, 96%);

Compat tokens references (excluding tokens.css): 18
```

メモ
- `globals.css` 由来が中心。semantic移行後に段階削除候補。
- 次ステップ: スコープ/semanticへ寄せ、互換トークン参照を0にする計画に反映。


