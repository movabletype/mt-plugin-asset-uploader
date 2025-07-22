#!/usr/bin/perl

use strict;
use warnings;
use FindBin;
use lib "$FindBin::Bin/../../../../lib";    # t/lib
use Test::More;
use MT::Test::Env;
use Test::MockModule;
BEGIN {
    eval { require Test::MockModule }
        or plan skip_all => 'Test::MockModule is not installed';
}

our $test_env;

BEGIN {
    $test_env = MT::Test::Env->new;
    $ENV{MT_CONFIG} = $test_env->config_file;
}

use MT;
use MT::Test;
use MT::Test::Permission;
use MT::Test::App;

$test_env->prepare_fixture('db');

my $admin = MT::Author->load(1);
my $blog  = MT::Blog->load(1);
my $app   = MT::Test::App->new;
$app->login($admin);

subtest 'asset_uploader_site_status' => sub {
    subtest 'blog scope' => sub {
        subtest 'no error' => sub {
            $app->js_get_ok({ __mode => 'asset_uploader_site_status' });

            my $result = $app->json;
            ok !defined $result->{error};
            ok defined $result->{result}{message};
            is $result->{result}{message}, '';
        };

        subtest 'has an error in the site configuration' => sub {
            my $mock = Test::MockModule->new('MT::Blog');
            $mock->mock('site_path', sub { undef });

            $app->js_get_ok({
                __mode  => 'asset_uploader_site_status',
                blog_id => $blog->id,
            });

            my $result = $app->json;
            ok !defined $result->{error};
            ok defined $result->{result}{message};
            like $result->{result}{message}, qr/blog_id=@{[$blog->id]}/;
            isnt $result->{result}{message}, '';
        };

        subtest 'with system error' => sub {
            my $mock = Test::MockModule->new('MT');
            $mock->mock('build_page_in_mem', sub {
                my ($app) = @_;
                $app->error('Thumbnail directory check failed');
            });

            $app->js_get_ok({
                __mode => 'asset_uploader_site_status',
                blog_id => $blog->id,
            });

            my $result = $app->json;
            ok defined $result->{error};
            like $result->{error}, qr/Thumbnail directory check failed/;
        };
    };

    subtest 'system scope' => sub {
        $app->js_get_ok({ __mode => 'asset_uploader_site_status' });

        my $result = $app->json;
        ok !defined $result->{error};
        ok defined $result->{result}{message};
        is $result->{result}{message}, '';
    };
};

done_testing;
