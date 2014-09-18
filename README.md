# Geopicker Xataface Module
> A map widget for Xataface forms with geocoding advanced functions

Based on "Google Maps Xataface Module" by shannah

Geopicker module adds a "geopicker" widget to your Xataface apps that can be used to allow users to pick a point on a map, find location info like address, municipality, state, province etc, and have the data stored in a TEXT field as JSON data.

## Requirements

1. [Xataface](http://xataface.com) 2.0.4 or higher (or the latest [Git Repo](https://github.com/shannah/xataface))
2. A [Google Maps API key](https://developers.google.com/maps/documentation/javascript/tutorial#api_key) (if using on domains other than localhost).

## Installation

##### Create `modules` directory if it doesn't exist

In your existing Xataface application directory (not the xataface directory, but your application's directory), create a "modules" folder if it doesn't already exist:
 
```
$ cd /path/to/app
$ mkdir modules
$ cd modules
```

##### Copy `geopicker` module into your modules directory

Clone the geopicker module repository into the modules directory so that it is located at `/path/to/app/modules/geopicker`:

```
$ git clone https://github.com/arkypita/xataface-modules-geopicker.git geopicker
```

Alternatively you could have just downloaded the ZIP file and copied it into the same location.  Your application file structure should now be something like:

	app/
		index.php
		conf.ini
		modules/
			geopicker/
				geopicker.php
				widget.php
				js/
				css/
				…
				

##### Enable module in your app's `conf.ini` file

In your application's conf.ini file's `[_modules]` section, add the following line:

```
geopicker=modules/geopicker/geopicker.php
```

i.e. Your `[_modules]` section will look like:

```
[_modules]
	geopicker=modules/geopicker/geopicker.php
	… other modules entries …
```

##### Add your Google API Key to the conf.ini file

After you have [obtained your API key](https://developers.google.com/maps/documentation/javascript/tutorial#api_key), add the following section to your `conf.ini` file:

```
[modules_geopicker]
	key="YOUR KEY HERE"
```

(But, of course, replace "YOUR KEY HERE" with your actual key).

## Usage

After you have installed the module, you should be able to use the map widget to edit any TEXT field in your database by simply specifying `widget:type=geopicker` in the `fields.ini` file.

For example, suppose I have the following table:

```
create table destinations (
	destination_id int(11) unsigned not null auto_increment,
	name varchar(100),
	geodata TEXT
)
```

Then in your `tables/destinations/fields.ini` file you could add:

```
[geodata]
	widget:type=geopicker
```

Now, if try to create a new record in the `destinations` table via your Xataface application, you should notice that there is now a Geopicker widget where the `geodata` field is displayed.

Additionally, if you save the record, you'll notice that the point and geocoding information is retained on the edit form. Notice, also, that if you visit details view for a record, it will show you the map at the picked position.


## Storage Format

The data from the map is stored as a JSON object inside the field that is specified to use the map widget.  It is best to use a TEXT field for this storage, however, other field types that can store text will also work (e.g. VARCHAR or BLOB).  The stored data contains:

```
{
		position [lat, lng]
		route
		number
		locality
		postal_code
		municipality
		province
		region
		state
		postcode
		result  //store full geocoded data into db
}
```

You can modify data saved by editing "geopicker.js" file at line 142


## Support

Write to [arkypita](mailto:arkypita@bergamo3.it) for support.

	
