use ExtUtils::MakeMaker;
use YAML;

my $config  = YAML::LoadFile((glob('./plugins/*/config.yaml'))[0]);
my $version = $config->{version};

use Getopt::Long 'GetOptions';
GetOptions('version=s' => \$version);

WriteMakefile(
    NAME     => $config->{name},
    VERSION  => $version,
    SKIP     => [qw(distdir)],
    DISTNAME => $config->{name},
);

sub MY::top_targets {
    << 'Makefile';
npm-install:
	for d in movabletype AssetUploader; do \
		( cd mt-static/plugins/$$d && npm ci ); \
	done

npm-build:
	for d in movabletype AssetUploader; do \
		( cd mt-static/plugins/$$d && npm run build ); \
	done

build-js: npm-install npm-build

build: build-js

create_distdir:
	$(RM_RF) $(DISTVNAME)
	$(PERLRUN) "-MExtUtils::Manifest=manicopy,maniread" \
		-e "manicopy(maniread(),'$(DISTVNAME)', '$(DIST_CP)');"

distdir: create_distdir build
	$(NOECHO) $(NOOP)

manifest : build

Makefile
}
