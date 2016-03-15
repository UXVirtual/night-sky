Olympics App Prototype
======================

A prototype built using the [WebVR Boilerplate](https://github.com/borismus/webvr-boilerplate). This framework was
chosen due to the larger number of contributors and superior performance. It can also be used as the basis for
Google Cardboard apps. One of the contributors is the a main developer at AltSpaceVR.

## Installation

1.  Install Python 2.7

2.  In the `scripts` folder run the following to install dependencies:

    ```
    python setup.py install
    ```
    
3.  Install Webpack globally: `npm install webpack -g`

4.  Install the Webpack development server: `npm install webpack-dev-server -g`

## Developers

*   Run `webpack --progress --colors --watch` to watch and automatically recompile resources.

*   Run `webpack-dev-server --progress --colors` to start the web server then access the prototype on http://localhost:8080

*   On iOS Download and install WebView from the iOS app store. Enter the desired URL into the WKWebView tab to simulate
    running the app in the WebView accessible in Cordova.
    
## Star Data

1. To generate star data in the `online/assets/data/data.json` file run the following command from the `scripts` folder:

```
python csv-to-json.py ../tmp/data.csv ../online/assets/data/data.json
```

Star data comes from the [The HYG Database](https://github.com/astronexus/HYG-Database). The following data fields are 
available:

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