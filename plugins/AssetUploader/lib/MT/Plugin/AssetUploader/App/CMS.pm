# Movable Type (r) (C) 2006-2020 Six Apart Ltd. All Rights Reserved.
# This code cannot be redistributed without permission from www.sixapart.com.
# For more information, consult your Movable Type license.

package MT::Plugin::AssetUploader::App::CMS;

use strict;
use warnings;
use utf8;

use File::Spec;
use JSON;

use MT::Util                  qw(encode_html trim);
use MT::Plugin::AssetUploader qw(plugin);

sub template_param_header {
    my ($cb, $app, $param, $tmpl) = @_;
    my $plugin = plugin();

    my $html_head = $tmpl->getElementsByName("html_head")
        or return;
    my $html_head_before = $html_head->[0];

    my $app_dist_tokens = $plugin->load_tmpl("app_dist.tmpl")->tokens;
    foreach my $t (@$app_dist_tokens) {
        $tmpl->insertBefore($t, $html_head_before);
        $html_head_before = $t;
    }

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
        my $insert_options = $tmpl->createElement(
            'Var', {
                name  => $plugin->name . '_insert_options',
                value => {
                    imageDefaultThumb => $blog->image_default_thumb ? JSON::true() : JSON::false(),
                    imageDefaultWidth => ($blog->image_default_width || 0) + 0,
                    imageDefaultAlign => ($blog->image_default_align || 'none'),
                    imageDefaultPopup => $blog->image_default_popup ? JSON::true() : JSON::false(),
                } });
        $tmpl->insertAfter($insert_options, $before);

        my $upload_options = $tmpl->createElement(
            'Var', {
                name  => $plugin->name . '_upload_options',
                value => {
                    destination          => ($blog->upload_destination                 || '%s'),
                    extraPath            => ($blog->extra_path                         || ''),
                    allowToChange        => (!defined $blog->allow_to_change_at_upload || $blog->allow_to_change_at_upload) ? JSON::true() : JSON::false(),
                    operationIfExists    => ($blog->operation_if_exists                || 1) + 0,
                    normalizeOrientation => (!defined $blog->normalize_orientation     || $blog->normalize_orientation) ? JSON::true() : JSON::false(),
                    autoRenameNonAscii   => (!defined $blog->auto_rename_non_ascii     || $blog->auto_rename_non_ascii) ? JSON::true() : JSON::false(),
                    userBasename         => $app->user->basename,
                    dirSeparator         => MT::Util::dir_separator,
                } });
        $tmpl->insertAfter($upload_options, $before);
    }
}

sub template_param_edit_content_data {
    my ($cb, $app, $param, $tmpl) = @_;
    for my $field (@{ $param->{fields} }) {
        next unless ($field->{asset_type_for_field} || '') eq 'image';
        if ($field->{options}{allow_upload}) {
            # FIXME: adding data attribute to "multiple" is not the original usage
            $field->{multiple} ||= '';
            $field->{multiple} .= ' data-mt-asset-uploader-allow-upload="1"';
        }
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
        type    => 'asset_uploader_asset',
    });
    $tmpl = MT->model('template')->new(
        type   => 'filename',
        path   => [plugin()->path],
        source => File::Spec->catdir('default_templates', 'asset_uploader_asset.mtml'),
    ) unless $tmpl && $tmpl->text ne '';
    my $ctx = $tmpl->context;
    $ctx->stash('asset', $asset);
    my $html = $tmpl->output({
        alternative_text => $alternative_text,
        caption          => $caption,
        width            => $width,
        link_to_original => $link_to_original,
        align            => $align,
        insert_options   => JSON->new->encode({
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

sub _build_status_message {
    my $app = shift;

    my $blog  = $app->blog;
    my %param = (
        blog_id => $blog ? $blog->id : 0,
    );
    require MT::CMS::Asset;
    MT::CMS::Asset::_check_thumbnail_dir($app, \%param);
    my $message = $app->build_page_in_mem($app->load_tmpl('include/alert_asset_upload.tmpl', \%param))
        or return;

    trim($message);
}

sub site_status {
    my $app = shift;

    my $message = '';
    if ($app->blog) {
        defined($message = _build_status_message($app))
            or return;
    }

    return $app->json_result({
        message => $message,
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

sub list_props_tags_bulk_html {
    my $prop       = shift;
    my ($objs)     = @_;
    my @obj_ids    = map { $_->id } @$objs;
    my @objecttags = MT->model('objecttag')->load({
        object_datasource => 'asset',
        object_id         => \@obj_ids,
    });
    my %object_id_map = ();
    my %tag_map       = ();
    for my $objecttag (@objecttags) {
        $object_id_map{ $objecttag->object_id } ||= [];
        push @{ $object_id_map{ $objecttag->object_id } }, $objecttag->tag_id;
        $tag_map{ $objecttag->tag_id } = 1;
    }
    %tag_map = map { $_->id => $_->name } MT->model('tag')->load({
        id => [keys %tag_map],
    });

    return map {
        join(
            ',',
            map { $tag_map{$_} } @{ $object_id_map{$_} })
    } @obj_ids;
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
