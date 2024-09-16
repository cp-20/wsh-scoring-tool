# Web Speed Hackathon 用のスコアリングツール

## 使い方

### 1. 環境変数の準備

次の環境変数を決めます

- `SECRET_KEY`
  - 何でもよいが、実質パスワードなのでランダムな長い文字列が良いと思う
  - スコア計測の CI からサーバーにアクセスするときの認証に使う
- `API_URI_BASE`
  - リーダーボードのバックエンドのURL
  - 最後に `/` を含まない形
  - スコア計測の CI からサーバーにアクセスするときに使う
- `DATABASE_URL`
  - リーダーボードのバックエンドが使う DB の connection string
  - MySQL (互換) のデータベースを用意してください

### 2. リーダーボードをデプロイ

`Dockerfile` を用意しているのでそれを使うのが楽だと思います。

フロントエンドは Vue で書かれているので、ビルドしてください。

バックエンドは Bun で書かれているので、Bun の環境を整えた上で `bun start` してください。そのときに `SECRET_KEY` 環境変数を設定するのを忘れないようにしてください。

### 3. CI の準備

CI で使う用に環境変数 / シークレットを準備します。

最初に準備した環境変数をリポジトリに設定します。

- Variables
  - `API_URI_BASE`
- Secrets
  - `SECRET_KEY`

## 構成

- `@wsh-scoring-tool/core` スコア計測を行うコア部分
- `@wsh-scoring-tool/lb-frontend` リーダーボードのフロントエンド
- `@wsh-scoring-tool/lb-server` リーダーボードのバックエンド
- `@wsh-scoring-tool/scoring-runner` CI上でスコア計測を行うスクリプト

## ライセンス

- `packages/core/src/assets/**` [CyberAgentHack/web-speed-hackathon-2024](https://github.com/CyberAgentHack/web-speed-hackathon-2024) のMPL-2.0ライセンスが適用されます
