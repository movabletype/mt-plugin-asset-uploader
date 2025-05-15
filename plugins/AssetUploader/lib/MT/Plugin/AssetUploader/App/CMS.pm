# Movable Type (r) (C) 2006-2020 Six Apart Ltd. All Rights Reserved.
# This code cannot be redistributed without permission from www.sixapart.com.
# For more information, consult your Movable Type license.

package MT::Plugin::AssetUploader::App::CMS;

use strict;
use warnings;
use utf8;

use MT::Util                  qw(encode_html);
use MT::Plugin::AssetUploader qw(plugin);

sub template_param_header {
    my ($cb, $app, $param, $tmpl) = @_;
    my $plugin      = plugin();
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

sub as_html {
    my $app = shift;

    $app->validate_param({
        blog_id => [qw/ID/],
        id      => [qw/ID/],
        include => [qw/FLAG/],
        enclose => [qw/FLAG/],
    }) or return;

    my $perms = $app->permissions
        or return $app->errtrans('No permissions');
    return $app->errtrans('No permissions')
        unless $perms->can_do('insert_asset');

    my $asset = MT->model('asset')->load(scalar $app->param('id'));
    return $app->errtrans('Invalid request.')
        unless $asset && $asset->blog_id == $app->blog->id;

    # TODO: TO BE IMPLEMENTED
    # $asset->on_upload();
    my %param = ();

    $param{include} = $app->param('include') || 0;
    $param{enclose} = $app->param('enclose') || 0;

    $asset->as_html(\%param);
}

sub list_props_blog_id_html {
    my $prop = shift;
    my ($obj) = @_;
    $obj->blog_id;
}

sub list_props_label_html {
    my $prop = shift;
    my ($obj) = @_;
    $obj->label;
}

sub list_props_description_html {
    my $prop = shift;
    my ($obj) = @_;
    $obj->description;
}

sub list_props_url_html {
    my $prop = shift;
    my ($obj) = @_;
    $obj->url;
}

sub list_props_thumbnail_url_html {
    my $prop = shift;
    my ($obj) = @_;
    ($obj->maybe_dynamic_thumbnail_url(Height => 240, Width => 240, Square => 1, Ts => 1))[0];
}

1;
