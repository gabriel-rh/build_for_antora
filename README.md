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


## Using codespaces to build a specific version of a specific distro

In this example, we will build version 4.13 of OCP Enterprise docs 

- Create a codespace on main branch of https://github.com/gabriel-rh/build_for_antora
- Wait for extensions, packages to be installed (less than a minute)
- cd /workspaces
- git clone https://github.com/openshift/openshift-docs
- cd openshift-docs/
- git checkout enterprise-4.13
- cd /workspaces/build_for_antora/scripts

- Edit the .env.codespace file so it looks like:
  ```
  INPUT_DIR=/workspaces/openshift-docs

  DISTRO="openshift-enterprise"
  PRODUCT_TITLE="OCP"
  PRODUCT_VERSION=4.13

  TOPIC_MAP_DIR=$INPUT_DIR/_topic_maps
  TOPIC_MAP_FILE=_topic_map.yml

  BASE_DIR=/workspaces/ocp-4.13-antora
  ```
- node ./build_for_antora.js


- copy the templates to the new folder and update for distro and version
  - cp /workspaces/build_for_antora/antora-template/antora-playbook.yml /workspaces/ocp-4.13-antora/
    ```
    site:
      title: OCP
    ```
  - cp /workspaces/build_for_antora/antora-template/docs/antora.yml /workspaces/ocp-4.13-antora/docs/
    ```
    ---
    asciidoc:
      attributes:
        prod-ver: 2.2
        product-title: OCP
        product-version: 4.13
    name: okd
    start_page: welcome:index.adoc
    title: OpenShift Enterprise Docs
    version: "4.13"
    nav:    
    ```
    - copy the nav content from the `top-level-nav.yml` file into the nav: section (this will be automated!)


Now do the usual build stuff:

- cd /workspaces/ocp-4.13-antora/
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
- build with antora in your output directory - must `git init`, etc first
- run http server locally to view files  (or just view from file system)
