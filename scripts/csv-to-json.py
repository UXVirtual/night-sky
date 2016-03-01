#
# CSV To JSON Converson Script
#
# @author Michael Andrew (michael.andrew@gladeye.co.nz)
# @usage python csv-to-json.py ../tmp/data.csv ../online/assets/js/data.json.gz
#

import csv
import json
import sys
import urllib2
import gzip
import pandas



URL = "https://github.com/astronexus/HYG-Database/raw/master/hygdata_v3.csv" #url to star data csv on GitHub
csvFilePath = sys.argv[1] #destination path of downloaded csv file
jsonFilePath = sys.argv[2] #destination path of converted json file

print "Downloading star data CSV... This may take a few minutes..."
with open(csvFilePath,'wb') as f:
    f.write(urllib2.urlopen(URL).read())
    f.close()
print "Download completed. Converting target columns from CSV to GZipped JSON..."

#csvfile = open(csvFilePath, 'r')
jsonfileGzipped = gzip.open(jsonFilePath+'.gz', 'wb')
jsonfile = open(jsonFilePath, 'w')

#reader = csv.reader( csvfile)
#included_cols = [1, 7, 10, 18, 19, 20]

colnames = ['id', 'proper', 'dist', 'x', 'y', 'z']
data = pandas.read_csv(csvFilePath, names=colnames, low_memory=False)

myJSON = data.to_json(path_or_buf = None, orient = 'records', date_format = 'epoch', double_precision = 10, force_ascii = False, date_unit = 'ms', default_handler = None)

jsonfileGzipped.write(myJSON)
jsonfile.write(myJSON)
jsonfile.close()
jsonfileGzipped.close()
print "Done!"
