use strict;
use warnings;

use FindBin;
use Test::More;

use lib qw(lib extlib), "$FindBin::Bin/../lib";

use_ok 'MT::Plugin::AssetUploader';
use_ok 'MT::Plugin::AssetUploader::App::CMS';

done_testing;
