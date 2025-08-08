# Movable Type (r) (C) 2006-2019 Six Apart Ltd. All Rights Reserved.
# This code cannot be redistributed without permission from www.sixapart.com.
# For more information, consult your Movable Type license.
#
# $Id$

package MT::Plugin::AssetUploader::L10N::ja;

use strict;
use warnings;
use utf8;

use base 'MT::Plugin::AssetUploader::L10N::en_us';
use vars qw( %Lexicon );

%Lexicon = (
    'Insert (s)'                                     => '挿入 (s)',
    'Insert'                                         => '挿入',
    'Cancel (x)'                                     => 'キャンセル',
    'Upload'                                         => 'アップロード',
    'Search'                                         => '検索',
    'View image'                                     => '表示',
    'Alternative text'                               => '代替テキスト',
    'Embed asset'                                    => 'アセットの埋め込み',
    'Settings'                                       => '設定',
    'Finish'                                         => '完了',
    'Drop files here'                                => 'ファイルをここにドロップしてください',
    'Unsupported file type'                          => 'サポートされていないファイル形式です',
    'Align'                                          => '配置',
    'Align left'                                     => '左寄せ',
    'Align center'                                   => '中央寄せ',
    'Align right'                                    => '右寄せ',
    'Align none'                                     => 'なし',
    'pixels'                                         => 'ピクセル',
    'Edit information'                               => '情報を編集',
    'Link to original image'                         => 'オリジナル画像にリンクする',
    'Creating system templates for AssetUploader...' => 'AssetUploaderで利用するシステムテンプレートを作成しています...',
    'Tags'                                           => 'タグ',
    'Options'                                        => 'オプション',
    'Upload Destination'                             => 'アップロード先',
    'Site Root'                                      => 'サイトパス',
    'Archive Root'                                   => 'アーカイブパス',
    'Custom...'                                      => 'カスタム...',
    '_USAGE_UPLOAD'                                  => 'アップロード先には、サブディレクトリを指定することが出来ます。指定されたディレクトリが存在しない場合は、作成されます。',
    'Upload Options'                                 => 'アップロードオプション',
    'Rename filename'                                => 'ファイル名の変更',
    'Rename non-ascii filename automatically'        => '日本語ファイル名を自動で変換する',
    'Operation for a file exists'                    => '既存ファイルの処理',
    'Upload and rename'                              => '既存のファイルを残して、別のファイル名でアップロードする',
    'Overwrite existing file'                        => '既存のファイルを上書きする',
    'Cancel upload'                                  => 'アップロードしない',
    'Normalize orientation'                          => '画像向きの修正',
    'Enable orientation normalization'               => '画像の向きを自動的に修正する',
);

1;
