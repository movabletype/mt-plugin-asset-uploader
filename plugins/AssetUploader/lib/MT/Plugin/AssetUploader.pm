# Movable Type (r) (C) 2006-2020 Six Apart Ltd. All Rights Reserved.
# This code cannot be redistributed without permission from www.sixapart.com.
# For more information, consult your Movable Type license.
#
# $Id$

package MT::Plugin::AssetUploader;

use strict;
use warnings;

our @EXPORT_OK = qw(plugin translate);
use base qw(Exporter);

sub component {
    __PACKAGE__ =~ m/::([^:]+)\z/;
}

sub translate {
    MT->component(component())->translate(@_);
}

sub plugin {
    MT->component(component());
}

1;
