# build_for_antora

## Using codespaces for OKD on Antora

- Create a codespace on main branch of https://github.com/gabriel-rh/build_for_antora
- Wait for extensions, packages to be installed (less than a minute)
- cd /workspaces
- git clone --depth=1 https://github.com/openshift/openshift-docs
- cd /workspaces/build_for_antora/scripts
- node ./build_for_antora.js
- cp /workspaces/build_for_antora/antora-template/antora-playbook.yml /workspaces/okd-antora/
- cp /workspaces/build_for_antora/antora-template/docs/antora.yml /workspaces/okd-antora/docs/
- cd /workspaces/okd-antora/
- antora antora-playbook.yml
  - git init
  - git add .
  - git commit -m "init"
  - antora antora-playbook.yml
- http-server -c-1 build/site/

## Local builds for OKD on Antora

- git clone https://github.com/gabriel-rh/build_for_antora
- cd build_for_antora
- edit the ./scripts/env.local file with your config 
  - set input location for openshift docs
  - set output location for antora content
  - set distro, product title and version
- edit the ./scripts/build_for_antora.js to use your env.local instead of env.codespace
  ```
  var myEnv = dotenv.config({path: ".env.local"}) // use env.local for local builds - fix for your own setup
  ```
- Install node, antora, http-server
- npm i
- update and copy the 2 template files from antora-template to your output directory
- build with antora in your output directory - must git init, etc first
- run http server to view files locally (or just view from file system)
