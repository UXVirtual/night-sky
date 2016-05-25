Night Sky Viewer
================

A prototype built using the [WebVR Boilerplate](https://github.com/borismus/webvr-boilerplate) as part of a larger
mobile application for an upcoming campaign in 2016. This framework was chosen due to the larger number of contributors 
and superior performance.

There are a number of optimisations to the performance and code of the prototype that haven't been made yet as the bulk
of the prototype was created over a week's worth of development time.

This application loads in real star position data as seen from Earth from the [The HYG Database](https://github.com/astronexus/HYG-Database).

The sky will rotate around a fixed point and there is support under the hood for adjusting the night sky in response to a
change in the user's geographic location (currently this is set to somewhere near Auckland, New Zealand).

It is viewable both in the browser and on mobile devices. Works best with:

*   Chrome on Windows and OSX.
*   Chrome on Android.
*   Mobile Safari on iOS.

On mobile devices works best on iPhone 5 or higher. Your device must support WebGL.

## Controls

### Desktop

Click and drag the mouse to pan around the scene.

### Mobile

Move your phone around to pan the scene. Only works with devices equipped with a gyroscope.

## TODO

*   Optimise and provide fallbacks for lower-end devices.

*   Enable Google Cardboard support.

*   Split code into classes and make more object-oriented.

## Installation

1.  Install Python 2.7

2.  Install `setuptools` by following [these instructions](https://pypi.python.org/pypi/setuptools).

3.  In the `scripts` folder run the following to install dependencies:

    ```
    python setup.py install
    ```
    
4.  In the `online` folder run the following to install dependencies:

    ```
    npm install
    ```
    
5.  In the `online` folder run the following to install dependencies:

    ```
    bower install
    ```
    
6.  Generate the star data by running the `csv-to-json.py` in the `scripts` folder:

    ```
    python csv-to-json.py ../tmp/data.csv ../online/assets/data/data.json
    ```

## Developers

*   Run `webpack --progress --colors --watch` to watch and automatically recompile resources.

*   Run `webpack-dev-server --progress --colors` to start the web server then access the prototype on http://localhost:8080

*   On iOS Download and install WebView from the iOS app store. Enter the desired URL into the WKWebView tab to simulate
    running the app in the WebView accessible in Cordova.
    
### Debugging Chrome on Android

See https://developers.google.com/web/tools/chrome-devtools/debug/remote-debugging/remote-debugging for instructions
on remote debugging via desktop Chrome. This will work with Android 4.0 or higher.
   
## Gotchas

*   In the future on mobile Chrome, `devicemotion` event will be removed for insecure origins, meaning the page must
    run on https to allow gyroscope access. We may need to find a way to directly pipe gyroscope data into the app when
    running it in a webview.
    
## Star Data

1. To generate star data in the `online/assets/data/data.json` file run the following command from the `scripts` folder:

```
python csv-to-json.py ../tmp/data.csv ../online/assets/data/data.json
```

The following data fields are available:

Version 3: The field content is very nearly the same as in Version 2, but the column headers are somewhat different, 
and a few extra fields (for variable star range and multiple star info) have been added to the end of each record. For a 
full list of the updated column names, see the official database documentation on Github.

*   `id` - The database primary key.
*   `hip` - The star's ID in the Hipparcos catalog, if known.
*   `hd` - The star's ID in the Henry Draper catalog, if known.
*   `hr` - The star's ID in the Harvard Revised catalog, which is the same as its number in the Yale Bright Star Catalog.
*   `gl` - The star's ID in the third edition of the Gliese Catalog of Nearby Stars.
*   `bf` - The Bayer / Flamsteed designation, primarily from the Fifth Edition of the Yale Bright Star Catalog. This is 
    a combination of the two designations. The Flamsteed number, if present, is given first; then a three-letter 
    abbreviation for the Bayer Greek letter; the Bayer superscript number, if present; and finally, the three-letter 
    constellation abbreviation. Thus Alpha Andromedae has the field value "21Alp And", and Kappa1 Sculptoris (no 
    Flamsteed number) has "Kap1Scl".
*   `ra`, `dec` - The star's right ascension and declination, for epoch and equinox 2000.0.
*   `proper` - A common name for the star, such as "Barnard's Star" or "Sirius". I have taken these names primarily from 
    the Hipparcos project's web site, which lists representative names for the 150 brightest stars and many of the 150 
    closest stars. I have added a few names to this list. Most of the additions are designations from catalogs mostly 
    now forgotten (e.g., Lalande, Groombridge, and Gould ["G."]) except for certain nearby stars which are still best 
    known by these designations.
*   `dist` - The star's distance in parsecs, the most common unit in astrometry. To convert parsecs to light years, 
    multiply by 3.262. A value >= 10000000 indicates missing or dubious (e.g., negative) parallax data in Hipparcos.
*   `pmra`, `pmdec` - The star's proper motion in right ascension and declination, in milliarcseconds per year.
*   `rv` - The star's radial velocity in km/sec, where known.
*   `mag` - The star's apparent visual magnitude.
*   `absmag` - The star's absolute visual magnitude (its apparent magnitude from a distance of 10 parsecs).
*   `spect` - The star's spectral type, if known.
*   `ci` - The star's color index (blue magnitude - visual magnitude), where known.
*   `x`, `y` ,`z` - The Cartesian coordinates of the star, in a system based on the equatorial coordinates as seen from 
    Earth. +X is in the direction of the vernal equinox (at epoch 2000), +Z towards the north celestial pole, and +Y in 
    the direction of R.A. 6 hours, declination 0 degrees.
*   `vx`, `vy`, `vz` - The Cartesian velocity components of the star, in the same coordinate system described 
    immediately above. They are determined from the proper motion and the radial velocity (when known). The velocity 
    unit is parsecs per year; these are small values (around 1 millionth of a parsec per year), but they enormously 
    simplify calculations using parsecs as base units for celestial mapping.
*   `rarad`, `decrad`, `pmrarad`, `prdecrad` - The positions in radians, and proper motions in radians per year.
*   `bayer` - The Bayer designation as a distinct value
*   `flam` - The Flamsteed number as a distinct value
*   `con` - The standard constellation abbreviation
*   `comp`, `comp_primary`, `base` - Identifies a star in a multiple star system. comp = ID of companion star, 
    comp_primary = ID of primary star for this component, and base = catalog ID or name for this multi-star system. 
    Currently only used for Gliese stars.
*   `lum` - Star's luminosity as a multiple of Solar luminosity.
*   `var` - Star's standard variable star designation, when known.
*   `var_min`, `var_max`: Star's approximate magnitude range, for variables. This value is based on the Hp magnitudes 
    for the range in the original Hipparcos catalog, adjusted to the V magnitude scale to match the "mag" field.

## Tools

*   [Three.js Inspector](https://chrome.google.com/webstore/detail/threejs-inspector/dnhjfclbfhcbcdfpjaeacomhbdfjbebi/related?hl=en)

## Examples

*   [Three JS Point Cloud Experiment](http://codepen.io/seanseansean/pen/EaBZEY)

*   http://www.html5rocks.com/en/tutorials/casestudies/100000stars/

*   http://stars.chromeexperiments.com/

*   https://jbouny.github.io/ocean/demo/

## Reference

*   [What Are Celestial Coordinates](http://www.skyandtelescope.com/astronomy-resources/what-are-celestial-coordinates/)
*   [Scientific Visualization Studio](http://svs.gsfc.nasa.gov/cgi-bin/details.cgi?aid=3895)
*   [Planetary Annihilation Skyboxes](http://www.superouman.net/planetary-annihilation-skyboxes.php)
*   [How to Find the Milky Way](http://www.lonelyspeck.com/how-to-find-the-milky-way/)
*   [THREE.js VRControls Integration How To Move In The Scene](http://stackoverflow.com/questions/30511524/three-js-vrcontrols-integration-how-to-move-in-the-scene)