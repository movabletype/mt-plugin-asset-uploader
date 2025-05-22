package MT::Plugin::AssetUploader::App::Upgrade;

use MT::Util;
use MT::Plugin::AssetUploader qw(plugin);

sub create_default_templates {
    my $self = shift;

    $self->progress(MT::Util::escape_unicode(plugin()->translate('Creating system templates for AssetUploader...')));

    my %tmpls;
    require MT::DefaultTemplates;
    MT::DefaultTemplates->fill_with_missing_system_templates(\%tmpls);
    my $tmpl      = $tmpls{'asset_uploader_asset:asset_uploader_asset'};
    my @blog_ids  = map { $_->id } MT->model('site')->load({ class => '*' }, { fetchonly => ['id'] });
    my @templates = MT->model('template')->load({ type => ['asset_uploader_asset'] }, { fetchonly => ['blog_id'] });
    my %map       = map { $_->blog_id => 1 } @templates;

    require MT::Template;
    for my $blog_id (@blog_ids) {
        next if $map{$blog_id};
        my $obj = MT::Template->new(
            blog_id       => $blog_id,
            build_dynamic => 0,
        );
        for my $col (keys %$tmpl) {
            $obj->column($col, $tmpl->{$col}) if $obj->has_column($col);
        }
        $obj->save;
    }
}

1;
