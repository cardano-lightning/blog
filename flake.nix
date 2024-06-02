{
  description = "Cardano Lightning Network blog";

  inputs = {
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    pre-commit-hooks-nix.url = "github:hercules-ci/pre-commit-hooks.nix/flakeModule";
    pre-commit-hooks-nix.inputs.nixpkgs.follows = "nixpkgs";
    treefmt-nix.url = "github:numtide/treefmt-nix";
  };

  outputs = inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; }
      {
        imports = [
          inputs.pre-commit-hooks-nix.flakeModule
          inputs.treefmt-nix.flakeModule
        ];
        systems = [ "x86_64-linux" "aarch64-darwin" ];
        perSystem = { config, self', inputs', pkgs, ... }: {
          treefmt = {
            projectRootFile = "flake.nix";
            flakeFormatter = true;
            programs = {
              prettier = {
                enable = true;
              };
            };
          };

          devShells.default =
          pkgs.mkShell {
            nativeBuildInputs = [
              config.treefmt.build.wrapper
            ]
            ;
            shellHook = ''
              echo 1>&2 "Welcome to the development shell!"
            '';
            name = "carano-lightning-network-blog";
            packages = with pkgs; [
              nodejs
              pkgs.nodePackages.pnpm
              pkgs.html-tidy
              pkgs.nodePackages.typescript
              pkgs.nodePackages.typescript-language-server
            ];
          };
        };
        flake = { };
      };
}
