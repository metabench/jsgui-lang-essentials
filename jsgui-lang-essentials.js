
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
	
	

	// Do setup work here
	// alert('loading jsgui-lang');
	// lots of things will be in var declarations....
	//  
	// return {};
	var initializing = false, fnTest = /xyz/.test(function() {
		xyz;
	}) ? /\b_super\b/ : /.*/;
	var Class = function() {
	};
	
	// not so sure of the utility of namespcExtension, propsToMerge
	Class.extend = function(prop, namespcExtension, propsToMerge) {
		var _super = this.prototype;
		initializing = true;
		var prototype = new this();
		initializing = false;
		for (var name in prop) {
			if (name.charAt(0) === '#') {
				prototype[name.substring(1)] = prototype[prop[name]];
			} else {
				prototype[name] = typeof prop[name] === 'function'
						&& typeof _super[name] === 'function'
						&& fnTest.test(prop[name]) ?
				// had some difficulty using fp() with 'init' functions. could
				// it have to do with function names?

				(function(name, fn) {
					return function() {
						var tmp = this._super;
						this._super = _super[name];
						var res = fn.apply(this, arguments);
						this._super = tmp;
						return res;
					};
				})(name, prop[name]) : prop[name];
			};
		};
		function Class() {
			//console.log('initializing ' + initializing);
			//console.log('!!this.init ' + !!this.init);
			if (!initializing && this.init)
				this.init.apply(this, arguments);
		};
		Class.prototype = prototype;
		Class.prototype.constructor = Class;
		//Class.constructor = Class;
		Class.extend = arguments.callee;
		//Class._superclass = _super;
		
		Class._superclass = this;
		/*
		 * if (namespcExtension) { each(namespcExtension, function(i, n) {
		 * Class[i] = n; }); }; if (propsToMerge) { each(propsToMerge,
		 * function(i, n) { if (typeof Class.prototype[i] === 'undefined') {
		 * Class.prototype[i] = n; } else { $.extend(true, Class.prototype[i],
		 * n); }; }); }
		 */

		return Class;
	};

	
	// new addition with the loop being stoppable using a function call. 18/06/2012
	var each = function(collection, fn, context) {
		// each that puts the results in an array or dict.
		if (collection) {

			if (collection.__type == 'collection') {
				return collection.each(fn, context);
			}

			// could have a break function that stops the loop from continuing.
			//  that would be useful as a third parameter that can get called.
			//  stop() function
			var ctu = true;
			var stop = function() {
				ctu = false;
			}
			
			if (is_array(collection)) {
				var res = [];
				for ( var c = 0, l = collection.length; c < l; c++) {
					var res_item;
					if (ctu == false) break;
					
					if (context) {
						res_item = fn(c, collection[c]);
					} else {
						res_item = fn.call(context, c, collection[c], stop);
					}
					res.push(res_item);
				}
				return res;
			} else {
				var name, res = {};
				for (name in collection) {
					if (ctu == false) break;
					if (context) {
						res[name] = fn.call(context, name, collection[name], stop);
					} else {
						res[name] = fn(name, collection[name]);
					}
				}
				return res;
			}
		}

	};
	var jq_class2type = {};
	var jq_type = function(obj) {
		return obj == null ? String(obj) : jq_class2type[toString.call(obj)]
				|| "object";
	};

	var is_array = Array.is_array || function(obj) {
		return jq_type(obj) === "array";
	}, is_dom_node = function isDomNode(o) {
		return (typeof o.nodeType != 'undefined' && typeof o.childNodes != 'undefined');
	};

	each("Boolean Number String Function Array Date RegExp Object".split(" "),
		function(i, name) {
			jq_class2type["[object " + name + "]"] = name.toLowerCase();
		});

	/*
	 * var jq_type = function( obj ) { return obj == null ? String(obj):
	 * jq_class2type[toString.call(obj)] || "object"; };
	 */

	var jq_isFunction = function(obj) {
		return jq_type(obj) === "function";
	};

	var jq_isWindow = function(obj) {
		return obj && typeof obj === "object" && "setInterval" in obj;
	};

	var hasOwn = Object.prototype.hasOwnProperty;

	var jq_isPlainObject = function(obj) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor
		// property.
		// Make sure that DOM nodes and window objects don't pass through, as
		// well
		if (!obj || jq_type(obj) !== "object" || obj.nodeType
				|| jq_isWindow(obj)) {
			return false;
		}

		// Not own constructor property must be Object
		if (obj.constructor && !hasOwn.call(obj, "constructor")
				&& !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for (key in obj) {
		}

		return key === undefined || hasOwn.call(obj, key);
	};

	// jQuery Extend

	var jq_extend = function() {
		var options, name, src, copy, copyis_array, clone, target = arguments[0]
				|| {}, i = 1, length = arguments.length, deep = false;

		// Handle a deep copy situation
		if (typeof target === "boolean") {
			deep = target;
			target = arguments[1] || {};
			// skip the boolean and the target
			i = 2;
		}

		// Handle case when target is a string or something (possible in deep
		// copy)
		if (typeof target !== "object" && !jq_isFunction(target)) {
			target = {};
		}

		// (extend (jQuery) itself if only one argument is passed) no longer in
		// jQuery
		if (length === i) {
			target = this;
			--i;
		}

		for (; i < length; i++) {
			// Only deal with non-null/undefined values
			if ((options = arguments[i]) != null) {
				// Extend the base object

				// nope... need to go through all items in the array if its an
				// array, copying undefined as needed.

				if (is_array(options)) {

					// could maybe use each here anyway.
					// but a direct function may be faster.

					for ( var name = 0, l = options.length; name < l; name++) {
						src = target[name];
						copy = options[name];

						// Prevent never-ending loop
						if (target === copy) {
							continue;
						}

						// Recurse if we're merging plain objects or arrays
						if (deep
								&& copy
								&& (jq_isPlainObject(copy) || (copyis_array = is_array(copy)))) {
							if (copyis_array) {
								copyis_array = false;
								clone = src && is_array(src) ? src : [];
							} else {
								clone = src && jq_isPlainObject(src) ? src : {};
							}
							// Never move original objects, clone them
							target[name] = jq_extend(deep, clone, copy);
							// Don't bring in undefined values???
						} // else if ( copy !== undefined ) {
						else {
							target[name] = copy;
						}
					}

				} else {
					for (name in options) {

						// console.log('name ' + name);

						src = target[name];
						copy = options[name];

						// Prevent never-ending loop
						if (target === copy) {
							continue;
						}

						// Recurse if we're merging plain objects or arrays
						if (deep
								&& copy
								&& (jq_isPlainObject(copy) || (copyis_array = is_array(copy)))) {
							if (copyis_array) {
								copyis_array = false;
								clone = src && is_array(src) ? src : [];
							} else {
								clone = src && jq_isPlainObject(src) ? src : {};
							}
							// Never move original objects, clone them
							target[name] = jq_extend(deep, clone, copy);
							// Don't bring in undefined values
						} else if (copy !== undefined) {
							target[name] = copy;
						}
					}
				}

			}
			// console.log('arguments[i] ' + stringify(arguments[i]));
			// console.log('options ' + stringify(options));
		}
		// Return the modified object
		// console.log('target ' + stringify(target));
		return target;
	}, extend = jq_extend;

	
	
	
	/*
	var x_clones = function(obj, x) {
		
	};
	*/
	
	var get_truth_map_from_arr = function(arr) {
		var res = {};
		each(arr, function(i, v) {
			res[v] = true;
		});
		return res;
	};

	// not a truth map because 0 == false. Could use this but do different
	// check, like is_defined.
	var get_map_from_arr = function(arr) {
		var res = {};
		each(arr, function(i, v) {
			res[v] = i;
		});
		return res;
	}

	var arr_like_to_arr = function(arr_like) {
		// like an arguments list
		// is this working in Safari?

		var res = [];

		// This was not working in Safari! Worked in Chrome. Probably
		// (mis?)recognised it as an object.
		// each(arr_like, function(i, v) {
		// res.push(v);
		// });

		for ( var c = 0, l = arr_like.length; c < l; c++) {
			res.push(arr_like[c]);
		}
		;

		return res;
	};

	/*
	 * var is_ctrl = function(obj) { return (typeof obj != 'undefined' && obj !=
	 * null && typeof obj.$render != 'undefined'); };
	 */

	var is_ctrl = function(obj) {

		// if (obj._) {
		// console.log('obj._.type_name ' + obj._.type_name);
		// }

		return (typeof obj != 'undefined' && obj != null && is_defined(obj._) && is_defined(obj._.type_name));
	};

	// may change to the jq_type code.
	var tof = function(obj) {
		if (is_defined(obj)) {
			
			if (obj === null) {
				return 'null';
			}
			
			//console.log('typeof obj ' + typeof obj);
			//console.log('obj === null ' + (obj === null));
			
			if (is_defined(obj.__type)) {
				return obj.__type;
			}
		} else {
			return 'undefined';
		}
		var res = typeof (obj);
		if (res == 'object' && is_array(obj))
			res = 'array';
		if (res == 'object' && is_ctrl(obj))
			res = 'control';
		return res;
	};
	
	var atof = function(arr) {
		var res = [];
		each(arr, function(i, v) {
			res.push(tof(v));
		});
		return res;
	};

	var is_defined = function(value) {
		// tof or typeof

		return typeof (value) != 'undefined';
	}, isdef = is_defined;

	var is_data_object = function(obj) {
		
		if(obj) {
			if (obj.__type == 'data_object') return true;
			if (obj.__type == 'collection') return true;
		}
		
		//this.__type = 'collection'
		
		return false;
		
	}
	
	// will test for control using similar means as well.
	
	var is_collection = function(obj) {
		//if (obj.__type == 'data_object') return true;
		
		if (obj) {
			if (obj.__type == 'collection') return true;
		}
		
		
		//this.__type = 'collection'
		
		return false;
		
	}
	
	var stringify = function(obj, includeFunctions) {
		// Likely optimization: use array to build the string, then join it for
		// the result.
		// Now updated.
		// Could probably use polymorphism here and save space

		// Designed for stringifying specs including functions in mind.
		
		// Could use tof as well... I think that would make a lot of sense.
		
		var t = typeof obj, res = [];

		//console.log('t ' + t);
		//console.log('obj ' + obj);
		
		// to stringify a collection?
		
		if (obj === String) {
			return 'JS_String';
		}
		
		if (t == 'object') {
			// will be testing it to see if it is a Data_Object
			//  and then if it is a Collection
			
			
			if (obj && is_defined(obj.stringify)) {
				//throw 'stop';
				return obj.stringify();
			} else {
				
				var ia = is_array(obj);
				if (ia) {
					// res = res + '[';
					res.push('[');
					var first = true;
					for ( var c = 0; c < obj.length; c++) {
						// if (!first) res = res + ', ';
						if (!first)
							res.push(', ');
						// res = res + stringify(obj[c]);
						res.push(stringify(obj[c]));
						first = false;
					}
					;
					// res = res + ']';
					res.push(']');
				} else if (obj == null) {
					res = [ 'null' ];
				} else if (is_ctrl(obj)) {
					// res = res + '{"ctrl": "' + obj.id() + '"}';
					res.push('{"ctrl": "' + obj.id() + '"}');
				} else {
					// console.log('obj ' + obj);

					// a way of checking for a non-native toString?
					if (is_defined(obj.toString) && obj.toString.stringify === true) {
						res.push('"' + obj.toString() + '"');
					} else {
						var first = true;
						// res = res + '{';
						res.push('{');
						each(obj, function(i, v) {
							//console.log(tof(v));
									if (includeFunctions !== false
											&& tof(v) !== 'function') {
										// if (!first) res = res + ', ';
										if (!first)
											res.push(', ');
										// res = res + '"' + i + '": ' +
										// stringify(v);
										res.push('"' + i + '": ' + stringify(v));
										first = false;
									}
								});
						// res = res + '}';
						res.push('}');
					}
				};
				
			}
			
			
			/*
			if (is_data_object(obj)) {
				// use a different type of output.
				//  we don't want to read its internal properties.
				
				// we can use the 'each' method I think.
				
				// don't think we'll do that.
				//  if the object has a stringify function of its own, we call that.
				
				// and the collection in abstract mode could operate differently...
				//  show itself more as a schema.
				
				
				
				
				if (is_collection(obj)) {
					//res.push('[COLLECTION]');
					
					// will be iterating through it.
					
					res.push('Collection(');
					//console.log('obj._arr ' + stringify(obj._arr));
					
					var first = true;
					obj.each(function(i, v) {
						if (!first) {
							res.push(', ');
						} else {
							first = false;
						}
						res.push(stringify(v));
						
					})
					
					res.push(')');
					
					
				} else {
					//var s_obj = 
					
					// but can the data_object still have a value when there is nothing seen here?
					
					res.push('Data_Object(' + stringify(obj._) + ')');
				}
			} else {
				
			}
			*/
			
			
		} else if (t == 'string') {
			// Escape characters in JSON string?
			// res = '"' + obj + '"';
			res.push('"' + obj + '"');
		} else if (t == 'undefined') {
			res = [ 'undefined' ];
		} else if (t == 'function') {

			if (includeFunctions !== false) {
				res = [ obj.toString() ];
			}
		} else {
			res = [ obj.toString() ];
		}
		return res.join('');
	};

	var get_item_sig = function(i) {
		// also want to be able to do polymorphic rearrangements.
		// these will need to be specified so they get rearranged as required.
		// will check for some signatures and rearrange the arguments, and
		// return that array. Will be useful all over the place in the library.

		// v2 = [i, i], v3 = [i, i, i]
		// or even i2 = [i, i]? maybe not for the moment, plenty of
		// simplification already, could maybe express things like that at some
		// stage.

		// rearrangement - '[i, i], s' <- 's, [i, i]'
		// if second arrangement, output the items in the order given.
		// that seems to require parsing these signature strings.

		// returns the polymorphic signature.
		// same for each item in the array.

		// will get the poly signature for each item in the array?
		// is it an array?

		
		
		var t = tof(i), res;
		
		if (i === 0) {
			//console.log('i ' + i);
			//console.log('t ' + t);
		}
		
		//console.log('i ' + i);
		//console.log('t ' + t);
		
		// likely to use a map for this logic instead.
		// console.log('t ' + t);
		if (t == 'array') {
			var res = '[';
			for ( var c = 0, l = i.length; c < l; c++) {
				if (c > 0)
					res = res + ',';
				res = res + get_item_sig(i[c]);
			}
			res = res + ']';
			// return res;
		} else if (t == 'string') {
			// is it a string that parses to an integer?
			// parses to a decimal number
			// parses to an rgb value
			// parses to hex value
			// various string regexs used (optionally), can say what we are
			// looking for (for various parameters).
			// may want a quick basic poly.

			res = 's';
		} else if (t == 'boolean') {
			res = 'b';
		} else if (t == 'function') {
			res = 'f';
		} else if (t == 'control') {
			res = 'c';
		} else if (t == 'number') {
			// is it an integer?
			// is it a decimal?

			// are we checking for those anyway? maybe not by default.

			res = 'n';
		} else if (t == 'object') {

			// not sure about showing all the details of the object.

			res = 'o';
		} else if (t == 'undefined') {
			res = 'u';
		} else {
			
			if (t == 'collection_index') {
				return 'X';
			} else if (t == 'data_object') {
				if (i._abstract) {
					return '~D';
				} else {
					res = 'D';
				}
			
				
			} else {
				if (t == 'data_value') {
					if (i._abstract) {
						return '~V';
					} else {
						return 'V';
					}
				
					
				} else if (t == 'collection') {
					if (i._abstract) {
						return '~C'
					} else {
						return 'C';
					}
				
				
					
				} else {
					console.log('t ' + t);
					throw 'Unexpected object type ' + t;
				}
			}
			
			// May have decimal type as well?
			
			// d for the moment?
			//  May want decimal numbers too?
			//  D is better for Data_Object.
			
			// c for Control
			// C for Collection
			
			
			
			// Could say Data_Object is D
			// Collection is C?
			
			
			
		}
		// console.log('sig res ' + res);
		return res;
	};

	
	var trim_sig_brackets = function(sig) {
		if (tof(sig) == 'string') {
			if (sig[0] == '[' && sig[sig.length - 1] == ']') {
				return sig.substring(1, sig.length - 1);
			} else {
				return sig;
			}
		}

	};

	var arr_trim_undefined = function(arr_like) {
		var res = [];
		var last_defined = -1;

		each(arr_like, function(i, v) {

			var t = tof(v);
			if (t == 'undefined') {

			} else {
				last_defined = i;
			}

		});

		each(arr_like, function(i, v) {
			if (i <= last_defined) {
				res.push(v);
			}
		});
		return res;
	};
	
	var functional_polymorphism = function(options, fn) {
		var a0 = arguments;
		if (a0.length == 1) {
			fn = a0[0];
			options = null;
		}
		
		//is there a this?
		
		var that = this;
		//var _super = that._super;
		
		// not having access to this here
		
		var new_fn = function() {
			
			var that = this;
			var _super = that._super;
			
			var a = arguments;
			// and if there is an array of arguments given... give as one
			// argument.
			if (a.length == 1) {
				var sig = get_item_sig([ a[0] ]);
				//console.log('fp sig, a.l == 1 ' + sig);
				// a 'l' property given to array given
				var a2 = [ a[0] ];
				a2.l = a2.length;
				return fn.call(that, a2, sig, _super);
			} else if (a.length > 1) {
				var arr = arr_like_to_arr(a);
				arr = arr_trim_undefined(arr);
				var sig = get_item_sig(arr);
				arr.l = arr.length;
				return fn.call(that, arr, sig, _super);
			} else if (a.length == 0) {
				arr = [];
				arr.l = 0;
				return fn.call(that, arr, '[]', _super);
			}
		};
		return new_fn;
	}, fp = functional_polymorphism;

	var arrayify = fp(function(a, sig) {

		// console.log('arrayify sig ' + sig);
        
		// What about arrayifying a map rather than a function?
		// Turns it into name/value pairs. Easier to process with each or
		// measure the length of.

		// what about a pf function that provides an 'a' map.
		// has whatever properties have been provided and asked for.
		var param_index, fn;
		// (param_index, fn)
		var res;
		var process_as_fn = function() {
			res = function() {
				// could use pf here? but maybe not

				// console.log('arguments.length ' + arguments.length);

				var a = arr_like_to_arr(arguments), ts = atof(a), t = this;

				// console.log('a.length ' + a.length);
				// console.log('a ' + stringify(a));

				// console.log('param_index ' + param_index);
				// console.log('ts ' + stringify(ts));

				if (typeof param_index !== 'undefined'
						&& ts[param_index] == 'array') {
					// var res = [], a2 = a.slice(1); // don't think this makes
					// a copy of the array.
					var res = []; // don't think this makes a copy of the
									// array.
					// console.log('fn ' + fn);

					each(a[param_index], function(i, v) {
						var new_params = a;
						new_params[param_index] = v;
						// the rest of the parameters as normal

						var result = fn.apply(t, new_params);
						// console.log('result ' + stringify(result));
						res.push(result);
					});
					return res;
				} else {
					return fn.apply(t, a);
				}
			};
		}

		if (sig == '[o]') {
			var res = [];
			each(a[0], function(i, v) {
				res.push([ i, v ]);
			});
		} else if (sig == '[f]') {
			param_index = 0, fn = a[0];
			process_as_fn();
		} else if (sig == '[n,f]') {
			param_index = a[0], fn = a[1];
			process_as_fn();
		}

		// maybe done with pf for getting function signature.
		// console.log('using arrayify');
		// if (typeof param_index == 'undefined') param_index = 0;

		return res;
	});


	
	var mapify = function(target) {
		var tt = tof(target);
		if (tt == 'function') {
			var res = fp(function(a, sig) {
				var that = this;
				if (sig == '[o]') {
					var map = a[0];
					each(map, function(i, v) {
						fn.call(that, i, v);
					});
				} else if (a.length == 2) {
					// could take functions, but not dealing with objects may be
					// tricky?
					// or just if there are two params its fine.
					target.apply(this, a);
				}
			});
			return res;
		} else if (tt == 'array') {
			// a bunch of items, items could have name
			
			// could just be given an array to mapify.
			
			var res = {};
			
			if (arguments.length == 1) {
				// dealing with [name, value] pairs
				each(target, function(i, v) {
					res[v[0]] = v[1];
				});
			} else {
				var by_property_name = arguments[1];
				each(target, function(i, v) {
					res[v[by_property_name]] = v;
				});
			}
			
			return res;

		}
		// we may be given a function,
		// we may be given an array.

		// been given a map / object

	};
	
	// had x_clones folded into it
	var clone = fp(function(a, sig) {
		var obj = a[0];
		if (a.l == 1) {
			
			
			var t = tof(obj);
			if (t == 'array') {

				// slice removes undefined items
				// console.log('clone obj ' + stringify(obj));
				// console.log('obj.length ' + obj.length);
				/*
				 * var res = []; each(obj, function(i, v) { console.log('i ' + i);
				 * res.push(v); }); return res;
				 */
				return obj.slice();
				
				// deep clone...?

			} else if (t == 'undefined') {
				return undefined;
			} else if (t == 'string') {
				return obj;
			} else {

				// extend not cloning the undefined values in the array properly,
				// don't want them trimmed.

				return extend(true, {}, obj);
			}
			
		} else if (a.l == 2 && tof(a[1]) == 'number') {
			var res = [];
			for ( var c = 0; c < a[1]; c++) {
				res.push(clone(obj));
			}
			return res;
			
		}
		
		
	});

	
	/*
	 * var ll_set = function(obj, prop_name, prop_value) { // not setting
	 * sub-properties specifically. sub-properties are properties of a kind //
	 * however will not use ll_set inappropriately eg border.width works
	 * differently
	 * 
	 * 
	 * var arr = prop_name.split('.'); //console.log('arr ' + arr); var c = 0, l =
	 * arr.length; var i = obj._ || obj; while (c < l) { var s = arr[c];
	 * //console.log('s ' + s); if (typeof i[s] == 'undefined') { if (c - l ==
	 * -1) { //console.log('default_value ' + default_value);
	 * 
	 * i[s] = prop_value; } else { i[s] = {}; } } i = i[s]; c++; }; return i;
	 * 
	 * 
	 *  }
	 */

	var are_equal = function() {
		var a = arguments;
		if (a.length == 0)
			return null;
		if (a.length == 1) {
			var t = jsgui.tof(a[0]);
			if (t == 'array' && a[0].length > 1) {
				for ( var c = 1, l = a[0].length; c < l; c++) {
					if (!jsgui.are_equal(a[0][0], a[0][c]))
						return false;
				}
			} else {
				return true;
			}
		}
		if (a.length == 2) {
			var ts = jsgui.atof(a);
			if (ts[0] != ts[1])
				return false;
			var t = ts[0];
			if (t == 'string' || t == 'number')
				return a[0] == a[1];
			if (t == 'array') {
				if (a[0].length != a[1].length)
					return false;
				for ( var c = 0, l = a[0].length; c < l; c++) {
					if (!jsgui.are_equal(a[0][c], a[1][c]))
						return false;
				}
				;
			} else if (typeof a[0] == 'object') {
				// get the dict of keys for both, compare the lengths, (compare
				// the keys), get merged key map
				var merged_key_truth_map = {};
				var c1 = 0;
				each(a[0], function(i, v) {
					merged_key_truth_map[i] = true;
					c1++;
				});
				var c2 = 0;
				each(a[1], function(i, v) {
					merged_key_truth_map[i] = true;
					c2++;
				});
				if (c1 != c2)
					return false;
				each(merged_key_truth_map, function(i, v) {
					if (!jsgui.are_equal(a[0][i], a[1][i]))
						return false;
				});
			}
		}
		if (a.length > 2) {
			var ts = jsgui.atof(a);
			if (!jsgui.are_equal(ts))
				return false;
			var o = a[0];
			for ( var c = 1, l = a.length; c < l; c++) {
				if (a[c] !== o)
					return false;
			}
		};
		return true;
	};

	
	var set_vals = function(obj, map) {
		each(map, function(i, v) {
			obj[i] = v;
		});
	};
	

	var ll_set = function(obj, prop_name, prop_value) {
		// not setting sub-properties specifically. sub-properties are
		// properties of a kind
		// however will not use ll_set inappropriately eg border.width works
		// differently

		var arr = prop_name.split('.');
		//console.log('arr ' + arr);
		var c = 0, l = arr.length;
		var i = obj._ || obj;
		
		while (c < l) {
			var s = arr[c];
			//console.log('s ' + s);
			if (typeof i[s] == 'undefined') {
				if (c - l == -1) {
					// console.log('default_value ' + default_value);
					i[s] = prop_value;
				} else {
					i[s] = {};
				}
			} else {
				if (c - l == -1) {
					// console.log('default_value ' + default_value);
					i[s] = prop_value;
				}
			}
			i = i[s];
			c++;
		};
		return prop_value;
	};

	var ll_get = fp(function(a, sig) {

		if (a.l == 2) {
			var arr = a[1].split('.');

			// shows how much the ll functions get used when they get logged!

			// console.log('get arr ' + arr);
			var c = 0, l = arr.length;
			var i = a[0]._ || a[0];

			while (c < l) {
				var s = arr[c];
				// console.log('s ' + s);
				if (typeof i[s] == 'undefined') {
					if (c - l == -1) {
						// console.log('default_value ' + default_value);
						// console.log(i[s]);
						// i[s] = a[2];
						// return i[s];
					} else {
						// i[s] = {};
						throw 'object ' + s + ' not found';
					}
				} else {
					if (c - l == -1) {
						// console.log('default_value ' + default_value);
						// console.log(i[s]);
						// i[s] = a[2];
						return i[s];
					}
				}
				i = i[s];
				c++;
			}
			;
			// return i;
		}
	});
	
	var truth = function(value) {
		return value === true;
	};
	
	var iterate_ancestor_classes = function(obj, callback) {
		
		/*
		if (obj.constructor &! obj._superclass) {
			iterate_ancestor_classes(obj.constructor, callback)
		} else {
			callback(obj);
			if (obj._superclass) {
				iterate_ancestor_classes(obj._superclass, callback);
			}
			
		}
		*/
		
		var ctu = true;
		
		var stop = function() {
			ctu = false;
		}
		
		callback(obj, stop);
		if (obj._superclass && ctu) {
			iterate_ancestor_classes(obj._superclass, callback);
		}
		
		
	}
	
	

	var is_arr_of_t = function(obj, type_name) {
		var t = tof(obj);
		if (t == 'array') {
			var res = true;
			
			each(obj, function(i, v) {
				//console.log('2) v ' + stringify(v));
				var tv = tof(v);
				//console.log('tv ' + tv);
				//console.log('type_name ' + type_name);
				if (tv != type_name) res = false;
			});
			return res;
		} else {
			return false;
		}
		
	}
	
	var is_arr_of_arrs = function(obj) {
		return is_arr_of_t(obj, 'array');
	}
	var is_arr_of_strs = function(obj) {
		//console.log('obj ' + stringify(obj));
		return is_arr_of_t(obj, 'string');
	}
	
	
	var input_processors = {};
	var output_processors = {};
	
	// for data types...
	//  don't look up the data types directly for the moment.
	//  they are composed of input processors, validation and output processors.
	
	
	var is_constructor_fn = function(fn) {
		return is_defined(fn.prototype);
	}
	
	
	//var output_processors = {};
	
	// Possibly validators here too.
	//  They may well get used for data structures that deal with these data types. The typed constraints could make use of them (the basis that is set in essentials)
	//  while adding to them. Perhaps a 'core' intermediate layer will be there extending essentials with some of the data types that are to be used throughout the system.
	
	// May find that the functionality for 'nested' gets moved out from that code file. Not so sure about using the Data_Type_Instance...
	//  it could be useful, but not really useful on the level of what the user wants the system to do.
	//  Want to get the Data_Object and Collections system working in some more generic tests, also want to explore some of the more complicated data structures
	//  that will be used for HTML. The idea is that the HTML section will not need so much code because it is making use of some more generally defined things.
	
	// Defining an element's style attributes... will use a Data_Object system internally that is customized to reformat data.
	//  That seems like a fairly big goal, want to get these things working on a simpler level and in collections.
	//  Will use some kind of polymorphic rearrangement to rearrange where suitable.
	
	var call_multiple_callback_functions = fp(function(a, sig) {
		
		// will look at the signature and choose what to do.
		
		//if (sig == )
		
		// need to be checking if the item is an array - nice to have a different way of doing that with fp.
		
		
		// arr_functions_params_pairs, callback
		var arr_functions_params_pairs, callback, return_params = false;
		
		if (a.l == 2) {
			arr_functions_params_pairs = a[0];
			callback = a[1];
		}
		if (a.l == 3) {
			arr_functions_params_pairs = a[0];
			callback = a[1];
			return_params = a[2];
		}
		
		// also want the context.
		
		var res = [];
		
		var l = arr_functions_params_pairs.length;
		var c = 0;
		var that = this;
		
		// the number of processes going 
		
		// the maximum number of processes allowed.

		var process = function() {
			// they may not be pairs, they could be a triple with a callback.
			
			
			var pair = arr_functions_params_pairs[c];
			
			// object (context / caller), function, params
			// object (context / caller), function, params, fn_callback
			
			var context;
			var fn, params, fn_callback;
			// function, array
			// context
			//console.log('pair.length ' + pair.length);
			if (pair.length == 2) {
				//if (tof(pair[0]) == 'function' && tof(pair[1]) == 'array' && pair.length == 2) {
				//	fn = pair[0];
				//	params = pair[1];
				//}
				// ?, function
				
				if (tof(pair[1]) == 'function') {
					context = pair[0];
					fn = pair[1];
					params = [];
				} else {
					fn = pair[0];
					params = pair[1];
				}			
			}
			
			// function, array, function
			if (pair.length == 3) {
				if (tof(pair[0]) == 'function' && tof(pair[1]) == 'array' && tof(pair[2]) == 'function') {
					fn = pair[0];
					params = pair[1];
					fn_callback = pair[2];
				}
				// object / data_object?
				// ?, function, array
				if (tof(pair[1]) == 'function' && tof(pair[2]) == 'array') {
					context = pair[0];
					fn = pair[1];
					params = pair[2];
				}
			}
			
			if (pair.length == 4) {
			    // context, function being called, params, cb
			    context = pair[0];
			    fn = pair[1];
			    params = pair[2];
			    fn_callback = pair[3];
			    
			    
			}
			
			var i = c;
			c++;
			
			var cb = function(err, res2) {
				//console.log('cb');
				if (err) {
					var stack = new Error().stack;
					console.log(stack);
					throw err;
				} else {
					if (return_params) {
						//console.log('return_params ' + return_params);
						//console.log('params ' + params);
						res[i] = [params, res2];
					} else {
						res[i] = res2;
					}
					//console.log('pair.length ' + pair.length);
					if (pair.length == 3) {
						fn_callback(null, res2);
					}
					if (pair.length == 4) {
						fn_callback(null, res2);
					}
					
					if (c < l) {
						process();
					} else {
						callback(null, res);
					}
				}
			}
			var arr_to_call = clone(params);
			
			arr_to_call.push(cb);
			if (context) {
				fn.apply(context, arr_to_call);
			} else {
				fn.apply(that, arr_to_call);
			}
		}
		
		process();
	});
	
	var native_constructor_tof = function(value) {
		if (value === String) {
			return 'String';
		}
		if (value === Number) {
			return 'Number';
		}
		if (value === Boolean) {
			return 'Boolean';
		}
		if (value === Array) {
			return 'Array';
		}
		if (value === Object) {
			return 'Object';
		}
	}
	
	
	// will put functions into the jsgui object.

	// with the functions listed like this it will be easier to document them.

	var jsgui = {
		'Class' : Class,
		'each' : each,
		'is_array' : is_array,
		'is_dom_node' : is_dom_node,
		'is_ctrl' : is_ctrl,
		'extend' : extend,
		'clone' : clone,
		//'x_clones' : x_clones,
		'get_truth_map_from_arr' : get_truth_map_from_arr,
		'arr_trim_undefined': arr_trim_undefined,
		'get_map_from_arr' : get_map_from_arr,
		'arr_like_to_arr' : arr_like_to_arr,
		'tof' : tof,
		'atof' : atof,
		'is_defined' : is_defined,
		'stringify' : stringify,
		'functional_polymorphism' : functional_polymorphism,
		'fp' : fp,
		'arrayify' : arrayify,
		'mapify' : mapify,
		'are_equal' : are_equal,
		'get_item_sig' : get_item_sig,
		'set_vals': set_vals,
		'truth': truth,
		'trim_sig_brackets' : trim_sig_brackets,
		'll_set': ll_set,
		'll_get': ll_get,
		'iterate_ancestor_classes': iterate_ancestor_classes,
		'is_constructor_fn': is_constructor_fn,
		'is_arr_of_t': is_arr_of_t,
		'is_arr_of_arrs': is_arr_of_arrs,
		'is_arr_of_strs': is_arr_of_strs,
		'input_processors': input_processors,
		'output_processors': output_processors,
		'call_multiple_callback_functions': call_multiple_callback_functions,
		'native_constructor_tof': native_constructor_tof
		//,
		//'output_processors': output_processors
	};

	
	// Maybe this will be moved to an intermediate layer.
	jsgui.data_types_info = jsgui.data_types_info || {};
	
	
	
	
	// and the local variable shortcuts that go at the beginning:
	
	/*
	 
	 var j = jsgui;
	 var Class = j.Class;
	 var each = j.each;
	 var is_array = j.is_array;
	 var is_dom_node = j.is_dom_node;
	 var is_ctrl = j.is_ctrl;
	 var extend = j.extend;
	 var x_clones = j.x_clones;
	 var get_truth_map_from_arr = j.get_truth_map_from_arr;
	 var get_map_from_arr = j.get_map_from_arr;
	 var arr_like_to_arr = j.arr_like_to_arr;
	 var tof = j.tof;
	 var is_defined = j.is_defined;
	 var stringify = j.stringify;
	 var functional_polymorphism = j.functional_polymorphism;
	 var fp = j.fp;
	 var arrayify = j.arrayify;
	 var mapify = j.mapify;
	 var are_equal = j.are_equal;
	 var get_item_sig = j.get_item_sig;
	 var set_vals = j.set_vals;
	 var truth = j.truth;
	 var trim_sig_brackets = j.trim_sig_brackets;
	 var ll_set = j.ll_set;
	 var ll_get = j.ll_get;
	 var is_constructor_fn = j.is_constructor_fn;
	 var is_arr_of_arrs = j.is_arr_of_arrs;
	 var is_arr_of_strs = j.is_arr_of_strs;
	 var is_arr_of_t = j.is_arr_of_t;
	 */
	
	
	// var jsgui = {};
	// alert('returning jsgui from jsgui-lang');
	return jsgui;

});