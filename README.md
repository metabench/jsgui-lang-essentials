jsgui-lang-essentials
=====================

##Installation
	npm install jsgui-lang-essentials

###Class
Allows programming in JavaScript using Class declarations. Easy access to the methods of the superclass, allows for inheritance and inheritance chains. Based on code written by John Resig.

	var Class = jsgui.Class;
	
	var Entity = Class.extend({
		'init': function(spec) {
			this.name = spec.name;
		}
	});
	
	var Person = Entity.extend({
		'init': function(spec) {
			this._super(spec);
			this.date_of_birth = spec.date_of_birth;
		}
	});
	
	var Employee = Person.extend({
		'init': function(spec) {
			this._super(spec);
			this.salary = spec.salary;
		}
	});
	
### each
Iterator for both objects and arrays. Iteration callback is in the jQuery style, with the callback providing (index, item) callbacks.

	each(obj_or_array_to_iterate, function(index, item_value) {
		console.log('index ' + index);
		console.log('item_value ' + item_value);
	});
	
### extend
A copy of jQuery's extend function

### get_truth_map_from_arr
Creates a map object from an array (of strings or items who's toString method can be used) where the keys correspond to strings in the array, and the values are all true

### get_map_from_arr
Creates a map object from an array (of strings or items who's toString method can be used) where the keys correspond to strings in the array, and the values are the original values in the array

### arr_like_to_arr
Creates an array from an array-like object, such as the arguments list available in functions through the variable 'arguments'

### is_ctrl
Tests if an object is a jsgui Control

### tof
Returns the type of an object, as a string. Types returned are: null, undefined, object, array, control, function, string, number, boolean, regex, buffer, readable_stream, writable_stream.

### atof
Returns an array containing the types of all the items in array. This uses tof.

### is_defined
Is the object not undefined?

### is_data_object
Is the object a jsgui Data_Object?

### is_collection
Is the object a jsgui Collection?

### stringify
Returns a string represention of an object as JSON or with JSON-like encoding. This allows for a wider variety of objects to be efficiently encoded, eg representing arrays as root objects.


