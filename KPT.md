# KPT 振り返り / Retrospective

## Keep (良かったこと、継続したいこと / What went well / Things to continue)

- **段階的な進行 / Phased Progress**  
  `@todo.md` を活用し、フェーズごとにタスクを定義・消化していく進め方は、全体像を把握しやすく効果的でした。  
  Using `@todo.md` to define and work through tasks by phase was effective in maintaining a clear grasp of the overall progress.

- **対話による問題解決 / Collaborative Problem Solving**  
  エラー発生時に、ログの共有や状況説明を通じて、協力して原因究明と解決策の模索ができました。  
  We successfully identified and resolved issues through discussion, log sharing, and contextual explanations.

- **ツールの活用 / Effective Use of Tools**  
  ファイル編集、読み取り、ディレクトリリスト表示などのツールを駆使し、効率的に開発を進めることができました。  
  Leveraged tools for file editing, reading, and directory listing to streamline the development process.

- **具体的なコード編集 / Concrete Code Edits**  
  `edit_file` ツールで具体的なコード変更案を提示し、迅速な修正が可能でした。  
  The `edit_file` tool enabled quick and clear code changes, leading to rapid fixes.

- **UI/UX改善提案 / UI/UX Improvement Proposals**  
  レスポンシブ対応やフォーム配置の見直しなど、機能実装だけでなく、使いやすさ向上のための提案ができました。  
  Suggested improvements such as responsive design and better form layout, enhancing usability beyond just functionality.

---

## Problem (問題点、課題 / Issues and challenges)

- **特定エラーの解決 / Error Resolution for Specific Cases**:
  - **フォームネスト / Form Nesting**  
    HTMLの基本的な制約であるフォームのネストエラーの特定と解決に複数回の試行が必要でした。コンポーネント構造の初期設計段階での考慮が不足していました。  
    Identifying and resolving nesting errors in HTML forms (a fundamental limitation) took several attempts, due to a lack of foresight in component structure design.
  
  - **型エラー (dueDate) / Type Errors (dueDate)**  
    Zod/Prismaにおける `null` や日付文字列の扱いでエラーが発生し、解決に時間がかかりました。入力値の前処理やバリデーションスキーマの定義をより慎重に行う必要がありました。  
    Errors with `null` or date strings in Zod/Prisma took time to resolve. Needed more careful input preprocessing and validation schema design.

  - **params エラー / Params Error**  
    Next.jsサーバーコンポーネントでの `params` の扱いでエラーが発生しました。フレームワーク固有の挙動に対する理解とデバッグが課題でした。  
    Encountered errors in handling `params` within Next.js server components, highlighting the need for better understanding of framework-specific behavior.

- **デバッグ効率 / Debugging Efficiency**  
  エラー発生時、原因特定のために追加したログが必ずしも的確でなく、問題箇所に到達するまでに複数回のログ追加が必要な場合がありました。より広範囲かつ効果的なログ戦略が必要でした。  
  Log additions weren't always precise, leading to multiple attempts before identifying the problem. A broader and more strategic logging approach is needed.

- **ツールのパラメータ誤り / Tool Parameter Errors**  
  `read_file` ツールのパラメータ指定で誤りがあり、一時的に進行が滞りました。  
  Incorrect parameters for the `read_file` tool caused temporary workflow blocks.

- **ライブラリ知識 / Library Knowledge Gaps**  
  `PopoverClose` のような、実際には存在しないコンポーネントを提案してしまい、Linterエラーを誘発しました。ライブラリAPIの正確な知識が不足していました。  
  Proposed a nonexistent component (`PopoverClose`), which triggered Linter errors. This stemmed from incomplete knowledge of the library APIs.

---

## Try (今後試したいこと、改善策 / Improvements and future actions)

- **エラーハンドリング強化 / Strengthen Error Handling**  
  エラー発生時は、メッセージだけでなく、関連コード、変数、呼び出しスタックを含む詳細なコンテキストをログ出力し、原因特定を迅速化する。  
  When an error occurs, log not just the message but also relevant code, variables, and call stack to quickly identify the root cause.

- **コンポーネント設計の意識 / Component Design Awareness**  
  フォームネストのような基本的なHTML/Reactの制約を常に念頭に置き、コンポーネント設計を行う。  
  Always keep HTML/React constraints like form nesting in mind during design.

- **堅牢な型処理 / Robust Type Handling**  
  Zod/Prisma等の型関連エラーには、入力値の検証と前処理（`preprocess`）を早期に、より堅牢に実装する。  
  Implement early and reliable input validation and preprocessing (e.g., `preprocess` in Zod) to handle type errors in tools like Prisma.

- **フレームワーク理解の深化 / Deepen Framework Understanding**  
  フレームワーク固有のエラー（例: Next.js `params`）については、公式ドキュメントや既知の問題をより積極的に参照する。  
  Proactively consult documentation and known issues for framework-specific challenges (e.g., `params` in Next.js).

- **コンポーネント構成の改善 / Improve Component Architecture**  
  特に `Dialog` や `Popover` 内でフォームを使用する場合、ネストや状態管理に注意して設計する。  
  Especially for `Dialog` or `Popover`, carefully manage nesting and state handling when embedding forms.

- **UI/UXの早期統合 / Early UI/UX Integration**  
  タスク定義段階から、レスポンシブ対応や要素配置などのUI/UX要件を具体的に考慮に入れる。  
  Incorporate responsive design and layout requirements from the task definition stage.

- **ライブラリ/ツール習熟 / Master Libraries/Tools**  
  使用するライブラリのAPIやツールのパラメータについて、より正確な知識を維持・活用する。Linterエラーを未然に防ぐ。  
  Maintain accurate and up-to-date knowledge of the APIs and parameters for libraries and tools to avoid Linter errors.

- **振り返りの継続活用 / Continue Retrospectives**  
  KPTのような振り返りを開発サイクルに組み込み、継続的にプロセスを改善する。  
  Regularly incorporate KPT retrospectives into the development cycle for continuous process improvement.








# AI ペアプログラミング指示書 (汎用テンプレート)

## 1. プロジェクト概要と目標

*   **プロジェクト名:** [プロジェクト名を入力]
*   **主な目標:** [達成したい主要なゴールを入力。例: CRUD機能を持つブログシステムの開発]
*   **技術スタック:** [主要な技術要素をリストアップ。例: Next.js, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Shadcn UI]
*   **参照すべきルール/ドキュメント:** [開発ルールファイル(.mdc)、デザインガイドライン、API仕様書などのパスを記載]

## 2. 開発タスクリスト (例: @todo.md 形式)

*   [ ] [優先度] [タスク1: 具体的な内容...]
    *   [ ] [サブタスク1.1]
*   [ ] [優先度] [タスク2: 具体的な内容...]
*   (必要に応じて、UI/UXに関する具体的な要件（レスポンシブ対応など）もタスクに含める)

## 3. 開発プロセスにおける指示

### A. 基本方針
*   **タスクリスト準拠:** 上記タスクリストに基づき、優先度を考慮しながら段階的に開発を進めてください。
*   **ルール/ドキュメント遵守:** **指定されたルールとドキュメントを必ず参照・遵守**してください。参照したファイル名は発言してください。
*   **コード品質:**
    *   読みやすく、保守性の高いコードを記述してください (適切な命名、コメントなど)。
    *   **重複実装を避け**、共通化可能な処理は積極的に共通化してください。
    *   **HTML/Reactの基本原則 (フォームネスト等) を遵守**してください。
*   **UI/UX:**
    *   **実装初期段階からレスポンシブデザインとアクセシビリティを考慮**してください。
    *   コンポーネントの配置やインタラクションについて、使いやすさを意識した設計・提案を行ってください。
*   **ツール活用:** 利用可能なツール (`edit_file`, `read_file`, `list_dir`, `grep_search` 等) を適切に活用してください。

### B. エラー発生時の対応
*   **詳細な情報収集:** エラーメッセージ、**関連するコード箇所**、**実行時の変数の値**、**関数の呼び出しスタック**などを具体的にログ出力し、原因究明に必要な情報を収集してください。
*   **原因分析と仮説検証:** ログやエラー内容から考えられる原因を複数提示し、可能性の高い順に検証してください。
*   **段階的修正:** 一度に多くの変更を加えず、特定した原因に対して修正を行い、動作確認を繰り返してください。
*   **ライブラリ/フレームワーク固有の問題:**
    *   **公式ドキュメント/既知の問題を調査**してください (特にNext.js, Zod, Prisma, Shadcn UIなど)。
    *   **型エラー**に対しては、入力値の検証、**Zodの`preprocess`**、型ガードなどを検討してください。
    *   **API/コンポーネントの正確な使用法**を確認し、Linterエラーを回避してください。

### C. コミュニケーション
*   **進捗報告:** 各タスクや主要なステップの完了後、簡潔に進捗を報告してください。
*   **確認と提案:** 不明点や判断が必要な場合は**必ず確認**してください。改善提案（コード、UI/UX、プロセス等）は積極的に行ってください。
*   **問題報告:** 解決が困難なエラーや予期せぬ問題が発生した場合、試したことと現在の状況を詳細に報告してください。

---

**具体的な最初の指示:**

[ここに最初の具体的な開発指示を入力。例: 「@todo.md の [タスク名] を開始します。まず、[ファイル名] に必要なデータ取得ロジックを実装してください。」]