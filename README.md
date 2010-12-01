Pattern Mutators for MooTools
=============================

Provides pattern-based mutation for MooTools classes. Works with MooTools 1.3.


Pattern-Based What?
-------------------

In the current version of MooTools, [mutators][utmh4] are key-based: a particular key, such as `Extends` or `Implements`, is mapped directly to a mutator function in the `Class.Mutators` object. This limits mutators to a single invocation per class, which is totally acceptable though stiff.

Development versions of MooTools 2.0, however, introduced the concept of *pattern-based mutators*. Instead of mapping keys directly to mutator functions, the `Class` implementation of MooTools 2.0 checks the keys of a declaration against a set of patterns mutators. This makes it possible to apply a single mutator to several items in the declaration, and enables more idiomatic declarations.

Unfortunately, pattern mutators weren't included into 1.3. This extension, however, changes that.


Wow, So Cryptic!
----------------

The best way to understand pattern mutators is through an example. Let's say we have the following custom mutator:

	Class.Mutators.Protected = function(items){
		for (var fn in items) {
			if (items[fn] instanceof Function) items[fn].protect();
		}
		this.implement(items);
	};

This is a simple mutator that enables us to set protected methods in our class declarations. To use it, we have to define a `Protected` key in our declaration, like so:

	var MyClass = new Class({
	
		Protected: {
		
			hi: function(){
				console.log('Hi Universe!');
			}
			
		},

		hello: function(){
			console.log('Hello World!');
		}
		
	});

	var inst = new MyClass();
	inst.hello(); // 'Hello World!'
	inst.hi(); // Throws an error: 'The method "hi" cannot be called.'

We had to define a separate `Protected` key in this class declaration because mutators are mapped using the keys of a declaration. In this case, our `Protected` key is mapped to the `Class.Mutators.Protected` mutator function.

Pattern-based mutators, on the other hand, aren't mapped directly using keys. Instead, a pattern mutator defines a pattern using regular expressions to determine where it should be applied. Here's a pattern-based equivalent of our `Protected` mutator:

	Class.defineMutator(/^protected\s(\w+)/, function(fn, name){
		this.implement(name, fn.protect());
	});

This mutator has a pattern that states it should be applied to any key in a class declaration that start with `protected `. To use it, we simply have to change our keys:

	var MyClass = new Class({
	
		'protected hi': function(){
			console.log('Hi Universe!');
		},

		hello: function(){
			console.log('Hello World!');
		}
		
	});

	var inst = new MyClass();
	inst.hello(); // 'Hello World!'
	inst.hi(); // Throws an error: 'The method "hi" cannot be called.'

Instead of creating a separate `Protected` key in our class declaration, we simply added a `protected ` qualifier at the start of the method name. The effects, though, are the same as our previous declaration.


Class Static Method: defineMutator
----------------------------------

This extension provides a function, `Class.defineMutator`, that can be used to define both key-based and pattern-based mutators

### Syntax:

	Class.defineMutator(matcher, fn);

### Arguments:

1. `matcher` - (string) or (regexp) The matcher that will be checked against a class declaration. If you provide a string value, the mutator will be a key-based mutator; if you provide a regular expression value, the mutator will be a pattern-based mutator.
2. `fn` - (function) - The mutator function that will be invoked for the matching properties in a class declaration. This function will always be invoked with its `this` value bound to the current class.

### Argument: `fn`

**Syntax:**

	fn(value [, match1, match2, ..., matchN])

**Arguments:**

1. `value` - (mixed) The value of the particular property in the class declaration that matches the mutator criteria.
2. `matchN` - (mixed) For pattern mutators, the remaining arguments after the first `value` argument will be the captured matches from the mutator's regular expression.


Implementation Notes
--------------------

- This extension wraps the default `Class.prototype.implement` method in order to add the pattern-based mutator check. Internally, though, it still uses the default `implement` method in order to add the members to the class' `prototype`. The default `implement` method is reimplemented as `define`.
- Pattern mutators are tested in reverse: the last mutator declared will be the first one tested. This is due to the use of a reverse `while` loop to speed-up the matching process.
- Pattern mutators take precedence over key-based mutators, and a pattern mutator could be applied *together* with a key-based mutator in some cases.
- Several mutators can be used in a single key as long as the mutators use flexible regexp patterns and always invoke `implement` method.


Project Stuff
-------------

### Author and License

Mark "Keeto" Obcena <keetology.com>  
Copyright 2010, MIT-style License

### Credits

Original pattern-based mutator idea and code for the `protected` and `linked` mutators from Valerio Proietti via MooTools 2.0.


[utmh4]: http://keetology.com/blog/2009/10/27/up-the-moo-herd-iv-theres-a-class-for-this#mutator "Section on Mutators from Up The Moo Herd"
