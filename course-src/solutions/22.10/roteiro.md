# Project references
core exports validarId. app imports core package. Core is composite and emits declarations; app references ../core. Run tsc -b packages/app twice and edit core to observe dependent rebuild. A cyclic reference must fail.
