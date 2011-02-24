/* 
---

name: Class.PatternMutators

description: Pattern-Based Mutation for MooTools 1.3

license: MIT-style license.

copyright: Mark Obcena

requires: Class

provides: [Class.defineMutator, Class.define]

...
*/


(function(){

var matchers = [];

var lookup = function(key){
	var i = matchers.length;
	while (i--){
		var matcher = matchers[i],
			match = key.match(matcher);
		if (match) return ['$mutator:' + matcher, match.slice(1)];
	}
	return null;
};

Class.defineMutator = function(key, fn){
	if (typeOf(key) == 'regexp'){
		matchers.push(key);
		key = '$mutator:' + key;
		var _fn = fn;
		fn = function(values){
			return _fn.apply(this, values);
		};
	}
	Class.Mutators[key] = fn;
	return this;
};

var define = Class.prototype.implement;
Class.implement('define', define);

var implement = Class.prototype.implement = function(key, value, retain){
	var mutator = lookup(key);
	if (mutator){
		key = mutator.shift();
		mutator[0].unshift(value);
		value = mutator.shift();
	}
	return define.call(this, key, value, retain);
}.overloadSetter();

// Default Mutators
Class.defineMutator(/^protected\s(\w+)/, function(fn, name){
	this.define(name, fn.protect());
});

Class.defineMutator(/^linked\s(\w+)/, function(value, name){
	this.prototype[name] = value;
});

Class.defineMutator(/^static\s(\w+)/, function(fn, name){
	this.extend(name, fn);
});

// Reimplement "implement" in all classes..
for (var i in window){
	try {
		var klass = window[i];
		if (klass instanceof Function && typeOf(klass) == 'class'){
			klass.implement = implement;
			klass.define = define;
		}
	} catch(e){}
}

})();
