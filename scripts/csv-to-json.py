#
# CSV To JSON Converson Script
#
# @author Michael Andrew (michael.andrew@gladeye.co.nz)
# @usage python csv-to-json.py ../tmp/data.csv ../online/assets/data/data.json
#

import csv
import json
import sys
import urllib2
import gzip
import pandas
import numpy as np

URL = "https://github.com/astronexus/HYG-Database/raw/master/hygdata_v3.csv" #url to star data csv on GitHub
csvFilePath = sys.argv[1] #destination path of downloaded csv file
jsonFilePath = sys.argv[2] #destination path of converted json file

print "Downloading star data CSV... This may take a few minutes..."
with open(csvFilePath,'wb') as f:
    f.write(urllib2.urlopen(URL).read())
    f.close()
print "Download completed. Converting target columns from CSV to GZipped JSON..."

jsonfileGzipped = gzip.open(jsonFilePath+'.gz', 'wb')
jsonfile = open(jsonFilePath, 'w')

#pandas.set_option('display.precision', 15)

colnames = ['id', 'proper', 'mag', 'absmag', 'dist', 'x', 'y', 'z', 'spect', 'con']
data = pandas.read_csv(csvFilePath, engine='c', usecols=colnames, low_memory=False, delimiter = ',', skip_blank_lines = True, index_col = 0, header = 0, float_precision = 10,  dtype={'id': np.int64, 'proper': str, 'dist': np.float64, 'x': np.float64,'y': np.float64, 'z': np.float64, 'spect': str, 'mag': np.float64, 'absmag': np.float64, 'con': str})

print data.dtypes

myJSON = data.to_json(path_or_buf = None, orient = 'records', date_format = 'epoch', double_precision = 10, force_ascii = False, date_unit = 'ms')


jsonfileGzipped.write(myJSON)
jsonfile.write(myJSON)
jsonfile.close()
jsonfileGzipped.close()
print "Done!"
