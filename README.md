# AssetUploader

### 構成

以下のように分かれています。

* mt-static/plugins/movabletype : `MT.import` などのライブラリ
* mt-static/plugins/AssetUploader : 今回のモーダルウィンドウの実装用

### ビルド

プロジェクトのトップで以下のコマンドを実行すると、全てのJSのファイルがビルドされます。

```
$ perl Makefile.PL && make build
```

パッケージの作成まで行う場合には、 `make manifest dist` を実行します。

```
$ perl Makefile.PL && make manifest dist
```

### 開発時の監視しながらのビルド

それぞれのディレクトリに入り、以下のコマンドでファイルの変更を監視しながらビルドできます。
```
$ cd mt-static/plugins/movabletype # または mt-static/plugins/AssetUploader
$ npm run build -- --watch
```

AssetUploader の方は、movabletype に依存しているの movabletype の方の開発をしない場合にも、clone後に一度は movabletype をビルドする必要があります。
