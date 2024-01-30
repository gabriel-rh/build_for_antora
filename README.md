# build_for_antora

## Using codespaces for OKD on Antora

- Create a codespace on main
- cd /workspaces
- git clone --depth=1 https://github.com/openshift/openshift-docs
- cd /workspaces/build_for_antora/scripts
- node ./build_for_antora.js
- cp /workspaces/build_for_antora/antora-template/antora-playbook.yml /workspaces/okd-antora/
- cp /workspaces/build_for_antora/antora-template/docs/antora.yml /workspaces/okd-antora/docs/
- cd /workspaces/okd-antora/
- antora antora-playbook.yml
- http-server -c-1 build/site/

## Local builds for OKD on Antora

- edit the /workspaces/build_for_antora/scripts/env.local file with your config 
- edit the /workspaces/build_for_antora/scripts/build_for_antora.js to use your env.local instead of env.codespace
  ```
  var myEnv = dotenv.config({path: ".env.codespace"}) // use env.local for local builds - fix for your own setup
  ```
