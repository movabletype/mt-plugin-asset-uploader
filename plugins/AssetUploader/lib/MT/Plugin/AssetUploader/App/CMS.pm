# Movable Type (r) (C) 2006-2020 Six Apart Ltd. All Rights Reserved.
# This code cannot be redistributed without permission from www.sixapart.com.
# For more information, consult your Movable Type license.

package MT::Plugin::AssetUploader::App::CMS;

use strict;
use warnings;
use utf8;

use MT::Util qw(encode_html);
use MT::Plugin::AssetUploader qw(plugin);

sub template_param_header {
    my ($cb, $app, $param, $tmpl) = @_;
    my $plugin = plugin();
    my $js_includes = $tmpl->getElementsByName("js_include")
        or return;
    my $before = $js_includes->[0];

    my $tokens = $plugin->load_tmpl("header.tmpl")->tokens;
    foreach my $t (@$tokens) {
        $tmpl->insertBefore($t, $before);
        $before = $t;
    }

    my $t = $tmpl->createElement('Var', { name => $plugin->name . '_version', value => $plugin->version });
    $tmpl->insertAfter($t, $before);
}

1;
