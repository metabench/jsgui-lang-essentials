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
	
	
	