# Movable Type (r) (C) 2006-2020 Six Apart Ltd. All Rights Reserved.
# This code cannot be redistributed without permission from www.sixapart.com.
# For more information, consult your Movable Type license.

package MT::Plugin::AssetUploader::App::CMS;

use strict;
use warnings;
use utf8;

use MT::Util                  qw(encode_html);
use MT::Plugin::AssetUploader qw(plugin);
use JSON;

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

    if (my $blog = $app->blog) {
        my $blog_id = $tmpl->createElement('Var', { name => $plugin->name . '_blog_id', value => $blog->id });
        $tmpl->insertAfter($blog_id, $before);
        require JSON;
        my $options = $tmpl->createElement(
            'Var', {
                name  => $plugin->name . '_options',
                value => {
                    imageDefaultThumb => $blog->image_default_thumb ? JSON::true() : JSON::false(),
                    imageDefaultWidth => $blog->image_default_width + 0,
                    imageDefaultAlign => $blog->image_default_align,
                    imageDefaultPopup => $blog->image_default_popup
                } });
        $tmpl->insertAfter($options, $before);
    }
}

sub as_html {
    my $app = shift;

    $app->validate_param({
        blog_id         => [qw/ID/],
        id              => [qw/ID/],
        include         => [qw/FLAG/],
        enclose         => [qw/FLAG/],
        alternativeText => [qw/MAYBE_STRING/],
        caption         => [qw/MAYBE_TEXT/],
        width           => [qw/MAYBE_NUMBER/],
        linkToOriginal  => [qw/MAYBE_FLAG/],
        align           => [qw/MAYBE_STRING/],
    }) or return;

    my $perms = $app->permissions
        or return $app->errtrans('No permissions');
    return $app->errtrans('No permissions')
        unless $perms->can_do('insert_asset');

    my $blog_id = $app->blog->id;

    my $asset = MT->model('asset')->load(scalar $app->param('id'));
    return $app->errtrans('Invalid request.')
        unless $asset && $asset->blog_id == $blog_id && $asset->class eq 'image';

    # TBD: backward compatible
    # $asset->on_upload();

    my %param = ();

    $param{include} = $app->param('include') || 0;
    $param{enclose} = $app->param('enclose') || 0;

    if (!$param{include}) {
        return $app->json_result({
            html => $asset->as_html(\%param),
        });
    }

    my $width            = $app->param('width');
    my $alternative_text = $app->param('alternativeText');
    my $caption          = $app->param('caption');
    my $link_to_original = $app->param('linkToOriginal');
    my $align            = $app->param('align');

    my ($thumbnail_url, $thumbnail_width, $thumbnail_height);
    if ($width && $width < $asset->image_width) {
        ($thumbnail_url, $thumbnail_width, $thumbnail_height) = $asset->thumbnail_url(Width => $width);
    } else {
        $thumbnail_url    = $asset->url;
        $thumbnail_width  = $asset->image_width;
        $thumbnail_height = $asset->image_height;
    }

    my $old_lang = MT->current_language;
    MT->set_language('en');
    my $asset_type = lc $asset->class_label;
    MT->set_language($old_lang);

    my $tmpl = MT->model('template')->load({
        blog_id => $blog_id,
        type    => 'asset_uploader_embed_asset',
    });
    $tmpl = plugin()->load_tmpl('asset_uploader_embed_asset.tmpl') unless $tmpl && $tmpl->text ne '';
    my $ctx = $tmpl->context;
    $ctx->stash('asset', $asset);
    my $html = $tmpl->output({
        alternative_text => $alternative_text,
        caption          => $caption,
        width            => $width,
        link_to_original => $link_to_original,
        align            => $align,
        insert_options   => JSON->new->utf8->encode({
            alternativeText => $alternative_text,
            caption         => $caption,
            width           => $width,
            linkToOriginal  => $link_to_original,
            align           => $align,
        }),
        asset_id               => $asset->id,
        asset_url              => $asset->url,
        asset_type             => $asset_type,
        asset_width            => $asset->image_width,
        asset_height           => $asset->image_height,
        asset_thumbnail_url    => $thumbnail_url,
        asset_thumbnail_width  => $thumbnail_width,
        asset_thumbnail_height => $thumbnail_height,
    });

    return $app->error($tmpl->errstr)
        unless defined $html;

    return $app->json_result({
        html                 => $html,
        alternativeText      => $alternative_text,
        caption              => $caption,
        width                => $width,
        linkToOriginal       => $link_to_original,
        align                => $align,
        assetId              => $asset->id,
        assetUrl             => $asset->url,
        assetWidth           => $asset->image_width,
        assetHeight          => $asset->image_height,
        assetThumbnailUrl    => $thumbnail_url,
        assetThumbnailWidth  => $thumbnail_width,
        assetThumbnailHeight => $thumbnail_height,
    });
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
