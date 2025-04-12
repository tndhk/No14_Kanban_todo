

# ✅ カンバン形式Todoアプリ — 要件定義（最新版）

## 1. 🎯 コア機能

### 1.1 ユーザー管理（Clerk 認証）
- ユーザー登録 / ログイン / ログアウト
- 各ユーザーは自分専用のボードを作成・管理できる

### 1.2 カンバンボード機能
- **複数のボード**を作成可能（ユーザー単位）
- 各ボードには**カラム（列）**を持たせる（例: Todo, In Progress, Done）
- カラムの追加・削除・並び替えが可能
- **タスク管理**:
  - 各タスクは以下の項目を持つ  
    - タイトル  
    - 説明  
    - 期限（due date）  
    - ステータス（カラム）  
    - ラベル  
    - 担当者（オプション）  
  - タスクはドラッグ＆ドロップで別カラムに移動可能

### 1.3 ✅ **サブタスク機能**
- 各タスクに複数の**サブタスク**を紐づけられる
- サブタスクには以下の項目を持たせる
  - タイトル
  - 完了ステータス（チェックボックス）
- 将来的に：プログレスバー（例：5件中2件完了）で進捗可視化
- ネスト（入れ子）は1段階までに制限（現時点）

### 1.4 フロントエンドUI（UX重視）
- Shadcn/ui + Radix UI + Tailwind CSSを活用
- モバイル対応のレスポンシブデザイン
- タスクやカラムのドラッグ＆ドロップ
- ダイアログやモーダルの活用（Radix UI）
- アニメーション対応（tailwindcss-animate）
- ダークモード対応

### 1.5 入力・バリデーション
- Zodによる型安全なバリデーション
- Server Actionsでフォーム処理（Next.js 14 App Router）

---

## 2. 🧱 アーキテクチャ設計

### フロントエンド（Next.js 14 + App Router）
- TypeScriptを用いて型安全を確保
- ディレクトリ構成例：
  ```
  /app        - ルーティングとサーバーコンポーネント
  /components - UIコンポーネント群
  /lib        - 共通ユーティリティ
  /hooks      - カスタムフック
  ```

### バックエンド（Prisma + SQLite）
- データベース：初期はSQLite、将来的にSupabase(PostgreSQL)へ
- Prismaでモデル設計：

```ts
model Subtask {
  id        String   @id @default(uuid())
  title     String
  done      Boolean  @default(false)
  task      Task     @relation(fields: [taskId], references: [id])
  taskId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 3. 🐳 Dockerによる開発環境

- 開発はDockerをベースに実施
- ディレクトリ構成例：
  ```
  /app     - Next.js アプリ本体
  /prisma  - スキーマとマイグレーション
  /docker  - Dockerfileやcompose設定
  ```
- `docker-compose.yml` サンプル：

```yaml
version: '3.9'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    environment:
      - NODE_ENV=development
    command: npm run dev
```

---

## 4. 🧪 テストと品質管理

- コード整形：ESLint + Prettier
- ユニットテスト：Jest または Vitest
- E2Eテスト（CypressやPlaywright）は将来的に導入可

---

## 5. 🚀 デプロイ

- フロントエンド：Vercel
- 認証：Clerk
- 環境変数は`.env`で管理（開発・本番で切り替え）

---

## 6. 🛠 今後の拡張機能（Nice to Have）

- コメント機能（タスク単位のチャット）
- 通知機能（期限前リマインドなど）
- タグやラベルによるフィルター
- リアルタイム更新（SWRやWebSocket）
