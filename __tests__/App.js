/*
TODO
this line in package.js makes test slow but it is necessary because of stupid Native Base (https://github.com/GeekyAnts/NativeBase/issues/396)
"transformIgnorePatterns": ["/node_modules/(?!native-base)/"]
*/

/*
TODO 2
There is a strange error when testing React components
TypeError: Cannot read property 'Object.<anonymous>' of null
For now, components can't be tested :(

/* import 'react-native';
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import React from 'react';
import App from '../App'; */

test('Empty test', () => {});
