#!/bin/bash
CONTENT=(
    index.html
    manifest.webapp 
    kindex.html 
    app.js 
    style/app.css 
    lib/my.js
    lib/meteo.js
    img/icon60.png
    img/icon128.png
    Building-Blocks/style/headers.css 
    Building-Blocks/style/headers/
    Building-Blocks/style_unstable/drawer.css
    Building-Blocks/style_unstable/drawer/
    Building-Blocks/icons/styles/action_icons.css
    Building-Blocks/icons/styles/action_icons.png
)

zip -Xr fxos_icmmeteo.zip ${CONTENT[*]}
