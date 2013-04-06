#!/bin/bash

ZIPFILE=package/swiss-cinema-ratings.zip

cd extension
zip -r ../$ZIPFILE *
cd ..

echo Created $ZIPFILE