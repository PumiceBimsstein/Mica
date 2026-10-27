(function(scope){
'use strict';

function F(arity, fun, wrapper) {
  wrapper.a = arity;
  wrapper.f = fun;
  return wrapper;
}

function F2(fun) {
  return F(2, fun, function(a) { return function(b) { return fun(a,b); }; })
}
function F3(fun) {
  return F(3, fun, function(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  });
}
function F4(fun) {
  return F(4, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  });
}
function F5(fun) {
  return F(5, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  });
}
function F6(fun) {
  return F(6, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  });
}
function F7(fun) {
  return F(7, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  });
}
function F8(fun) {
  return F(8, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  });
}
function F9(fun) {
  return F(9, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  });
}

function A2(fun, a, b) {
  return fun.a === 2 ? fun.f(a, b) : fun(a)(b);
}
function A3(fun, a, b, c) {
  return fun.a === 3 ? fun.f(a, b, c) : fun(a)(b)(c);
}
function A4(fun, a, b, c, d) {
  return fun.a === 4 ? fun.f(a, b, c, d) : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e) {
  return fun.a === 5 ? fun.f(a, b, c, d, e) : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f) {
  return fun.a === 6 ? fun.f(a, b, c, d, e, f) : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g) {
  return fun.a === 7 ? fun.f(a, b, c, d, e, f, g) : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h) {
  return fun.a === 8 ? fun.f(a, b, c, d, e, f, g, h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i) {
  return fun.a === 9 ? fun.f(a, b, c, d, e, f, g, h, i) : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}




// EQUALITY

function _Utils_eq(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

function _Utils_eqHelp(x, y, depth, stack)
{
	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object' || x === null || y === null)
	{
		typeof x === 'function' && _Debug_crash(5);
		return false;
	}

	if (depth > 100)
	{
		stack.push(_Utils_Tuple2(x,y));
		return true;
	}

	/**_UNUSED/
	if (x.$ === 'Set_elm_builtin')
	{
		x = $elm$core$Set$toList(x);
		y = $elm$core$Set$toList(y);
	}
	if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin')
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	/**/
	if (x.$ < 0)
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	for (var key in x)
	{
		if (!_Utils_eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

var _Utils_equal = F2(_Utils_eq);
var _Utils_notEqual = F2(function(a, b) { return !_Utils_eq(a,b); });



// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

function _Utils_cmp(x, y, ord)
{
	if (typeof x !== 'object')
	{
		return x === y ? /*EQ*/ 0 : x < y ? /*LT*/ -1 : /*GT*/ 1;
	}

	/**_UNUSED/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

	/**/
	if (typeof x.$ === 'undefined')
	//*/
	/**_UNUSED/
	if (x.$[0] === '#')
	//*/
	{
		return (ord = _Utils_cmp(x.a, y.a))
			? ord
			: (ord = _Utils_cmp(x.b, y.b))
				? ord
				: _Utils_cmp(x.c, y.c);
	}

	// traverse conses until end of a list or a mismatch
	for (; x.b && y.b && !(ord = _Utils_cmp(x.a, y.a)); x = x.b, y = y.b) {} // WHILE_CONSES
	return ord || (x.b ? /*GT*/ 1 : y.b ? /*LT*/ -1 : /*EQ*/ 0);
}

var _Utils_lt = F2(function(a, b) { return _Utils_cmp(a, b) < 0; });
var _Utils_le = F2(function(a, b) { return _Utils_cmp(a, b) < 1; });
var _Utils_gt = F2(function(a, b) { return _Utils_cmp(a, b) > 0; });
var _Utils_ge = F2(function(a, b) { return _Utils_cmp(a, b) >= 0; });

var _Utils_compare = F2(function(x, y)
{
	var n = _Utils_cmp(x, y);
	return n < 0 ? $elm$core$Basics$LT : n ? $elm$core$Basics$GT : $elm$core$Basics$EQ;
});


// COMMON VALUES

var _Utils_Tuple0 = 0;
var _Utils_Tuple0_UNUSED = { $: '#0' };

function _Utils_Tuple2(a, b) { return { a: a, b: b }; }
function _Utils_Tuple2_UNUSED(a, b) { return { $: '#2', a: a, b: b }; }

function _Utils_Tuple3(a, b, c) { return { a: a, b: b, c: c }; }
function _Utils_Tuple3_UNUSED(a, b, c) { return { $: '#3', a: a, b: b, c: c }; }

function _Utils_chr(c) { return c; }
function _Utils_chr_UNUSED(c) { return new String(c); }


// RECORDS

function _Utils_update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


// APPEND

var _Utils_append = F2(_Utils_ap);

function _Utils_ap(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (!xs.b)
	{
		return ys;
	}
	var root = _List_Cons(xs.a, ys);
	xs = xs.b
	for (var curr = root; xs.b; xs = xs.b) // WHILE_CONS
	{
		curr = curr.b = _List_Cons(xs.a, ys);
	}
	return root;
}



var _List_Nil = { $: 0 };
var _List_Nil_UNUSED = { $: '[]' };

function _List_Cons(hd, tl) { return { $: 1, a: hd, b: tl }; }
function _List_Cons_UNUSED(hd, tl) { return { $: '::', a: hd, b: tl }; }


var _List_cons = F2(_List_Cons);

function _List_fromArray(arr)
{
	var out = _List_Nil;
	for (var i = arr.length; i--; )
	{
		out = _List_Cons(arr[i], out);
	}
	return out;
}

function _List_toArray(xs)
{
	for (var out = []; xs.b; xs = xs.b) // WHILE_CONS
	{
		out.push(xs.a);
	}
	return out;
}

var _List_map2 = F3(function(f, xs, ys)
{
	for (var arr = []; xs.b && ys.b; xs = xs.b, ys = ys.b) // WHILE_CONSES
	{
		arr.push(A2(f, xs.a, ys.a));
	}
	return _List_fromArray(arr);
});

var _List_map3 = F4(function(f, xs, ys, zs)
{
	for (var arr = []; xs.b && ys.b && zs.b; xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A3(f, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map4 = F5(function(f, ws, xs, ys, zs)
{
	for (var arr = []; ws.b && xs.b && ys.b && zs.b; ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A4(f, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map5 = F6(function(f, vs, ws, xs, ys, zs)
{
	for (var arr = []; vs.b && ws.b && xs.b && ys.b && zs.b; vs = vs.b, ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A5(f, vs.a, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_sortBy = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		return _Utils_cmp(f(a), f(b));
	}));
});

var _List_sortWith = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		var ord = A2(f, a, b);
		return ord === $elm$core$Basics$EQ ? 0 : ord === $elm$core$Basics$LT ? -1 : 1;
	}));
});



var _JsArray_empty = [];

function _JsArray_singleton(value)
{
    return [value];
}

function _JsArray_length(array)
{
    return array.length;
}

var _JsArray_initialize = F3(function(size, offset, func)
{
    var result = new Array(size);

    for (var i = 0; i < size; i++)
    {
        result[i] = func(offset + i);
    }

    return result;
});

var _JsArray_initializeFromList = F2(function (max, ls)
{
    var result = new Array(max);

    for (var i = 0; i < max && ls.b; i++)
    {
        result[i] = ls.a;
        ls = ls.b;
    }

    result.length = i;
    return _Utils_Tuple2(result, ls);
});

var _JsArray_unsafeGet = F2(function(index, array)
{
    return array[index];
});

var _JsArray_unsafeSet = F3(function(index, value, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[index] = value;
    return result;
});

var _JsArray_push = F2(function(value, array)
{
    var length = array.length;
    var result = new Array(length + 1);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[length] = value;
    return result;
});

var _JsArray_foldl = F3(function(func, acc, array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_foldr = F3(function(func, acc, array)
{
    for (var i = array.length - 1; i >= 0; i--)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_map = F2(function(func, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(array[i]);
    }

    return result;
});

var _JsArray_indexedMap = F3(function(func, offset, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = A2(func, offset + i, array[i]);
    }

    return result;
});

var _JsArray_slice = F3(function(from, to, array)
{
    return array.slice(from, to);
});

var _JsArray_appendN = F3(function(n, dest, source)
{
    var destLen = dest.length;
    var itemsToCopy = n - destLen;

    if (itemsToCopy > source.length)
    {
        itemsToCopy = source.length;
    }

    var size = destLen + itemsToCopy;
    var result = new Array(size);

    for (var i = 0; i < destLen; i++)
    {
        result[i] = dest[i];
    }

    for (var i = 0; i < itemsToCopy; i++)
    {
        result[i + destLen] = source[i];
    }

    return result;
});



// LOG

var _Debug_log = F2(function(tag, value)
{
	return value;
});

var _Debug_log_UNUSED = F2(function(tag, value)
{
	console.log(tag + ': ' + _Debug_toString(value));
	return value;
});


// TODOS

function _Debug_todo(moduleName, region)
{
	return function(message) {
		_Debug_crash(8, moduleName, region, message);
	};
}

function _Debug_todoCase(moduleName, region, value)
{
	return function(message) {
		_Debug_crash(9, moduleName, region, value, message);
	};
}


// TO STRING

function _Debug_toString(value)
{
	return '<internals>';
}

function _Debug_toString_UNUSED(value)
{
	return _Debug_toAnsiString(false, value);
}

function _Debug_toAnsiString(ansi, value)
{
	if (typeof value === 'function')
	{
		return _Debug_internalColor(ansi, '<function>');
	}

	if (typeof value === 'boolean')
	{
		return _Debug_ctorColor(ansi, value ? 'True' : 'False');
	}

	if (typeof value === 'number')
	{
		return _Debug_numberColor(ansi, value + '');
	}

	if (value instanceof String)
	{
		return _Debug_charColor(ansi, "'" + _Debug_addSlashes(value, true) + "'");
	}

	if (typeof value === 'string')
	{
		return _Debug_stringColor(ansi, '"' + _Debug_addSlashes(value, false) + '"');
	}

	if (typeof value === 'object' && '$' in value)
	{
		var tag = value.$;

		if (typeof tag === 'number')
		{
			return _Debug_internalColor(ansi, '<internals>');
		}

		if (tag[0] === '#')
		{
			var output = [];
			for (var k in value)
			{
				if (k === '$') continue;
				output.push(_Debug_toAnsiString(ansi, value[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (tag === 'Set_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Set')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Set$toList(value));
		}

		if (tag === 'RBNode_elm_builtin' || tag === 'RBEmpty_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Dict')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Dict$toList(value));
		}

		if (tag === 'Array_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Array')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Array$toList(value));
		}

		if (tag === '::' || tag === '[]')
		{
			var output = '[';

			value.b && (output += _Debug_toAnsiString(ansi, value.a), value = value.b)

			for (; value.b; value = value.b) // WHILE_CONS
			{
				output += ',' + _Debug_toAnsiString(ansi, value.a);
			}
			return output + ']';
		}

		var output = '';
		for (var i in value)
		{
			if (i === '$') continue;
			var str = _Debug_toAnsiString(ansi, value[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '[' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return _Debug_ctorColor(ansi, tag) + output;
	}

	if (typeof DataView === 'function' && value instanceof DataView)
	{
		return _Debug_stringColor(ansi, '<' + value.byteLength + ' bytes>');
	}

	if (typeof File !== 'undefined' && value instanceof File)
	{
		return _Debug_internalColor(ansi, '<' + value.name + '>');
	}

	if (typeof value === 'object')
	{
		var output = [];
		for (var key in value)
		{
			var field = key[0] === '_' ? key.slice(1) : key;
			output.push(_Debug_fadeColor(ansi, field) + ' = ' + _Debug_toAnsiString(ansi, value[key]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return _Debug_internalColor(ansi, '<internals>');
}

function _Debug_addSlashes(str, isChar)
{
	var s = str
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(/\v/g, '\\v')
		.replace(/\0/g, '\\0');

	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}

function _Debug_ctorColor(ansi, string)
{
	return ansi ? '\x1b[96m' + string + '\x1b[0m' : string;
}

function _Debug_numberColor(ansi, string)
{
	return ansi ? '\x1b[95m' + string + '\x1b[0m' : string;
}

function _Debug_stringColor(ansi, string)
{
	return ansi ? '\x1b[93m' + string + '\x1b[0m' : string;
}

function _Debug_charColor(ansi, string)
{
	return ansi ? '\x1b[92m' + string + '\x1b[0m' : string;
}

function _Debug_fadeColor(ansi, string)
{
	return ansi ? '\x1b[37m' + string + '\x1b[0m' : string;
}

function _Debug_internalColor(ansi, string)
{
	return ansi ? '\x1b[36m' + string + '\x1b[0m' : string;
}

function _Debug_toHexDigit(n)
{
	return String.fromCharCode(n < 10 ? 48 + n : 55 + n);
}


// CRASH


function _Debug_crash(identifier)
{
	throw new Error('https://github.com/elm/core/blob/1.0.0/hints/' + identifier + '.md');
}


function _Debug_crash_UNUSED(identifier, fact1, fact2, fact3, fact4)
{
	switch(identifier)
	{
		case 0:
			throw new Error('What node should I take over? In JavaScript I need something like:\n\n    Elm.Main.init({\n        node: document.getElementById("elm-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.');

		case 1:
			throw new Error('Browser.application programs cannot handle URLs like this:\n\n    ' + document.location.href + '\n\nWhat is the root? The root of your file system? Try looking at this program with `elm reactor` or some other server.');

		case 2:
			var jsonErrorString = fact1;
			throw new Error('Problem with the flags given to your Elm program on initialization.\n\n' + jsonErrorString);

		case 3:
			var portName = fact1;
			throw new Error('There can only be one port named `' + portName + '`, but your program has multiple.');

		case 4:
			var portName = fact1;
			var problem = fact2;
			throw new Error('Trying to send an unexpected type of value through port `' + portName + '`:\n' + problem);

		case 5:
			throw new Error('Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Elm sense.\nRead more about this at https://package.elm-lang.org/packages/elm/core/latest/Basics#== which describes why it is this way and what the better version will look like.');

		case 6:
			var moduleName = fact1;
			throw new Error('Your page is loading multiple Elm scripts with a module named ' + moduleName + '. Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!');

		case 8:
			var moduleName = fact1;
			var region = fact2;
			var message = fact3;
			throw new Error('TODO in module `' + moduleName + '` ' + _Debug_regionToString(region) + '\n\n' + message);

		case 9:
			var moduleName = fact1;
			var region = fact2;
			var value = fact3;
			var message = fact4;
			throw new Error(
				'TODO in module `' + moduleName + '` from the `case` expression '
				+ _Debug_regionToString(region) + '\n\nIt received the following value:\n\n    '
				+ _Debug_toString(value).replace('\n', '\n    ')
				+ '\n\nBut the branch that handles it says:\n\n    ' + message.replace('\n', '\n    ')
			);

		case 10:
			throw new Error('Bug in https://github.com/elm/virtual-dom/issues');

		case 11:
			throw new Error('Cannot perform mod 0. Division by zero error.');
	}
}

function _Debug_regionToString(region)
{
	if (region._.F === region.ad.F)
	{
		return 'on line ' + region._.F;
	}
	return 'on lines ' + region._.F + ' through ' + region.ad.F;
}



// MATH

var _Basics_add = F2(function(a, b) { return a + b; });
var _Basics_sub = F2(function(a, b) { return a - b; });
var _Basics_mul = F2(function(a, b) { return a * b; });
var _Basics_fdiv = F2(function(a, b) { return a / b; });
var _Basics_idiv = F2(function(a, b) { return (a / b) | 0; });
var _Basics_pow = F2(Math.pow);

var _Basics_remainderBy = F2(function(b, a) { return a % b; });

// https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/divmodnote-letter.pdf
var _Basics_modBy = F2(function(modulus, x)
{
	var answer = x % modulus;
	return modulus === 0
		? _Debug_crash(11)
		:
	((answer > 0 && modulus < 0) || (answer < 0 && modulus > 0))
		? answer + modulus
		: answer;
});


// TRIGONOMETRY

var _Basics_pi = Math.PI;
var _Basics_e = Math.E;
var _Basics_cos = Math.cos;
var _Basics_sin = Math.sin;
var _Basics_tan = Math.tan;
var _Basics_acos = Math.acos;
var _Basics_asin = Math.asin;
var _Basics_atan = Math.atan;
var _Basics_atan2 = F2(Math.atan2);


// MORE MATH

function _Basics_toFloat(x) { return x; }
function _Basics_truncate(n) { return n | 0; }
function _Basics_isInfinite(n) { return n === Infinity || n === -Infinity; }

var _Basics_ceiling = Math.ceil;
var _Basics_floor = Math.floor;
var _Basics_round = Math.round;
var _Basics_sqrt = Math.sqrt;
var _Basics_log = Math.log;
var _Basics_isNaN = isNaN;


// BOOLEANS

function _Basics_not(bool) { return !bool; }
var _Basics_and = F2(function(a, b) { return a && b; });
var _Basics_or  = F2(function(a, b) { return a || b; });
var _Basics_xor = F2(function(a, b) { return a !== b; });



var _String_cons = F2(function(chr, str)
{
	return chr + str;
});

function _String_uncons(string)
{
	var word = string.charCodeAt(0);
	return !isNaN(word)
		? $elm$core$Maybe$Just(
			0xD800 <= word && word <= 0xDBFF
				? _Utils_Tuple2(_Utils_chr(string[0] + string[1]), string.slice(2))
				: _Utils_Tuple2(_Utils_chr(string[0]), string.slice(1))
		)
		: $elm$core$Maybe$Nothing;
}

var _String_append = F2(function(a, b)
{
	return a + b;
});

function _String_length(str)
{
	return str.length;
}

var _String_map = F2(function(func, string)
{
	var len = string.length;
	var array = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = string.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			array[i] = func(_Utils_chr(string[i] + string[i+1]));
			i += 2;
			continue;
		}
		array[i] = func(_Utils_chr(string[i]));
		i++;
	}
	return array.join('');
});

var _String_filter = F2(function(isGood, str)
{
	var arr = [];
	var len = str.length;
	var i = 0;
	while (i < len)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += str[i];
			i++;
		}

		if (isGood(_Utils_chr(char)))
		{
			arr.push(char);
		}
	}
	return arr.join('');
});

function _String_reverse(str)
{
	var len = str.length;
	var arr = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			arr[len - i] = str[i + 1];
			i++;
			arr[len - i] = str[i - 1];
			i++;
		}
		else
		{
			arr[len - i] = str[i];
			i++;
		}
	}
	return arr.join('');
}

var _String_foldl = F3(function(func, state, string)
{
	var len = string.length;
	var i = 0;
	while (i < len)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += string[i];
			i++;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_foldr = F3(function(func, state, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_split = F2(function(sep, str)
{
	return str.split(sep);
});

var _String_join = F2(function(sep, strs)
{
	return strs.join(sep);
});

var _String_slice = F3(function(start, end, str) {
	return str.slice(start, end);
});

function _String_trim(str)
{
	return str.trim();
}

function _String_trimLeft(str)
{
	return str.replace(/^\s+/, '');
}

function _String_trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function _String_words(str)
{
	return _List_fromArray(str.trim().split(/\s+/g));
}

function _String_lines(str)
{
	return _List_fromArray(str.split(/\r\n|\r|\n/g));
}

function _String_toUpper(str)
{
	return str.toUpperCase();
}

function _String_toLower(str)
{
	return str.toLowerCase();
}

var _String_any = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (isGood(_Utils_chr(char)))
		{
			return true;
		}
	}
	return false;
});

var _String_all = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (!isGood(_Utils_chr(char)))
		{
			return false;
		}
	}
	return true;
});

var _String_contains = F2(function(sub, str)
{
	return str.indexOf(sub) > -1;
});

var _String_startsWith = F2(function(sub, str)
{
	return str.indexOf(sub) === 0;
});

var _String_endsWith = F2(function(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
});

var _String_indexes = F2(function(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _List_Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _List_fromArray(is);
});


// TO STRING

function _String_fromNumber(number)
{
	return number + '';
}


// INT CONVERSIONS

function _String_toInt(str)
{
	var total = 0;
	var code0 = str.charCodeAt(0);
	var start = code0 == 0x2B /* + */ || code0 == 0x2D /* - */ ? 1 : 0;

	for (var i = start; i < str.length; ++i)
	{
		var code = str.charCodeAt(i);
		if (code < 0x30 || 0x39 < code)
		{
			return $elm$core$Maybe$Nothing;
		}
		total = 10 * total + code - 0x30;
	}

	return i == start
		? $elm$core$Maybe$Nothing
		: $elm$core$Maybe$Just(code0 == 0x2D ? -total : total);
}


// FLOAT CONVERSIONS

function _String_toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return $elm$core$Maybe$Nothing;
	}
	var n = +s;
	// faster isNaN check
	return n === n ? $elm$core$Maybe$Just(n) : $elm$core$Maybe$Nothing;
}

function _String_fromList(chars)
{
	return _List_toArray(chars).join('');
}




function _Char_toCode(char)
{
	var code = char.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF)
	{
		return (code - 0xD800) * 0x400 + char.charCodeAt(1) - 0xDC00 + 0x10000
	}
	return code;
}

function _Char_fromCode(code)
{
	return _Utils_chr(
		(code < 0 || 0x10FFFF < code)
			? '\uFFFD'
			:
		(code <= 0xFFFF)
			? String.fromCharCode(code)
			:
		(code -= 0x10000,
			String.fromCharCode(Math.floor(code / 0x400) + 0xD800, code % 0x400 + 0xDC00)
		)
	);
}

function _Char_toUpper(char)
{
	return _Utils_chr(char.toUpperCase());
}

function _Char_toLower(char)
{
	return _Utils_chr(char.toLowerCase());
}

function _Char_toLocaleUpper(char)
{
	return _Utils_chr(char.toLocaleUpperCase());
}

function _Char_toLocaleLower(char)
{
	return _Utils_chr(char.toLocaleLowerCase());
}



/**_UNUSED/
function _Json_errorToString(error)
{
	return $elm$json$Json$Decode$errorToString(error);
}
//*/


// CORE DECODERS

function _Json_succeed(msg)
{
	return {
		$: 0,
		a: msg
	};
}

function _Json_fail(msg)
{
	return {
		$: 1,
		a: msg
	};
}

function _Json_decodePrim(decoder)
{
	return { $: 2, b: decoder };
}

var _Json_decodeInt = _Json_decodePrim(function(value) {
	return (typeof value !== 'number')
		? _Json_expecting('an INT', value)
		:
	(-2147483647 < value && value < 2147483647 && (value | 0) === value)
		? $elm$core$Result$Ok(value)
		:
	(isFinite(value) && !(value % 1))
		? $elm$core$Result$Ok(value)
		: _Json_expecting('an INT', value);
});

var _Json_decodeBool = _Json_decodePrim(function(value) {
	return (typeof value === 'boolean')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a BOOL', value);
});

var _Json_decodeFloat = _Json_decodePrim(function(value) {
	return (typeof value === 'number')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a FLOAT', value);
});

var _Json_decodeValue = _Json_decodePrim(function(value) {
	return $elm$core$Result$Ok(_Json_wrap(value));
});

var _Json_decodeString = _Json_decodePrim(function(value) {
	return (typeof value === 'string')
		? $elm$core$Result$Ok(value)
		: (value instanceof String)
			? $elm$core$Result$Ok(value + '')
			: _Json_expecting('a STRING', value);
});

function _Json_decodeList(decoder) { return { $: 3, b: decoder }; }
function _Json_decodeArray(decoder) { return { $: 4, b: decoder }; }

function _Json_decodeNull(value) { return { $: 5, c: value }; }

var _Json_decodeField = F2(function(field, decoder)
{
	return {
		$: 6,
		d: field,
		b: decoder
	};
});

var _Json_decodeIndex = F2(function(index, decoder)
{
	return {
		$: 7,
		e: index,
		b: decoder
	};
});

function _Json_decodeKeyValuePairs(decoder)
{
	return {
		$: 8,
		b: decoder
	};
}

function _Json_mapMany(f, decoders)
{
	return {
		$: 9,
		f: f,
		g: decoders
	};
}

var _Json_andThen = F2(function(callback, decoder)
{
	return {
		$: 10,
		b: decoder,
		h: callback
	};
});

function _Json_oneOf(decoders)
{
	return {
		$: 11,
		g: decoders
	};
}


// DECODING OBJECTS

var _Json_map1 = F2(function(f, d1)
{
	return _Json_mapMany(f, [d1]);
});

var _Json_map2 = F3(function(f, d1, d2)
{
	return _Json_mapMany(f, [d1, d2]);
});

var _Json_map3 = F4(function(f, d1, d2, d3)
{
	return _Json_mapMany(f, [d1, d2, d3]);
});

var _Json_map4 = F5(function(f, d1, d2, d3, d4)
{
	return _Json_mapMany(f, [d1, d2, d3, d4]);
});

var _Json_map5 = F6(function(f, d1, d2, d3, d4, d5)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5]);
});

var _Json_map6 = F7(function(f, d1, d2, d3, d4, d5, d6)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6]);
});

var _Json_map7 = F8(function(f, d1, d2, d3, d4, d5, d6, d7)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
});

var _Json_map8 = F9(function(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
});


// DECODE

var _Json_runOnString = F2(function(decoder, string)
{
	try
	{
		var value = JSON.parse(string);
		return _Json_runHelp(decoder, value);
	}
	catch (e)
	{
		return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'This is not valid JSON! ' + e.message, _Json_wrap(string)));
	}
});

var _Json_run = F2(function(decoder, value)
{
	return _Json_runHelp(decoder, _Json_unwrap(value));
});

function _Json_runHelp(decoder, value)
{
	switch (decoder.$)
	{
		case 2:
			return decoder.b(value);

		case 5:
			return (value === null)
				? $elm$core$Result$Ok(decoder.c)
				: _Json_expecting('null', value);

		case 3:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('a LIST', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _List_fromArray);

		case 4:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _Json_toElmArray);

		case 6:
			var field = decoder.d;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return _Json_expecting('an OBJECT with a field named `' + field + '`', value);
			}
			var result = _Json_runHelp(decoder.b, value[field]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, field, result.a));

		case 7:
			var index = decoder.e;
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			if (index >= value.length)
			{
				return _Json_expecting('a LONGER array. Need index ' + index + ' but only see ' + value.length + ' entries', value);
			}
			var result = _Json_runHelp(decoder.b, value[index]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, index, result.a));

		case 8:
			if (typeof value !== 'object' || value === null || _Json_isArray(value))
			{
				return _Json_expecting('an OBJECT', value);
			}

			var keyValuePairs = _List_Nil;
			// TODO test perf of Object.keys and switch when support is good enough
			for (var key in value)
			{
				if (value.hasOwnProperty(key))
				{
					var result = _Json_runHelp(decoder.b, value[key]);
					if (!$elm$core$Result$isOk(result))
					{
						return $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, key, result.a));
					}
					keyValuePairs = _List_Cons(_Utils_Tuple2(key, result.a), keyValuePairs);
				}
			}
			return $elm$core$Result$Ok($elm$core$List$reverse(keyValuePairs));

		case 9:
			var answer = decoder.f;
			var decoders = decoder.g;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = _Json_runHelp(decoders[i], value);
				if (!$elm$core$Result$isOk(result))
				{
					return result;
				}
				answer = answer(result.a);
			}
			return $elm$core$Result$Ok(answer);

		case 10:
			var result = _Json_runHelp(decoder.b, value);
			return (!$elm$core$Result$isOk(result))
				? result
				: _Json_runHelp(decoder.h(result.a), value);

		case 11:
			var errors = _List_Nil;
			for (var temp = decoder.g; temp.b; temp = temp.b) // WHILE_CONS
			{
				var result = _Json_runHelp(temp.a, value);
				if ($elm$core$Result$isOk(result))
				{
					return result;
				}
				errors = _List_Cons(result.a, errors);
			}
			return $elm$core$Result$Err($elm$json$Json$Decode$OneOf($elm$core$List$reverse(errors)));

		case 1:
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, decoder.a, _Json_wrap(value)));

		case 0:
			return $elm$core$Result$Ok(decoder.a);
	}
}

function _Json_runArrayDecoder(decoder, value, toElmValue)
{
	var len = value.length;
	var array = new Array(len);
	for (var i = 0; i < len; i++)
	{
		var result = _Json_runHelp(decoder, value[i]);
		if (!$elm$core$Result$isOk(result))
		{
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, i, result.a));
		}
		array[i] = result.a;
	}
	return $elm$core$Result$Ok(toElmValue(array));
}

function _Json_isArray(value)
{
	return Array.isArray(value) || (typeof FileList !== 'undefined' && value instanceof FileList);
}

function _Json_toElmArray(array)
{
	return A2($elm$core$Array$initialize, array.length, function(i) { return array[i]; });
}

function _Json_expecting(type, value)
{
	return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'Expecting ' + type, _Json_wrap(value)));
}


// EQUALITY

function _Json_equality(x, y)
{
	if (x === y)
	{
		return true;
	}

	if (x.$ !== y.$)
	{
		return false;
	}

	switch (x.$)
	{
		case 0:
		case 1:
			return x.a === y.a;

		case 2:
			return x.b === y.b;

		case 5:
			return x.c === y.c;

		case 3:
		case 4:
		case 8:
			return _Json_equality(x.b, y.b);

		case 6:
			return x.d === y.d && _Json_equality(x.b, y.b);

		case 7:
			return x.e === y.e && _Json_equality(x.b, y.b);

		case 9:
			return x.f === y.f && _Json_listEquality(x.g, y.g);

		case 10:
			return x.h === y.h && _Json_equality(x.b, y.b);

		case 11:
			return _Json_listEquality(x.g, y.g);
	}
}

function _Json_listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!_Json_equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

var _Json_encode = F2(function(indentLevel, value)
{
	return JSON.stringify(_Json_unwrap(value), null, indentLevel) + '';
});

function _Json_wrap_UNUSED(value) { return { $: 0, a: value }; }
function _Json_unwrap_UNUSED(value) { return value.a; }

function _Json_wrap(value) { return value; }
function _Json_unwrap(value) { return value; }

function _Json_emptyArray() { return []; }
function _Json_emptyObject() { return {}; }

var _Json_addField = F3(function(key, value, object)
{
	object[key] = _Json_unwrap(value);
	return object;
});

function _Json_addEntry(func)
{
	return F2(function(entry, array)
	{
		array.push(_Json_unwrap(func(entry)));
		return array;
	});
}

var _Json_encodeNull = _Json_wrap(null);



// TASKS

function _Scheduler_succeed(value)
{
	return {
		$: 0,
		a: value
	};
}

function _Scheduler_fail(error)
{
	return {
		$: 1,
		a: error
	};
}

function _Scheduler_binding(callback)
{
	return {
		$: 2,
		b: callback,
		c: null
	};
}

var _Scheduler_andThen = F2(function(callback, task)
{
	return {
		$: 3,
		b: callback,
		d: task
	};
});

var _Scheduler_onError = F2(function(callback, task)
{
	return {
		$: 4,
		b: callback,
		d: task
	};
});

function _Scheduler_receive(callback)
{
	return {
		$: 5,
		b: callback
	};
}


// PROCESSES

var _Scheduler_guid = 0;

function _Scheduler_rawSpawn(task)
{
	var proc = {
		$: 0,
		e: _Scheduler_guid++,
		f: task,
		g: null,
		h: []
	};

	_Scheduler_enqueue(proc);

	return proc;
}

function _Scheduler_spawn(task)
{
	return _Scheduler_binding(function(callback) {
		callback(_Scheduler_succeed(_Scheduler_rawSpawn(task)));
	});
}

function _Scheduler_rawSend(proc, msg)
{
	proc.h.push(msg);
	_Scheduler_enqueue(proc);
}

var _Scheduler_send = F2(function(proc, msg)
{
	return _Scheduler_binding(function(callback) {
		_Scheduler_rawSend(proc, msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});

function _Scheduler_kill(proc)
{
	return _Scheduler_binding(function(callback) {
		var task = proc.f;
		if (task.$ === 2 && task.c)
		{
			task.c();
		}

		proc.f = null;

		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
}


/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/


var _Scheduler_working = false;
var _Scheduler_queue = [];


function _Scheduler_enqueue(proc)
{
	_Scheduler_queue.push(proc);
	if (_Scheduler_working)
	{
		return;
	}
	_Scheduler_working = true;
	while (proc = _Scheduler_queue.shift())
	{
		_Scheduler_step(proc);
	}
	_Scheduler_working = false;
}


function _Scheduler_step(proc)
{
	while (proc.f)
	{
		var rootTag = proc.f.$;
		if (rootTag === 0 || rootTag === 1)
		{
			while (proc.g && proc.g.$ !== rootTag)
			{
				proc.g = proc.g.i;
			}
			if (!proc.g)
			{
				return;
			}
			proc.f = proc.g.b(proc.f.a);
			proc.g = proc.g.i;
		}
		else if (rootTag === 2)
		{
			proc.f.c = proc.f.b(function(newRoot) {
				proc.f = newRoot;
				_Scheduler_enqueue(proc);
			});
			return;
		}
		else if (rootTag === 5)
		{
			if (proc.h.length === 0)
			{
				return;
			}
			proc.f = proc.f.b(proc.h.shift());
		}
		else // if (rootTag === 3 || rootTag === 4)
		{
			proc.g = {
				$: rootTag === 3 ? 0 : 1,
				b: proc.f.b,
				i: proc.g
			};
			proc.f = proc.f.d;
		}
	}
}



function _Process_sleep(time)
{
	return _Scheduler_binding(function(callback) {
		var id = setTimeout(function() {
			callback(_Scheduler_succeed(_Utils_Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}




// PROGRAMS


var _Platform_worker = F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.a7,
		impl.bC,
		impl.bv,
		function() { return function() {} }
	);
});



// INITIALIZE A PROGRAM


function _Platform_initialize(flagDecoder, args, init, update, subscriptions, stepperBuilder)
{
	var result = A2(_Json_run, flagDecoder, _Json_wrap(args ? args['flags'] : undefined));
	$elm$core$Result$isOk(result) || _Debug_crash(2 /**_UNUSED/, _Json_errorToString(result.a) /**/);
	var managers = {};
	var initPair = init(result.a);
	var model = initPair.a;
	var stepper = stepperBuilder(sendToApp, model);
	var ports = _Platform_setupEffects(managers, sendToApp);

	function sendToApp(msg, viewMetadata)
	{
		var pair = A2(update, msg, model);
		stepper(model = pair.a, viewMetadata);
		_Platform_enqueueEffects(managers, pair.b, subscriptions(model));
	}

	_Platform_enqueueEffects(managers, initPair.b, subscriptions(model));

	return ports ? { ports: ports } : {};
}



// TRACK PRELOADS
//
// This is used by code in elm/browser and elm/http
// to register any HTTP requests that are triggered by init.
//


var _Platform_preload;


function _Platform_registerPreload(url)
{
	_Platform_preload.add(url);
}



// EFFECT MANAGERS


var _Platform_effectManagers = {};


function _Platform_setupEffects(managers, sendToApp)
{
	var ports;

	// setup all necessary effect managers
	for (var key in _Platform_effectManagers)
	{
		var manager = _Platform_effectManagers[key];

		if (manager.a)
		{
			ports = ports || {};
			ports[key] = manager.a(key, sendToApp);
		}

		managers[key] = _Platform_instantiateManager(manager, sendToApp);
	}

	return ports;
}


function _Platform_createManager(init, onEffects, onSelfMsg, cmdMap, subMap)
{
	return {
		b: init,
		c: onEffects,
		d: onSelfMsg,
		e: cmdMap,
		f: subMap
	};
}


function _Platform_instantiateManager(info, sendToApp)
{
	var router = {
		g: sendToApp,
		h: undefined
	};

	var onEffects = info.c;
	var onSelfMsg = info.d;
	var cmdMap = info.e;
	var subMap = info.f;

	function loop(state)
	{
		return A2(_Scheduler_andThen, loop, _Scheduler_receive(function(msg)
		{
			var value = msg.a;

			if (msg.$ === 0)
			{
				return A3(onSelfMsg, router, value, state);
			}

			return cmdMap && subMap
				? A4(onEffects, router, value.i, value.j, state)
				: A3(onEffects, router, cmdMap ? value.i : value.j, state);
		}));
	}

	return router.h = _Scheduler_rawSpawn(A2(_Scheduler_andThen, loop, info.b));
}



// ROUTING


var _Platform_sendToApp = F2(function(router, msg)
{
	return _Scheduler_binding(function(callback)
	{
		router.g(msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});


var _Platform_sendToSelf = F2(function(router, msg)
{
	return A2(_Scheduler_send, router.h, {
		$: 0,
		a: msg
	});
});



// BAGS


function _Platform_leaf(home)
{
	return function(value)
	{
		return {
			$: 1,
			k: home,
			l: value
		};
	};
}


function _Platform_batch(list)
{
	return {
		$: 2,
		m: list
	};
}


var _Platform_map = F2(function(tagger, bag)
{
	return {
		$: 3,
		n: tagger,
		o: bag
	}
});



// PIPE BAGS INTO EFFECT MANAGERS
//
// Effects must be queued!
//
// Say your init contains a synchronous command, like Time.now or Time.here
//
//   - This will produce a batch of effects (FX_1)
//   - The synchronous task triggers the subsequent `update` call
//   - This will produce a batch of effects (FX_2)
//
// If we just start dispatching FX_2, subscriptions from FX_2 can be processed
// before subscriptions from FX_1. No good! Earlier versions of this code had
// this problem, leading to these reports:
//
//   https://github.com/elm/core/issues/980
//   https://github.com/elm/core/pull/981
//   https://github.com/elm/compiler/issues/1776
//
// The queue is necessary to avoid ordering issues for synchronous commands.


// Why use true/false here? Why not just check the length of the queue?
// The goal is to detect "are we currently dispatching effects?" If we
// are, we need to bail and let the ongoing while loop handle things.
//
// Now say the queue has 1 element. When we dequeue the final element,
// the queue will be empty, but we are still actively dispatching effects.
// So you could get queue jumping in a really tricky category of cases.
//
var _Platform_effectsQueue = [];
var _Platform_effectsActive = false;


function _Platform_enqueueEffects(managers, cmdBag, subBag)
{
	_Platform_effectsQueue.push({ p: managers, q: cmdBag, r: subBag });

	if (_Platform_effectsActive) return;

	_Platform_effectsActive = true;
	for (var fx; fx = _Platform_effectsQueue.shift(); )
	{
		_Platform_dispatchEffects(fx.p, fx.q, fx.r);
	}
	_Platform_effectsActive = false;
}


function _Platform_dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	_Platform_gatherEffects(true, cmdBag, effectsDict, null);
	_Platform_gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		_Scheduler_rawSend(managers[home], {
			$: 'fx',
			a: effectsDict[home] || { i: _List_Nil, j: _List_Nil }
		});
	}
}


function _Platform_gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.$)
	{
		case 1:
			var home = bag.k;
			var effect = _Platform_toEffect(isCmd, home, taggers, bag.l);
			effectsDict[home] = _Platform_insert(isCmd, effect, effectsDict[home]);
			return;

		case 2:
			for (var list = bag.m; list.b; list = list.b) // WHILE_CONS
			{
				_Platform_gatherEffects(isCmd, list.a, effectsDict, taggers);
			}
			return;

		case 3:
			_Platform_gatherEffects(isCmd, bag.o, effectsDict, {
				s: bag.n,
				t: taggers
			});
			return;
	}
}


function _Platform_toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		for (var temp = taggers; temp; temp = temp.t)
		{
			x = temp.s(x);
		}
		return x;
	}

	var map = isCmd
		? _Platform_effectManagers[home].e
		: _Platform_effectManagers[home].f;

	return A2(map, applyTaggers, value)
}


function _Platform_insert(isCmd, newEffect, effects)
{
	effects = effects || { i: _List_Nil, j: _List_Nil };

	isCmd
		? (effects.i = _List_Cons(newEffect, effects.i))
		: (effects.j = _List_Cons(newEffect, effects.j));

	return effects;
}



// PORTS


function _Platform_checkPortName(name)
{
	if (_Platform_effectManagers[name])
	{
		_Debug_crash(3, name)
	}
}



// OUTGOING PORTS


function _Platform_outgoingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		e: _Platform_outgoingPortMap,
		u: converter,
		a: _Platform_setupOutgoingPort
	};
	return _Platform_leaf(name);
}


var _Platform_outgoingPortMap = F2(function(tagger, value) { return value; });


function _Platform_setupOutgoingPort(name)
{
	var subs = [];
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Process_sleep(0);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, cmdList, state)
	{
		for ( ; cmdList.b; cmdList = cmdList.b) // WHILE_CONS
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = _Json_unwrap(converter(cmdList.a));
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
		}
		return init;
	});

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}



// INCOMING PORTS


function _Platform_incomingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		f: _Platform_incomingPortMap,
		u: converter,
		a: _Platform_setupIncomingPort
	};
	return _Platform_leaf(name);
}


var _Platform_incomingPortMap = F2(function(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});


function _Platform_setupIncomingPort(name, sendToApp)
{
	var subs = _List_Nil;
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Scheduler_succeed(null);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, subList, state)
	{
		subs = subList;
		return init;
	});

	// PUBLIC API

	function send(incomingValue)
	{
		var result = A2(_Json_run, converter, _Json_wrap(incomingValue));

		$elm$core$Result$isOk(result) || _Debug_crash(4, name, result.a);

		var value = result.a;
		for (var temp = subs; temp.b; temp = temp.b) // WHILE_CONS
		{
			sendToApp(temp.a(value));
		}
	}

	return { send: send };
}



// EXPORT ELM MODULES
//
// Have DEBUG and PROD versions so that we can (1) give nicer errors in
// debug mode and (2) not pay for the bits needed for that in prod mode.
//


function _Platform_export(exports)
{
	scope['Elm']
		? _Platform_mergeExportsProd(scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsProd(obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6)
				: _Platform_mergeExportsProd(obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}


function _Platform_export_UNUSED(exports)
{
	scope['Elm']
		? _Platform_mergeExportsDebug('Elm', scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsDebug(moduleName, obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6, moduleName)
				: _Platform_mergeExportsDebug(moduleName + '.' + name, obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}




// HELPERS


var _VirtualDom_divertHrefToApp;

var _VirtualDom_doc = typeof document !== 'undefined' ? document : {};


function _VirtualDom_appendChild(parent, child)
{
	parent.appendChild(child);
}

var _VirtualDom_init = F4(function(virtualNode, flagDecoder, debugMetadata, args)
{
	// NOTE: this function needs _Platform_export available to work

	/**/
	var node = args['node'];
	//*/
	/**_UNUSED/
	var node = args && args['node'] ? args['node'] : _Debug_crash(0);
	//*/

	node.parentNode.replaceChild(
		_VirtualDom_render(virtualNode, function() {}),
		node
	);

	return {};
});



// TEXT


function _VirtualDom_text(string)
{
	return {
		$: 0,
		a: string
	};
}



// NODE


var _VirtualDom_nodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 1,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_node = _VirtualDom_nodeNS(undefined);



// KEYED NODE


var _VirtualDom_keyedNodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 2,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_keyedNode = _VirtualDom_keyedNodeNS(undefined);



// CUSTOM


function _VirtualDom_custom(factList, model, render, diff)
{
	return {
		$: 3,
		d: _VirtualDom_organizeFacts(factList),
		g: model,
		h: render,
		i: diff
	};
}



// MAP


var _VirtualDom_map = F2(function(tagger, node)
{
	return {
		$: 4,
		j: tagger,
		k: node,
		b: 1 + (node.b || 0)
	};
});



// LAZY


function _VirtualDom_thunk(refs, thunk)
{
	return {
		$: 5,
		l: refs,
		m: thunk,
		k: undefined
	};
}

var _VirtualDom_lazy = F2(function(func, a)
{
	return _VirtualDom_thunk([func, a], function() {
		return func(a);
	});
});

var _VirtualDom_lazy2 = F3(function(func, a, b)
{
	return _VirtualDom_thunk([func, a, b], function() {
		return A2(func, a, b);
	});
});

var _VirtualDom_lazy3 = F4(function(func, a, b, c)
{
	return _VirtualDom_thunk([func, a, b, c], function() {
		return A3(func, a, b, c);
	});
});

var _VirtualDom_lazy4 = F5(function(func, a, b, c, d)
{
	return _VirtualDom_thunk([func, a, b, c, d], function() {
		return A4(func, a, b, c, d);
	});
});

var _VirtualDom_lazy5 = F6(function(func, a, b, c, d, e)
{
	return _VirtualDom_thunk([func, a, b, c, d, e], function() {
		return A5(func, a, b, c, d, e);
	});
});

var _VirtualDom_lazy6 = F7(function(func, a, b, c, d, e, f)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f], function() {
		return A6(func, a, b, c, d, e, f);
	});
});

var _VirtualDom_lazy7 = F8(function(func, a, b, c, d, e, f, g)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g], function() {
		return A7(func, a, b, c, d, e, f, g);
	});
});

var _VirtualDom_lazy8 = F9(function(func, a, b, c, d, e, f, g, h)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g, h], function() {
		return A8(func, a, b, c, d, e, f, g, h);
	});
});



// FACTS


var _VirtualDom_on = F2(function(key, handler)
{
	return {
		$: 'a0',
		n: key,
		o: handler
	};
});
var _VirtualDom_style = F2(function(key, value)
{
	return {
		$: 'a1',
		n: key,
		o: value
	};
});
var _VirtualDom_property = F2(function(key, value)
{
	return {
		$: 'a2',
		n: key,
		o: value
	};
});
var _VirtualDom_attribute = F2(function(key, value)
{
	return {
		$: 'a3',
		n: key,
		o: value
	};
});
var _VirtualDom_attributeNS = F3(function(namespace, key, value)
{
	return {
		$: 'a4',
		n: key,
		o: { f: namespace, o: value }
	};
});



// XSS ATTACK VECTOR CHECKS
//
// For some reason, tabs can appear in href protocols and it still works.
// So '\tjava\tSCRIPT:alert("!!!")' and 'javascript:alert("!!!")' are the same
// in practice. That is why _VirtualDom_RE_js and _VirtualDom_RE_js_html look
// so freaky.
//
// Pulling the regular expressions out to the top level gives a slight speed
// boost in small benchmarks (4-10%) but hoisting values to reduce allocation
// can be unpredictable in large programs where JIT may have a harder time with
// functions are not fully self-contained. The benefit is more that the js and
// js_html ones are so weird that I prefer to see them near each other.


var _VirtualDom_RE_script = /^script$/i;
var _VirtualDom_RE_on_formAction = /^(on|formAction$)/i;
var _VirtualDom_RE_js = /^\s*j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/i;
var _VirtualDom_RE_js_html = /^\s*(j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:|d\s*a\s*t\s*a\s*:\s*t\s*e\s*x\s*t\s*\/\s*h\s*t\s*m\s*l\s*(,|;))/i;


function _VirtualDom_noScript(tag)
{
	return _VirtualDom_RE_script.test(tag) ? 'p' : tag;
}

function _VirtualDom_noOnOrFormAction(key)
{
	return _VirtualDom_RE_on_formAction.test(key) ? 'data-' + key : key;
}

function _VirtualDom_noInnerHtmlOrFormAction(key)
{
	return key == 'innerHTML' || key == 'formAction' ? 'data-' + key : key;
}

function _VirtualDom_noJavaScriptUri(value)
{
	return _VirtualDom_RE_js.test(value)
		? /**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value)
{
	return _VirtualDom_RE_js_html.test(value)
		? /**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlJson(value)
{
	return (typeof _Json_unwrap(value) === 'string' && _VirtualDom_RE_js_html.test(_Json_unwrap(value)))
		? _Json_wrap(
			/**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		) : value;
}



// MAP FACTS


var _VirtualDom_mapAttribute = F2(function(func, attr)
{
	return (attr.$ === 'a0')
		? A2(_VirtualDom_on, attr.n, _VirtualDom_mapHandler(func, attr.o))
		: attr;
});

function _VirtualDom_mapHandler(func, handler)
{
	var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

	// 0 = Normal
	// 1 = MayStopPropagation
	// 2 = MayPreventDefault
	// 3 = Custom

	return {
		$: handler.$,
		a:
			!tag
				? A2($elm$json$Json$Decode$map, func, handler.a)
				:
			A3($elm$json$Json$Decode$map2,
				tag < 3
					? _VirtualDom_mapEventTuple
					: _VirtualDom_mapEventRecord,
				$elm$json$Json$Decode$succeed(func),
				handler.a
			)
	};
}

var _VirtualDom_mapEventTuple = F2(function(func, tuple)
{
	return _Utils_Tuple2(func(tuple.a), tuple.b);
});

var _VirtualDom_mapEventRecord = F2(function(func, record)
{
	return {
		O: func(record.O),
		R: record.R,
		Q: record.Q
	}
});



// ORGANIZE FACTS


function _VirtualDom_organizeFacts(factList)
{
	for (var facts = {}; factList.b; factList = factList.b) // WHILE_CONS
	{
		var entry = factList.a;

		var tag = entry.$;
		var key = entry.n;
		var value = entry.o;

		if (tag === 'a2')
		{
			(key === 'className')
				? _VirtualDom_addClass(facts, key, _Json_unwrap(value))
				: facts[key] = _Json_unwrap(value);

			continue;
		}

		var subFacts = facts[tag] || (facts[tag] = {});
		(tag === 'a3' && key === 'class')
			? _VirtualDom_addClass(subFacts, key, value)
			: subFacts[key] = value;
	}

	return facts;
}

function _VirtualDom_addClass(object, key, newClass)
{
	var classes = object[key];
	object[key] = classes ? classes + ' ' + newClass : newClass;
}



// RENDER


function _VirtualDom_render(vNode, eventNode)
{
	var tag = vNode.$;

	if (tag === 5)
	{
		return _VirtualDom_render(vNode.k || (vNode.k = vNode.m()), eventNode);
	}

	if (tag === 0)
	{
		return _VirtualDom_doc.createTextNode(vNode.a);
	}

	if (tag === 4)
	{
		var subNode = vNode.k;
		var tagger = vNode.j;

		while (subNode.$ === 4)
		{
			typeof tagger !== 'object'
				? tagger = [tagger, subNode.j]
				: tagger.push(subNode.j);

			subNode = subNode.k;
		}

		var subEventRoot = { j: tagger, p: eventNode };
		var domNode = _VirtualDom_render(subNode, subEventRoot);
		domNode.elm_event_node_ref = subEventRoot;
		return domNode;
	}

	if (tag === 3)
	{
		var domNode = vNode.h(vNode.g);
		_VirtualDom_applyFacts(domNode, eventNode, vNode.d);
		return domNode;
	}

	// at this point `tag` must be 1 or 2

	var domNode = vNode.f
		? _VirtualDom_doc.createElementNS(vNode.f, vNode.c)
		: _VirtualDom_doc.createElement(vNode.c);

	if (_VirtualDom_divertHrefToApp && vNode.c == 'a')
	{
		domNode.addEventListener('click', _VirtualDom_divertHrefToApp(domNode));
	}

	_VirtualDom_applyFacts(domNode, eventNode, vNode.d);

	for (var kids = vNode.e, i = 0; i < kids.length; i++)
	{
		_VirtualDom_appendChild(domNode, _VirtualDom_render(tag === 1 ? kids[i] : kids[i].b, eventNode));
	}

	return domNode;
}



// APPLY FACTS


function _VirtualDom_applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		key === 'a1'
			? _VirtualDom_applyStyles(domNode, value)
			:
		key === 'a0'
			? _VirtualDom_applyEvents(domNode, eventNode, value)
			:
		key === 'a3'
			? _VirtualDom_applyAttrs(domNode, value)
			:
		key === 'a4'
			? _VirtualDom_applyAttrsNS(domNode, value)
			:
		((key !== 'value' && key !== 'checked') || domNode[key] !== value) && (domNode[key] = value);
	}
}



// APPLY STYLES


function _VirtualDom_applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}



// APPLY ATTRS


function _VirtualDom_applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		typeof value !== 'undefined'
			? domNode.setAttribute(key, value)
			: domNode.removeAttribute(key);
	}
}



// APPLY NAMESPACED ATTRS


function _VirtualDom_applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.f;
		var value = pair.o;

		typeof value !== 'undefined'
			? domNode.setAttributeNS(namespace, key, value)
			: domNode.removeAttributeNS(namespace, key);
	}
}



// APPLY EVENTS


function _VirtualDom_applyEvents(domNode, eventNode, events)
{
	var allCallbacks = domNode.elmFs || (domNode.elmFs = {});

	for (var key in events)
	{
		var newHandler = events[key];
		var oldCallback = allCallbacks[key];

		if (!newHandler)
		{
			domNode.removeEventListener(key, oldCallback);
			allCallbacks[key] = undefined;
			continue;
		}

		if (oldCallback)
		{
			var oldHandler = oldCallback.q;
			if (oldHandler.$ === newHandler.$)
			{
				oldCallback.q = newHandler;
				continue;
			}
			domNode.removeEventListener(key, oldCallback);
		}

		oldCallback = _VirtualDom_makeCallback(eventNode, newHandler);
		domNode.addEventListener(key, oldCallback,
			_VirtualDom_passiveSupported
			&& { passive: $elm$virtual_dom$VirtualDom$toHandlerInt(newHandler) < 2 }
		);
		allCallbacks[key] = oldCallback;
	}
}



// PASSIVE EVENTS


var _VirtualDom_passiveSupported;

try
{
	window.addEventListener('t', null, Object.defineProperty({}, 'passive', {
		get: function() { _VirtualDom_passiveSupported = true; }
	}));
}
catch(e) {}



// EVENT HANDLERS


function _VirtualDom_makeCallback(eventNode, initialHandler)
{
	function callback(event)
	{
		var handler = callback.q;
		var result = _Json_runHelp(handler.a, event);

		if (!$elm$core$Result$isOk(result))
		{
			return;
		}

		var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

		// 0 = Normal
		// 1 = MayStopPropagation
		// 2 = MayPreventDefault
		// 3 = Custom

		var value = result.a;
		var message = !tag ? value : tag < 3 ? value.a : value.O;
		var stopPropagation = tag == 1 ? value.b : tag == 3 && value.R;
		var currentEventNode = (
			stopPropagation && event.stopPropagation(),
			(tag == 2 ? value.b : tag == 3 && value.Q) && event.preventDefault(),
			eventNode
		);
		var tagger;
		var i;
		while (tagger = currentEventNode.j)
		{
			if (typeof tagger == 'function')
			{
				message = tagger(message);
			}
			else
			{
				for (var i = tagger.length; i--; )
				{
					message = tagger[i](message);
				}
			}
			currentEventNode = currentEventNode.p;
		}
		currentEventNode(message, stopPropagation); // stopPropagation implies isSync
	}

	callback.q = initialHandler;

	return callback;
}

function _VirtualDom_equalEvents(x, y)
{
	return x.$ == y.$ && _Json_equality(x.a, y.a);
}



// DIFF


// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
function _VirtualDom_diff(x, y)
{
	var patches = [];
	_VirtualDom_diffHelp(x, y, patches, 0);
	return patches;
}


function _VirtualDom_pushPatch(patches, type, index, data)
{
	var patch = {
		$: type,
		r: index,
		s: data,
		t: undefined,
		u: undefined
	};
	patches.push(patch);
	return patch;
}


function _VirtualDom_diffHelp(x, y, patches, index)
{
	if (x === y)
	{
		return;
	}

	var xType = x.$;
	var yType = y.$;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (xType !== yType)
	{
		if (xType === 1 && yType === 2)
		{
			y = _VirtualDom_dekey(y);
			yType = 1;
		}
		else
		{
			_VirtualDom_pushPatch(patches, 0, index, y);
			return;
		}
	}

	// Now we know that both nodes are the same $.
	switch (yType)
	{
		case 5:
			var xRefs = x.l;
			var yRefs = y.l;
			var i = xRefs.length;
			var same = i === yRefs.length;
			while (same && i--)
			{
				same = xRefs[i] === yRefs[i];
			}
			if (same)
			{
				y.k = x.k;
				return;
			}
			y.k = y.m();
			var subPatches = [];
			_VirtualDom_diffHelp(x.k, y.k, subPatches, 0);
			subPatches.length > 0 && _VirtualDom_pushPatch(patches, 1, index, subPatches);
			return;

		case 4:
			// gather nested taggers
			var xTaggers = x.j;
			var yTaggers = y.j;
			var nesting = false;

			var xSubNode = x.k;
			while (xSubNode.$ === 4)
			{
				nesting = true;

				typeof xTaggers !== 'object'
					? xTaggers = [xTaggers, xSubNode.j]
					: xTaggers.push(xSubNode.j);

				xSubNode = xSubNode.k;
			}

			var ySubNode = y.k;
			while (ySubNode.$ === 4)
			{
				nesting = true;

				typeof yTaggers !== 'object'
					? yTaggers = [yTaggers, ySubNode.j]
					: yTaggers.push(ySubNode.j);

				ySubNode = ySubNode.k;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && xTaggers.length !== yTaggers.length)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !_VirtualDom_pairwiseRefEqual(xTaggers, yTaggers) : xTaggers !== yTaggers)
			{
				_VirtualDom_pushPatch(patches, 2, index, yTaggers);
			}

			// diff everything below the taggers
			_VirtualDom_diffHelp(xSubNode, ySubNode, patches, index + 1);
			return;

		case 0:
			if (x.a !== y.a)
			{
				_VirtualDom_pushPatch(patches, 3, index, y.a);
			}
			return;

		case 1:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKids);
			return;

		case 2:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKeyedKids);
			return;

		case 3:
			if (x.h !== y.h)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
			factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

			var patch = y.i(x.g, y.g);
			patch && _VirtualDom_pushPatch(patches, 5, index, patch);

			return;
	}
}

// assumes the incoming arrays are the same length
function _VirtualDom_pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}

function _VirtualDom_diffNodes(x, y, patches, index, diffKids)
{
	// Bail if obvious indicators have changed. Implies more serious
	// structural changes such that it's not worth it to diff.
	if (x.c !== y.c || x.f !== y.f)
	{
		_VirtualDom_pushPatch(patches, 0, index, y);
		return;
	}

	var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
	factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

	diffKids(x, y, patches, index);
}



// DIFF FACTS


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function _VirtualDom_diffFacts(x, y, category)
{
	var diff;

	// look for changes and removals
	for (var xKey in x)
	{
		if (xKey === 'a1' || xKey === 'a0' || xKey === 'a3' || xKey === 'a4')
		{
			var subDiff = _VirtualDom_diffFacts(x[xKey], y[xKey] || {}, xKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[xKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(xKey in y))
		{
			diff = diff || {};
			diff[xKey] =
				!category
					? (typeof x[xKey] === 'string' ? '' : null)
					:
				(category === 'a1')
					? ''
					:
				(category === 'a0' || category === 'a3')
					? undefined
					:
				{ f: x[xKey].f, o: undefined };

			continue;
		}

		var xValue = x[xKey];
		var yValue = y[xKey];

		// reference equal, so don't worry about it
		if (xValue === yValue && xKey !== 'value' && xKey !== 'checked'
			|| category === 'a0' && _VirtualDom_equalEvents(xValue, yValue))
		{
			continue;
		}

		diff = diff || {};
		diff[xKey] = yValue;
	}

	// add new stuff
	for (var yKey in y)
	{
		if (!(yKey in x))
		{
			diff = diff || {};
			diff[yKey] = y[yKey];
		}
	}

	return diff;
}



// DIFF KIDS


function _VirtualDom_diffKids(xParent, yParent, patches, index)
{
	var xKids = xParent.e;
	var yKids = yParent.e;

	var xLen = xKids.length;
	var yLen = yKids.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (xLen > yLen)
	{
		_VirtualDom_pushPatch(patches, 6, index, {
			v: yLen,
			i: xLen - yLen
		});
	}
	else if (xLen < yLen)
	{
		_VirtualDom_pushPatch(patches, 7, index, {
			v: xLen,
			e: yKids
		});
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++)
	{
		var xKid = xKids[i];
		_VirtualDom_diffHelp(xKid, yKids[i], patches, ++index);
		index += xKid.b || 0;
	}
}



// KEYED DIFF


function _VirtualDom_diffKeyedKids(xParent, yParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var xKids = xParent.e;
	var yKids = yParent.e;
	var xLen = xKids.length;
	var yLen = yKids.length;
	var xIndex = 0;
	var yIndex = 0;

	var index = rootIndex;

	while (xIndex < xLen && yIndex < yLen)
	{
		var x = xKids[xIndex];
		var y = yKids[yIndex];

		var xKey = x.a;
		var yKey = y.a;
		var xNode = x.b;
		var yNode = y.b;

		var newMatch = undefined;
		var oldMatch = undefined;

		// check if keys match

		if (xKey === yKey)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNode, localPatches, index);
			index += xNode.b || 0;

			xIndex++;
			yIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var xNext = xKids[xIndex + 1];
		var yNext = yKids[yIndex + 1];

		if (xNext)
		{
			var xNextKey = xNext.a;
			var xNextNode = xNext.b;
			oldMatch = yKey === xNextKey;
		}

		if (yNext)
		{
			var yNextKey = yNext.a;
			var yNextNode = yNext.b;
			newMatch = xKey === yNextKey;
		}


		// swap x and y
		if (newMatch && oldMatch)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			_VirtualDom_insertNode(changes, localPatches, xKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNextNode, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		// insert y
		if (newMatch)
		{
			index++;
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			index += xNode.b || 0;

			xIndex += 1;
			yIndex += 2;
			continue;
		}

		// remove x
		if (oldMatch)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 1;
			continue;
		}

		// remove x, insert y
		if (xNext && xNextKey === yNextKey)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNextNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (xIndex < xLen)
	{
		index++;
		var x = xKids[xIndex];
		var xNode = x.b;
		_VirtualDom_removeNode(changes, localPatches, x.a, xNode, index);
		index += xNode.b || 0;
		xIndex++;
	}

	while (yIndex < yLen)
	{
		var endInserts = endInserts || [];
		var y = yKids[yIndex];
		_VirtualDom_insertNode(changes, localPatches, y.a, y.b, undefined, endInserts);
		yIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || endInserts)
	{
		_VirtualDom_pushPatch(patches, 8, rootIndex, {
			w: localPatches,
			x: inserts,
			y: endInserts
		});
	}
}



// CHANGES FROM KEYED DIFF


var _VirtualDom_POSTFIX = '_elmW6BL';


function _VirtualDom_insertNode(changes, localPatches, key, vnode, yIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		entry = {
			c: 0,
			z: vnode,
			r: yIndex,
			s: undefined
		};

		inserts.push({ r: yIndex, A: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.c === 1)
	{
		inserts.push({ r: yIndex, A: entry });

		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(entry.z, vnode, subPatches, entry.r);
		entry.r = yIndex;
		entry.s.s = {
			w: subPatches,
			A: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	_VirtualDom_insertNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, yIndex, inserts);
}


function _VirtualDom_removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		var patch = _VirtualDom_pushPatch(localPatches, 9, index, undefined);

		changes[key] = {
			c: 1,
			z: vnode,
			r: index,
			s: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.c === 0)
	{
		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(vnode, entry.z, subPatches, index);

		_VirtualDom_pushPatch(localPatches, 9, index, {
			w: subPatches,
			A: entry
		});

		return;
	}

	// this key has already been removed or moved, a duplicate!
	_VirtualDom_removeNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, index);
}



// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function _VirtualDom_addDomNodes(domNode, vNode, patches, eventNode)
{
	_VirtualDom_addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.b, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function _VirtualDom_addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.r;

	while (index === low)
	{
		var patchType = patch.$;

		if (patchType === 1)
		{
			_VirtualDom_addDomNodes(domNode, vNode.k, patch.s, eventNode);
		}
		else if (patchType === 8)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var subPatches = patch.s.w;
			if (subPatches.length > 0)
			{
				_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 9)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var data = patch.s;
			if (data)
			{
				data.A.s = domNode;
				var subPatches = data.w;
				if (subPatches.length > 0)
				{
					_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.t = domNode;
			patch.u = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.r) > high)
		{
			return i;
		}
	}

	var tag = vNode.$;

	if (tag === 4)
	{
		var subNode = vNode.k;

		while (subNode.$ === 4)
		{
			subNode = subNode.k;
		}

		return _VirtualDom_addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);
	}

	// tag must be 1 or 2 at this point

	var vKids = vNode.e;
	var childNodes = domNode.childNodes;
	for (var j = 0; j < vKids.length; j++)
	{
		low++;
		var vKid = tag === 1 ? vKids[j] : vKids[j].b;
		var nextLow = low + (vKid.b || 0);
		if (low <= index && index <= nextLow)
		{
			i = _VirtualDom_addDomNodesHelp(childNodes[j], vKid, patches, i, low, nextLow, eventNode);
			if (!(patch = patches[i]) || (index = patch.r) > high)
			{
				return i;
			}
		}
		low = nextLow;
	}
	return i;
}



// APPLY PATCHES


function _VirtualDom_applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	_VirtualDom_addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return _VirtualDom_applyPatchesHelp(rootDomNode, patches);
}

function _VirtualDom_applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.t
		var newNode = _VirtualDom_applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function _VirtualDom_applyPatch(domNode, patch)
{
	switch (patch.$)
	{
		case 0:
			return _VirtualDom_applyPatchRedraw(domNode, patch.s, patch.u);

		case 4:
			_VirtualDom_applyFacts(domNode, patch.u, patch.s);
			return domNode;

		case 3:
			domNode.replaceData(0, domNode.length, patch.s);
			return domNode;

		case 1:
			return _VirtualDom_applyPatchesHelp(domNode, patch.s);

		case 2:
			if (domNode.elm_event_node_ref)
			{
				domNode.elm_event_node_ref.j = patch.s;
			}
			else
			{
				domNode.elm_event_node_ref = { j: patch.s, p: patch.u };
			}
			return domNode;

		case 6:
			var data = patch.s;
			for (var i = 0; i < data.i; i++)
			{
				domNode.removeChild(domNode.childNodes[data.v]);
			}
			return domNode;

		case 7:
			var data = patch.s;
			var kids = data.e;
			var i = data.v;
			var theEnd = domNode.childNodes[i];
			for (; i < kids.length; i++)
			{
				domNode.insertBefore(_VirtualDom_render(kids[i], patch.u), theEnd);
			}
			return domNode;

		case 9:
			var data = patch.s;
			if (!data)
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.A;
			if (typeof entry.r !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.s = _VirtualDom_applyPatchesHelp(domNode, data.w);
			return domNode;

		case 8:
			return _VirtualDom_applyPatchReorder(domNode, patch);

		case 5:
			return patch.s(domNode);

		default:
			_Debug_crash(10); // 'Ran into an unknown patch!'
	}
}


function _VirtualDom_applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = _VirtualDom_render(vNode, eventNode);

	if (!newNode.elm_event_node_ref)
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function _VirtualDom_applyPatchReorder(domNode, patch)
{
	var data = patch.s;

	// remove end inserts
	var frag = _VirtualDom_applyPatchReorderEndInsertsHelp(data.y, patch);

	// removals
	domNode = _VirtualDom_applyPatchesHelp(domNode, data.w);

	// inserts
	var inserts = data.x;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.A;
		var node = entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u);
		domNode.insertBefore(node, domNode.childNodes[insert.r]);
	}

	// add end inserts
	if (frag)
	{
		_VirtualDom_appendChild(domNode, frag);
	}

	return domNode;
}


function _VirtualDom_applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (!endInserts)
	{
		return;
	}

	var frag = _VirtualDom_doc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.A;
		_VirtualDom_appendChild(frag, entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u)
		);
	}
	return frag;
}


function _VirtualDom_virtualize(node)
{
	// TEXT NODES

	if (node.nodeType === 3)
	{
		return _VirtualDom_text(node.textContent);
	}


	// WEIRD NODES

	if (node.nodeType !== 1)
	{
		return _VirtualDom_text('');
	}


	// ELEMENT NODES

	var attrList = _List_Nil;
	var attrs = node.attributes;
	for (var i = attrs.length; i--; )
	{
		var attr = attrs[i];
		var name = attr.name;
		var value = attr.value;
		attrList = _List_Cons( A2(_VirtualDom_attribute, name, value), attrList );
	}

	var tag = node.tagName.toLowerCase();
	var kidList = _List_Nil;
	var kids = node.childNodes;

	for (var i = kids.length; i--; )
	{
		kidList = _List_Cons(_VirtualDom_virtualize(kids[i]), kidList);
	}
	return A3(_VirtualDom_node, tag, attrList, kidList);
}

function _VirtualDom_dekey(keyedNode)
{
	var keyedKids = keyedNode.e;
	var len = keyedKids.length;
	var kids = new Array(len);
	for (var i = 0; i < len; i++)
	{
		kids[i] = keyedKids[i].b;
	}

	return {
		$: 1,
		c: keyedNode.c,
		d: keyedNode.d,
		e: kids,
		f: keyedNode.f,
		b: keyedNode.b
	};
}




// ELEMENT


var _Debugger_element;

var _Browser_element = _Debugger_element || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.a7,
		impl.bC,
		impl.bv,
		function(sendToApp, initialModel) {
			var view = impl.bD;
			/**/
			var domNode = args['node'];
			//*/
			/**_UNUSED/
			var domNode = args && args['node'] ? args['node'] : _Debug_crash(0);
			//*/
			var currNode = _VirtualDom_virtualize(domNode);

			return _Browser_makeAnimator(initialModel, function(model)
			{
				var nextNode = view(model);
				var patches = _VirtualDom_diff(currNode, nextNode);
				domNode = _VirtualDom_applyPatches(domNode, currNode, patches, sendToApp);
				currNode = nextNode;
			});
		}
	);
});



// DOCUMENT


var _Debugger_document;

var _Browser_document = _Debugger_document || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.a7,
		impl.bC,
		impl.bv,
		function(sendToApp, initialModel) {
			var divertHrefToApp = impl.Z && impl.Z(sendToApp)
			var view = impl.bD;
			var title = _VirtualDom_doc.title;
			var bodyNode = _VirtualDom_doc.body;
			var currNode = _VirtualDom_virtualize(bodyNode);
			return _Browser_makeAnimator(initialModel, function(model)
			{
				_VirtualDom_divertHrefToApp = divertHrefToApp;
				var doc = view(model);
				var nextNode = _VirtualDom_node('body')(_List_Nil)(doc.aI);
				var patches = _VirtualDom_diff(currNode, nextNode);
				bodyNode = _VirtualDom_applyPatches(bodyNode, currNode, patches, sendToApp);
				currNode = nextNode;
				_VirtualDom_divertHrefToApp = 0;
				(title !== doc.bx) && (_VirtualDom_doc.title = title = doc.bx);
			});
		}
	);
});



// ANIMATION


var _Browser_cancelAnimationFrame =
	typeof cancelAnimationFrame !== 'undefined'
		? cancelAnimationFrame
		: function(id) { clearTimeout(id); };

var _Browser_requestAnimationFrame =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { return setTimeout(callback, 1000 / 60); };


function _Browser_makeAnimator(model, draw)
{
	draw(model);

	var state = 0;

	function updateIfNeeded()
	{
		state = state === 1
			? 0
			: ( _Browser_requestAnimationFrame(updateIfNeeded), draw(model), 1 );
	}

	return function(nextModel, isSync)
	{
		model = nextModel;

		isSync
			? ( draw(model),
				state === 2 && (state = 1)
				)
			: ( state === 0 && _Browser_requestAnimationFrame(updateIfNeeded),
				state = 2
				);
	};
}



// APPLICATION


function _Browser_application(impl)
{
	var onUrlChange = impl.bg;
	var onUrlRequest = impl.bh;
	var key = function() { key.a(onUrlChange(_Browser_getUrl())); };

	return _Browser_document({
		Z: function(sendToApp)
		{
			key.a = sendToApp;
			_Browser_window.addEventListener('popstate', key);
			_Browser_window.navigator.userAgent.indexOf('Trident') < 0 || _Browser_window.addEventListener('hashchange', key);

			return F2(function(domNode, event)
			{
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button < 1 && !domNode.target && !domNode.hasAttribute('download'))
				{
					event.preventDefault();
					var href = domNode.href;
					var curr = _Browser_getUrl();
					var next = $elm$url$Url$fromString(href).a;
					sendToApp(onUrlRequest(
						(next
							&& curr.au === next.au
							&& curr.ah === next.ah
							&& curr.ar.a === next.ar.a
						)
							? $elm$browser$Browser$Internal(next)
							: $elm$browser$Browser$External(href)
					));
				}
			});
		},
		a7: function(flags)
		{
			return A3(impl.a7, flags, _Browser_getUrl(), key);
		},
		bD: impl.bD,
		bC: impl.bC,
		bv: impl.bv
	});
}

function _Browser_getUrl()
{
	return $elm$url$Url$fromString(_VirtualDom_doc.location.href).a || _Debug_crash(1);
}

var _Browser_go = F2(function(key, n)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		n && history.go(n);
		key();
	}));
});

var _Browser_pushUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.pushState({}, '', url);
		key();
	}));
});

var _Browser_replaceUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.replaceState({}, '', url);
		key();
	}));
});



// GLOBAL EVENTS


var _Browser_fakeNode = { addEventListener: function() {}, removeEventListener: function() {} };
var _Browser_doc = typeof document !== 'undefined' ? document : _Browser_fakeNode;
var _Browser_window = typeof window !== 'undefined' ? window : _Browser_fakeNode;

var _Browser_on = F3(function(node, eventName, sendToSelf)
{
	return _Scheduler_spawn(_Scheduler_binding(function(callback)
	{
		function handler(event)	{ _Scheduler_rawSpawn(sendToSelf(event)); }
		node.addEventListener(eventName, handler, _VirtualDom_passiveSupported && { passive: true });
		return function() { node.removeEventListener(eventName, handler); };
	}));
});

var _Browser_decodeEvent = F2(function(decoder, event)
{
	var result = _Json_runHelp(decoder, event);
	return $elm$core$Result$isOk(result) ? $elm$core$Maybe$Just(result.a) : $elm$core$Maybe$Nothing;
});



// PAGE VISIBILITY


function _Browser_visibilityInfo()
{
	return (typeof _VirtualDom_doc.hidden !== 'undefined')
		? { a2: 'hidden', aL: 'visibilitychange' }
		:
	(typeof _VirtualDom_doc.mozHidden !== 'undefined')
		? { a2: 'mozHidden', aL: 'mozvisibilitychange' }
		:
	(typeof _VirtualDom_doc.msHidden !== 'undefined')
		? { a2: 'msHidden', aL: 'msvisibilitychange' }
		:
	(typeof _VirtualDom_doc.webkitHidden !== 'undefined')
		? { a2: 'webkitHidden', aL: 'webkitvisibilitychange' }
		: { a2: 'hidden', aL: 'visibilitychange' };
}



// ANIMATION FRAMES


function _Browser_rAF()
{
	return _Scheduler_binding(function(callback)
	{
		var id = _Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(Date.now()));
		});

		return function() {
			_Browser_cancelAnimationFrame(id);
		};
	});
}


function _Browser_now()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(Date.now()));
	});
}



// DOM STUFF


function _Browser_withNode(id, doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			var node = document.getElementById(id);
			callback(node
				? _Scheduler_succeed(doStuff(node))
				: _Scheduler_fail($elm$browser$Browser$Dom$NotFound(id))
			);
		});
	});
}


function _Browser_withWindow(doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(doStuff()));
		});
	});
}


// FOCUS and BLUR


var _Browser_call = F2(function(functionName, id)
{
	return _Browser_withNode(id, function(node) {
		node[functionName]();
		return _Utils_Tuple0;
	});
});



// WINDOW VIEWPORT


function _Browser_getViewport()
{
	return {
		ax: _Browser_getScene(),
		aB: {
			aD: _Browser_window.pageXOffset,
			aE: _Browser_window.pageYOffset,
			bE: _Browser_doc.documentElement.clientWidth,
			a1: _Browser_doc.documentElement.clientHeight
		}
	};
}

function _Browser_getScene()
{
	var body = _Browser_doc.body;
	var elem = _Browser_doc.documentElement;
	return {
		bE: Math.max(body.scrollWidth, body.offsetWidth, elem.scrollWidth, elem.offsetWidth, elem.clientWidth),
		a1: Math.max(body.scrollHeight, body.offsetHeight, elem.scrollHeight, elem.offsetHeight, elem.clientHeight)
	};
}

var _Browser_setViewport = F2(function(x, y)
{
	return _Browser_withWindow(function()
	{
		_Browser_window.scroll(x, y);
		return _Utils_Tuple0;
	});
});



// ELEMENT VIEWPORT


function _Browser_getViewportOf(id)
{
	return _Browser_withNode(id, function(node)
	{
		return {
			ax: {
				bE: node.scrollWidth,
				a1: node.scrollHeight
			},
			aB: {
				aD: node.scrollLeft,
				aE: node.scrollTop,
				bE: node.clientWidth,
				a1: node.clientHeight
			}
		};
	});
}


var _Browser_setViewportOf = F3(function(id, x, y)
{
	return _Browser_withNode(id, function(node)
	{
		node.scrollLeft = x;
		node.scrollTop = y;
		return _Utils_Tuple0;
	});
});



// ELEMENT


function _Browser_getElement(id)
{
	return _Browser_withNode(id, function(node)
	{
		var rect = node.getBoundingClientRect();
		var x = _Browser_window.pageXOffset;
		var y = _Browser_window.pageYOffset;
		return {
			ax: _Browser_getScene(),
			aB: {
				aD: x,
				aE: y,
				bE: _Browser_doc.documentElement.clientWidth,
				a1: _Browser_doc.documentElement.clientHeight
			},
			aU: {
				aD: x + rect.left,
				aE: y + rect.top,
				bE: rect.width,
				a1: rect.height
			}
		};
	});
}



// LOAD and RELOAD


function _Browser_reload(skipCache)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		_VirtualDom_doc.location.reload(skipCache);
	}));
}

function _Browser_load(url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		try
		{
			_Browser_window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			_VirtualDom_doc.location.reload(false);
		}
	}));
}



// DECODER

var _File_decoder = _Json_decodePrim(function(value) {
	// NOTE: checks if `File` exists in case this is run on node
	return (typeof File !== 'undefined' && value instanceof File)
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a FILE', value);
});


// METADATA

function _File_name(file) { return file.name; }
function _File_mime(file) { return file.type; }
function _File_size(file) { return file.size; }

function _File_lastModified(file)
{
	return $elm$time$Time$millisToPosix(file.lastModified);
}


// DOWNLOAD

var _File_downloadNode;

function _File_getDownloadNode()
{
	return _File_downloadNode || (_File_downloadNode = document.createElement('a'));
}

var _File_download = F3(function(name, mime, content)
{
	return _Scheduler_binding(function(callback)
	{
		var blob = new Blob([content], {type: mime});

		// for IE10+
		if (navigator.msSaveOrOpenBlob)
		{
			navigator.msSaveOrOpenBlob(blob, name);
			return;
		}

		// for HTML5
		var node = _File_getDownloadNode();
		var objectUrl = URL.createObjectURL(blob);
		node.href = objectUrl;
		node.download = name;
		_File_click(node);
		URL.revokeObjectURL(objectUrl);
	});
});

function _File_downloadUrl(href)
{
	return _Scheduler_binding(function(callback)
	{
		var node = _File_getDownloadNode();
		node.href = href;
		node.download = '';
		node.origin === location.origin || (node.target = '_blank');
		_File_click(node);
	});
}


// IE COMPATIBILITY

function _File_makeBytesSafeForInternetExplorer(bytes)
{
	// only needed by IE10 and IE11 to fix https://github.com/elm/file/issues/10
	// all other browsers can just run `new Blob([bytes])` directly with no problem
	//
	return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function _File_click(node)
{
	// only needed by IE10 and IE11 to fix https://github.com/elm/file/issues/11
	// all other browsers have MouseEvent and do not need this conditional stuff
	//
	if (typeof MouseEvent === 'function')
	{
		node.dispatchEvent(new MouseEvent('click'));
	}
	else
	{
		var event = document.createEvent('MouseEvents');
		event.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		document.body.appendChild(node);
		node.dispatchEvent(event);
		document.body.removeChild(node);
	}
}


// UPLOAD

var _File_node;

function _File_uploadOne(mimes)
{
	return _Scheduler_binding(function(callback)
	{
		_File_node = document.createElement('input');
		_File_node.type = 'file';
		_File_node.accept = A2($elm$core$String$join, ',', mimes);
		_File_node.addEventListener('change', function(event)
		{
			callback(_Scheduler_succeed(event.target.files[0]));
		});
		_File_click(_File_node);
	});
}

function _File_uploadOneOrMore(mimes)
{
	return _Scheduler_binding(function(callback)
	{
		_File_node = document.createElement('input');
		_File_node.type = 'file';
		_File_node.multiple = true;
		_File_node.accept = A2($elm$core$String$join, ',', mimes);
		_File_node.addEventListener('change', function(event)
		{
			var elmFiles = _List_fromArray(event.target.files);
			callback(_Scheduler_succeed(_Utils_Tuple2(elmFiles.a, elmFiles.b)));
		});
		_File_click(_File_node);
	});
}


// CONTENT

function _File_toString(blob)
{
	return _Scheduler_binding(function(callback)
	{
		var reader = new FileReader();
		reader.addEventListener('loadend', function() {
			callback(_Scheduler_succeed(reader.result));
		});
		reader.readAsText(blob);
		return function() { reader.abort(); };
	});
}

function _File_toBytes(blob)
{
	return _Scheduler_binding(function(callback)
	{
		var reader = new FileReader();
		reader.addEventListener('loadend', function() {
			callback(_Scheduler_succeed(new DataView(reader.result)));
		});
		reader.readAsArrayBuffer(blob);
		return function() { reader.abort(); };
	});
}

function _File_toUrl(blob)
{
	return _Scheduler_binding(function(callback)
	{
		var reader = new FileReader();
		reader.addEventListener('loadend', function() {
			callback(_Scheduler_succeed(reader.result));
		});
		reader.readAsDataURL(blob);
		return function() { reader.abort(); };
	});
}

var $elm$core$Basics$EQ = 1;
var $elm$core$Basics$GT = 2;
var $elm$core$Basics$LT = 0;
var $elm$core$List$cons = _List_cons;
var $elm$core$Dict$foldr = F3(
	function (func, acc, t) {
		foldr:
		while (true) {
			if (t.$ === -2) {
				return acc;
			} else {
				var key = t.b;
				var value = t.c;
				var left = t.d;
				var right = t.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldr, func, acc, right)),
					$temp$t = left;
				func = $temp$func;
				acc = $temp$acc;
				t = $temp$t;
				continue foldr;
			}
		}
	});
var $elm$core$Dict$toList = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Dict$keys = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2($elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Set$toList = function (_v0) {
	var dict = _v0;
	return $elm$core$Dict$keys(dict);
};
var $elm$core$Elm$JsArray$foldr = _JsArray_foldr;
var $elm$core$Array$foldr = F3(
	function (func, baseCase, _v0) {
		var tree = _v0.c;
		var tail = _v0.d;
		var helper = F2(
			function (node, acc) {
				if (!node.$) {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldr, helper, acc, subTree);
				} else {
					var values = node.a;
					return A3($elm$core$Elm$JsArray$foldr, func, acc, values);
				}
			});
		return A3(
			$elm$core$Elm$JsArray$foldr,
			helper,
			A3($elm$core$Elm$JsArray$foldr, func, baseCase, tail),
			tree);
	});
var $elm$core$Array$toList = function (array) {
	return A3($elm$core$Array$foldr, $elm$core$List$cons, _List_Nil, array);
};
var $elm$core$Result$Err = function (a) {
	return {$: 1, a: a};
};
var $elm$json$Json$Decode$Failure = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $elm$json$Json$Decode$Field = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$json$Json$Decode$Index = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $elm$core$Result$Ok = function (a) {
	return {$: 0, a: a};
};
var $elm$json$Json$Decode$OneOf = function (a) {
	return {$: 2, a: a};
};
var $elm$core$Basics$False = 1;
var $elm$core$Basics$add = _Basics_add;
var $elm$core$Maybe$Just = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Maybe$Nothing = {$: 1};
var $elm$core$String$all = _String_all;
var $elm$core$Basics$and = _Basics_and;
var $elm$core$Basics$append = _Utils_append;
var $elm$json$Json$Encode$encode = _Json_encode;
var $elm$core$String$fromInt = _String_fromNumber;
var $elm$core$String$join = F2(
	function (sep, chunks) {
		return A2(
			_String_join,
			sep,
			_List_toArray(chunks));
	});
var $elm$core$String$split = F2(
	function (sep, string) {
		return _List_fromArray(
			A2(_String_split, sep, string));
	});
var $elm$json$Json$Decode$indent = function (str) {
	return A2(
		$elm$core$String$join,
		'\n    ',
		A2($elm$core$String$split, '\n', str));
};
var $elm$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			if (!list.b) {
				return acc;
			} else {
				var x = list.a;
				var xs = list.b;
				var $temp$func = func,
					$temp$acc = A2(func, x, acc),
					$temp$list = xs;
				func = $temp$func;
				acc = $temp$acc;
				list = $temp$list;
				continue foldl;
			}
		}
	});
var $elm$core$List$length = function (xs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, i) {
				return i + 1;
			}),
		0,
		xs);
};
var $elm$core$List$map2 = _List_map2;
var $elm$core$Basics$le = _Utils_le;
var $elm$core$Basics$sub = _Basics_sub;
var $elm$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_Utils_cmp(lo, hi) < 1) {
				var $temp$lo = lo,
					$temp$hi = hi - 1,
					$temp$list = A2($elm$core$List$cons, hi, list);
				lo = $temp$lo;
				hi = $temp$hi;
				list = $temp$list;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var $elm$core$List$range = F2(
	function (lo, hi) {
		return A3($elm$core$List$rangeHelp, lo, hi, _List_Nil);
	});
var $elm$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$map2,
			f,
			A2(
				$elm$core$List$range,
				0,
				$elm$core$List$length(xs) - 1),
			xs);
	});
var $elm$core$Char$toCode = _Char_toCode;
var $elm$core$Char$isLower = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (97 <= code) && (code <= 122);
};
var $elm$core$Char$isUpper = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 90) && (65 <= code);
};
var $elm$core$Basics$or = _Basics_or;
var $elm$core$Char$isAlpha = function (_char) {
	return $elm$core$Char$isLower(_char) || $elm$core$Char$isUpper(_char);
};
var $elm$core$Char$isDigit = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 57) && (48 <= code);
};
var $elm$core$Char$isAlphaNum = function (_char) {
	return $elm$core$Char$isLower(_char) || ($elm$core$Char$isUpper(_char) || $elm$core$Char$isDigit(_char));
};
var $elm$core$List$reverse = function (list) {
	return A3($elm$core$List$foldl, $elm$core$List$cons, _List_Nil, list);
};
var $elm$core$String$uncons = _String_uncons;
var $elm$json$Json$Decode$errorOneOf = F2(
	function (i, error) {
		return '\n\n(' + ($elm$core$String$fromInt(i + 1) + (') ' + $elm$json$Json$Decode$indent(
			$elm$json$Json$Decode$errorToString(error))));
	});
var $elm$json$Json$Decode$errorToString = function (error) {
	return A2($elm$json$Json$Decode$errorToStringHelp, error, _List_Nil);
};
var $elm$json$Json$Decode$errorToStringHelp = F2(
	function (error, context) {
		errorToStringHelp:
		while (true) {
			switch (error.$) {
				case 0:
					var f = error.a;
					var err = error.b;
					var isSimple = function () {
						var _v1 = $elm$core$String$uncons(f);
						if (_v1.$ === 1) {
							return false;
						} else {
							var _v2 = _v1.a;
							var _char = _v2.a;
							var rest = _v2.b;
							return $elm$core$Char$isAlpha(_char) && A2($elm$core$String$all, $elm$core$Char$isAlphaNum, rest);
						}
					}();
					var fieldName = isSimple ? ('.' + f) : ('[\'' + (f + '\']'));
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, fieldName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 1:
					var i = error.a;
					var err = error.b;
					var indexName = '[' + ($elm$core$String$fromInt(i) + ']');
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, indexName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 2:
					var errors = error.a;
					if (!errors.b) {
						return 'Ran into a Json.Decode.oneOf with no possibilities' + function () {
							if (!context.b) {
								return '!';
							} else {
								return ' at json' + A2(
									$elm$core$String$join,
									'',
									$elm$core$List$reverse(context));
							}
						}();
					} else {
						if (!errors.b.b) {
							var err = errors.a;
							var $temp$error = err,
								$temp$context = context;
							error = $temp$error;
							context = $temp$context;
							continue errorToStringHelp;
						} else {
							var starter = function () {
								if (!context.b) {
									return 'Json.Decode.oneOf';
								} else {
									return 'The Json.Decode.oneOf at json' + A2(
										$elm$core$String$join,
										'',
										$elm$core$List$reverse(context));
								}
							}();
							var introduction = starter + (' failed in the following ' + ($elm$core$String$fromInt(
								$elm$core$List$length(errors)) + ' ways:'));
							return A2(
								$elm$core$String$join,
								'\n\n',
								A2(
									$elm$core$List$cons,
									introduction,
									A2($elm$core$List$indexedMap, $elm$json$Json$Decode$errorOneOf, errors)));
						}
					}
				default:
					var msg = error.a;
					var json = error.b;
					var introduction = function () {
						if (!context.b) {
							return 'Problem with the given value:\n\n';
						} else {
							return 'Problem with the value at json' + (A2(
								$elm$core$String$join,
								'',
								$elm$core$List$reverse(context)) + ':\n\n    ');
						}
					}();
					return introduction + ($elm$json$Json$Decode$indent(
						A2($elm$json$Json$Encode$encode, 4, json)) + ('\n\n' + msg));
			}
		}
	});
var $elm$core$Array$branchFactor = 32;
var $elm$core$Array$Array_elm_builtin = F4(
	function (a, b, c, d) {
		return {$: 0, a: a, b: b, c: c, d: d};
	});
var $elm$core$Elm$JsArray$empty = _JsArray_empty;
var $elm$core$Basics$ceiling = _Basics_ceiling;
var $elm$core$Basics$fdiv = _Basics_fdiv;
var $elm$core$Basics$logBase = F2(
	function (base, number) {
		return _Basics_log(number) / _Basics_log(base);
	});
var $elm$core$Basics$toFloat = _Basics_toFloat;
var $elm$core$Array$shiftStep = $elm$core$Basics$ceiling(
	A2($elm$core$Basics$logBase, 2, $elm$core$Array$branchFactor));
var $elm$core$Array$empty = A4($elm$core$Array$Array_elm_builtin, 0, $elm$core$Array$shiftStep, $elm$core$Elm$JsArray$empty, $elm$core$Elm$JsArray$empty);
var $elm$core$Elm$JsArray$initialize = _JsArray_initialize;
var $elm$core$Array$Leaf = function (a) {
	return {$: 1, a: a};
};
var $elm$core$Basics$apL = F2(
	function (f, x) {
		return f(x);
	});
var $elm$core$Basics$apR = F2(
	function (x, f) {
		return f(x);
	});
var $elm$core$Basics$eq = _Utils_equal;
var $elm$core$Basics$floor = _Basics_floor;
var $elm$core$Elm$JsArray$length = _JsArray_length;
var $elm$core$Basics$gt = _Utils_gt;
var $elm$core$Basics$max = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) > 0) ? x : y;
	});
var $elm$core$Basics$mul = _Basics_mul;
var $elm$core$Array$SubTree = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Elm$JsArray$initializeFromList = _JsArray_initializeFromList;
var $elm$core$Array$compressNodes = F2(
	function (nodes, acc) {
		compressNodes:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodes);
			var node = _v0.a;
			var remainingNodes = _v0.b;
			var newAcc = A2(
				$elm$core$List$cons,
				$elm$core$Array$SubTree(node),
				acc);
			if (!remainingNodes.b) {
				return $elm$core$List$reverse(newAcc);
			} else {
				var $temp$nodes = remainingNodes,
					$temp$acc = newAcc;
				nodes = $temp$nodes;
				acc = $temp$acc;
				continue compressNodes;
			}
		}
	});
var $elm$core$Tuple$first = function (_v0) {
	var x = _v0.a;
	return x;
};
var $elm$core$Array$treeFromBuilder = F2(
	function (nodeList, nodeListSize) {
		treeFromBuilder:
		while (true) {
			var newNodeSize = $elm$core$Basics$ceiling(nodeListSize / $elm$core$Array$branchFactor);
			if (newNodeSize === 1) {
				return A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodeList).a;
			} else {
				var $temp$nodeList = A2($elm$core$Array$compressNodes, nodeList, _List_Nil),
					$temp$nodeListSize = newNodeSize;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue treeFromBuilder;
			}
		}
	});
var $elm$core$Array$builderToArray = F2(
	function (reverseNodeList, builder) {
		if (!builder.a) {
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.c),
				$elm$core$Array$shiftStep,
				$elm$core$Elm$JsArray$empty,
				builder.c);
		} else {
			var treeLen = builder.a * $elm$core$Array$branchFactor;
			var depth = $elm$core$Basics$floor(
				A2($elm$core$Basics$logBase, $elm$core$Array$branchFactor, treeLen - 1));
			var correctNodeList = reverseNodeList ? $elm$core$List$reverse(builder.d) : builder.d;
			var tree = A2($elm$core$Array$treeFromBuilder, correctNodeList, builder.a);
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.c) + treeLen,
				A2($elm$core$Basics$max, 5, depth * $elm$core$Array$shiftStep),
				tree,
				builder.c);
		}
	});
var $elm$core$Basics$idiv = _Basics_idiv;
var $elm$core$Basics$lt = _Utils_lt;
var $elm$core$Array$initializeHelp = F5(
	function (fn, fromIndex, len, nodeList, tail) {
		initializeHelp:
		while (true) {
			if (fromIndex < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					false,
					{d: nodeList, a: (len / $elm$core$Array$branchFactor) | 0, c: tail});
			} else {
				var leaf = $elm$core$Array$Leaf(
					A3($elm$core$Elm$JsArray$initialize, $elm$core$Array$branchFactor, fromIndex, fn));
				var $temp$fn = fn,
					$temp$fromIndex = fromIndex - $elm$core$Array$branchFactor,
					$temp$len = len,
					$temp$nodeList = A2($elm$core$List$cons, leaf, nodeList),
					$temp$tail = tail;
				fn = $temp$fn;
				fromIndex = $temp$fromIndex;
				len = $temp$len;
				nodeList = $temp$nodeList;
				tail = $temp$tail;
				continue initializeHelp;
			}
		}
	});
var $elm$core$Basics$remainderBy = _Basics_remainderBy;
var $elm$core$Array$initialize = F2(
	function (len, fn) {
		if (len <= 0) {
			return $elm$core$Array$empty;
		} else {
			var tailLen = len % $elm$core$Array$branchFactor;
			var tail = A3($elm$core$Elm$JsArray$initialize, tailLen, len - tailLen, fn);
			var initialFromIndex = (len - tailLen) - $elm$core$Array$branchFactor;
			return A5($elm$core$Array$initializeHelp, fn, initialFromIndex, len, _List_Nil, tail);
		}
	});
var $elm$core$Basics$True = 0;
var $elm$core$Result$isOk = function (result) {
	if (!result.$) {
		return true;
	} else {
		return false;
	}
};
var $elm$json$Json$Decode$map = _Json_map1;
var $elm$json$Json$Decode$map2 = _Json_map2;
var $elm$json$Json$Decode$succeed = _Json_succeed;
var $elm$virtual_dom$VirtualDom$toHandlerInt = function (handler) {
	switch (handler.$) {
		case 0:
			return 0;
		case 1:
			return 1;
		case 2:
			return 2;
		default:
			return 3;
	}
};
var $elm$browser$Browser$External = function (a) {
	return {$: 1, a: a};
};
var $elm$browser$Browser$Internal = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Basics$identity = function (x) {
	return x;
};
var $elm$browser$Browser$Dom$NotFound = $elm$core$Basics$identity;
var $elm$url$Url$Http = 0;
var $elm$url$Url$Https = 1;
var $elm$url$Url$Url = F6(
	function (protocol, host, port_, path, query, fragment) {
		return {ag: fragment, ah: host, ap: path, ar: port_, au: protocol, bj: query};
	});
var $elm$core$String$contains = _String_contains;
var $elm$core$String$length = _String_length;
var $elm$core$String$slice = _String_slice;
var $elm$core$String$dropLeft = F2(
	function (n, string) {
		return (n < 1) ? string : A3(
			$elm$core$String$slice,
			n,
			$elm$core$String$length(string),
			string);
	});
var $elm$core$String$indexes = _String_indexes;
var $elm$core$String$isEmpty = function (string) {
	return string === '';
};
var $elm$core$String$left = F2(
	function (n, string) {
		return (n < 1) ? '' : A3($elm$core$String$slice, 0, n, string);
	});
var $elm$core$String$toInt = _String_toInt;
var $elm$url$Url$chompBeforePath = F5(
	function (protocol, path, params, frag, str) {
		if ($elm$core$String$isEmpty(str) || A2($elm$core$String$contains, '@', str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, ':', str);
			if (!_v0.b) {
				return $elm$core$Maybe$Just(
					A6($elm$url$Url$Url, protocol, str, $elm$core$Maybe$Nothing, path, params, frag));
			} else {
				if (!_v0.b.b) {
					var i = _v0.a;
					var _v1 = $elm$core$String$toInt(
						A2($elm$core$String$dropLeft, i + 1, str));
					if (_v1.$ === 1) {
						return $elm$core$Maybe$Nothing;
					} else {
						var port_ = _v1;
						return $elm$core$Maybe$Just(
							A6(
								$elm$url$Url$Url,
								protocol,
								A2($elm$core$String$left, i, str),
								port_,
								path,
								params,
								frag));
					}
				} else {
					return $elm$core$Maybe$Nothing;
				}
			}
		}
	});
var $elm$url$Url$chompBeforeQuery = F4(
	function (protocol, params, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '/', str);
			if (!_v0.b) {
				return A5($elm$url$Url$chompBeforePath, protocol, '/', params, frag, str);
			} else {
				var i = _v0.a;
				return A5(
					$elm$url$Url$chompBeforePath,
					protocol,
					A2($elm$core$String$dropLeft, i, str),
					params,
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompBeforeFragment = F3(
	function (protocol, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '?', str);
			if (!_v0.b) {
				return A4($elm$url$Url$chompBeforeQuery, protocol, $elm$core$Maybe$Nothing, frag, str);
			} else {
				var i = _v0.a;
				return A4(
					$elm$url$Url$chompBeforeQuery,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompAfterProtocol = F2(
	function (protocol, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '#', str);
			if (!_v0.b) {
				return A3($elm$url$Url$chompBeforeFragment, protocol, $elm$core$Maybe$Nothing, str);
			} else {
				var i = _v0.a;
				return A3(
					$elm$url$Url$chompBeforeFragment,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$core$String$startsWith = _String_startsWith;
var $elm$url$Url$fromString = function (str) {
	return A2($elm$core$String$startsWith, 'http://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		0,
		A2($elm$core$String$dropLeft, 7, str)) : (A2($elm$core$String$startsWith, 'https://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		1,
		A2($elm$core$String$dropLeft, 8, str)) : $elm$core$Maybe$Nothing);
};
var $elm$core$Basics$never = function (_v0) {
	never:
	while (true) {
		var nvr = _v0;
		var $temp$_v0 = nvr;
		_v0 = $temp$_v0;
		continue never;
	}
};
var $elm$core$Task$Perform = $elm$core$Basics$identity;
var $elm$core$Task$succeed = _Scheduler_succeed;
var $elm$core$Task$init = $elm$core$Task$succeed(0);
var $elm$core$List$foldrHelper = F4(
	function (fn, acc, ctr, ls) {
		if (!ls.b) {
			return acc;
		} else {
			var a = ls.a;
			var r1 = ls.b;
			if (!r1.b) {
				return A2(fn, a, acc);
			} else {
				var b = r1.a;
				var r2 = r1.b;
				if (!r2.b) {
					return A2(
						fn,
						a,
						A2(fn, b, acc));
				} else {
					var c = r2.a;
					var r3 = r2.b;
					if (!r3.b) {
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(fn, c, acc)));
					} else {
						var d = r3.a;
						var r4 = r3.b;
						var res = (ctr > 500) ? A3(
							$elm$core$List$foldl,
							fn,
							acc,
							$elm$core$List$reverse(r4)) : A4($elm$core$List$foldrHelper, fn, acc, ctr + 1, r4);
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(
									fn,
									c,
									A2(fn, d, res))));
					}
				}
			}
		}
	});
var $elm$core$List$foldr = F3(
	function (fn, acc, ls) {
		return A4($elm$core$List$foldrHelper, fn, acc, 0, ls);
	});
var $elm$core$List$map = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						$elm$core$List$cons,
						f(x),
						acc);
				}),
			_List_Nil,
			xs);
	});
var $elm$core$Task$andThen = _Scheduler_andThen;
var $elm$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return $elm$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var $elm$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return A2(
					$elm$core$Task$andThen,
					function (b) {
						return $elm$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var $elm$core$Task$sequence = function (tasks) {
	return A3(
		$elm$core$List$foldr,
		$elm$core$Task$map2($elm$core$List$cons),
		$elm$core$Task$succeed(_List_Nil),
		tasks);
};
var $elm$core$Platform$sendToApp = _Platform_sendToApp;
var $elm$core$Task$spawnCmd = F2(
	function (router, _v0) {
		var task = _v0;
		return _Scheduler_spawn(
			A2(
				$elm$core$Task$andThen,
				$elm$core$Platform$sendToApp(router),
				task));
	});
var $elm$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			$elm$core$Task$map,
			function (_v0) {
				return 0;
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Task$spawnCmd(router),
					commands)));
	});
var $elm$core$Task$onSelfMsg = F3(
	function (_v0, _v1, _v2) {
		return $elm$core$Task$succeed(0);
	});
var $elm$core$Task$cmdMap = F2(
	function (tagger, _v0) {
		var task = _v0;
		return A2($elm$core$Task$map, tagger, task);
	});
_Platform_effectManagers['Task'] = _Platform_createManager($elm$core$Task$init, $elm$core$Task$onEffects, $elm$core$Task$onSelfMsg, $elm$core$Task$cmdMap);
var $elm$core$Task$command = _Platform_leaf('Task');
var $elm$core$Task$perform = F2(
	function (toMessage, task) {
		return $elm$core$Task$command(
			A2($elm$core$Task$map, toMessage, task));
	});
var $elm$browser$Browser$element = _Browser_element;
var $author$project$Storage$applyPersistedState = F2(
	function (state, model) {
		return _Utils_update(
			model,
			{aK: state.aK, m: state.m, a$: state.a$});
	});
var $elm$json$Json$Decode$decodeValue = _Json_run;
var $author$project$Storage$PersistedState = F3(
	function (dataset, cardSize, filterUi) {
		return {aK: cardSize, m: dataset, a$: filterUi};
	});
var $elm$json$Json$Decode$andThen = _Json_andThen;
var $author$project$Types$Large = 2;
var $author$project$Types$Medium = 1;
var $author$project$Types$Small = 0;
var $elm$json$Json$Decode$fail = _Json_fail;
var $author$project$Storage$cardSizeFromString = function (s) {
	switch (s) {
		case 'small':
			return $elm$json$Json$Decode$succeed(0);
		case 'medium':
			return $elm$json$Json$Decode$succeed(1);
		case 'large':
			return $elm$json$Json$Decode$succeed(2);
		default:
			var other = s;
			return $elm$json$Json$Decode$fail('unknown cardSize: ' + other);
	}
};
var $elm$json$Json$Decode$string = _Json_decodeString;
var $author$project$Storage$decodeCardSize = A2($elm$json$Json$Decode$andThen, $author$project$Storage$cardSizeFromString, $elm$json$Json$Decode$string);
var $author$project$Types$Dataset = F8(
	function (id, name, fields, items, imageLinkField, titleLinkField, filterOrder, wrapTitleOnCard) {
		return {af: fields, aZ: filterOrder, ai: id, a4: imageLinkField, aj: items, bd: name, by: titleLinkField, bG: wrapTitleOnCard};
	});
var $elm$json$Json$Decode$bool = _Json_decodeBool;
var $author$project$DomainJson$decodeAndMap = $elm$json$Json$Decode$map2(
	F2(
		function (a, f) {
			return f(a);
		}));
var $author$project$Types$FieldConfig = F9(
	function (key, label, displayRole, showOnCard, filterable, isBool, isTextList, trueLabel, falseLabel) {
		return {aO: displayRole, aX: falseLabel, a0: filterable, a9: isBool, ba: isTextList, ak: key, bb: label, bq: showOnCard, bB: trueLabel};
	});
var $author$project$Types$Image = 2;
var $author$project$Types$Link = 3;
var $author$project$Types$PlainText = 0;
var $author$project$Types$Title = 1;
var $author$project$DomainJson$displayRoleFromString = function (s) {
	switch (s) {
		case 'plain':
			return $elm$json$Json$Decode$succeed(0);
		case 'title':
			return $elm$json$Json$Decode$succeed(1);
		case 'image':
			return $elm$json$Json$Decode$succeed(2);
		case 'link':
			return $elm$json$Json$Decode$succeed(3);
		default:
			var other = s;
			return $elm$json$Json$Decode$fail('unknown displayRole: ' + other);
	}
};
var $author$project$DomainJson$decodeDisplayRole = A2($elm$json$Json$Decode$andThen, $author$project$DomainJson$displayRoleFromString, $elm$json$Json$Decode$string);
var $elm$json$Json$Decode$field = _Json_decodeField;
var $elm$json$Json$Decode$oneOf = _Json_oneOf;
var $elm$json$Json$Decode$maybe = function (decoder) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$map, $elm$core$Maybe$Just, decoder),
				$elm$json$Json$Decode$succeed($elm$core$Maybe$Nothing)
			]));
};
var $author$project$DomainJson$decodeFieldConfig = A2(
	$author$project$DomainJson$decodeAndMap,
	$elm$json$Json$Decode$maybe(
		A2($elm$json$Json$Decode$field, 'falseLabel', $elm$json$Json$Decode$string)),
	A2(
		$author$project$DomainJson$decodeAndMap,
		$elm$json$Json$Decode$maybe(
			A2($elm$json$Json$Decode$field, 'trueLabel', $elm$json$Json$Decode$string)),
		A2(
			$author$project$DomainJson$decodeAndMap,
			$elm$json$Json$Decode$oneOf(
				_List_fromArray(
					[
						A2($elm$json$Json$Decode$field, 'isTextList', $elm$json$Json$Decode$bool),
						$elm$json$Json$Decode$succeed(false)
					])),
			A2(
				$author$project$DomainJson$decodeAndMap,
				$elm$json$Json$Decode$oneOf(
					_List_fromArray(
						[
							A2($elm$json$Json$Decode$field, 'isBool', $elm$json$Json$Decode$bool),
							$elm$json$Json$Decode$succeed(false)
						])),
				A2(
					$author$project$DomainJson$decodeAndMap,
					A2($elm$json$Json$Decode$field, 'filterable', $elm$json$Json$Decode$bool),
					A2(
						$author$project$DomainJson$decodeAndMap,
						A2($elm$json$Json$Decode$field, 'showOnCard', $elm$json$Json$Decode$bool),
						A2(
							$author$project$DomainJson$decodeAndMap,
							A2($elm$json$Json$Decode$field, 'displayRole', $author$project$DomainJson$decodeDisplayRole),
							A2(
								$author$project$DomainJson$decodeAndMap,
								A2($elm$json$Json$Decode$field, 'label', $elm$json$Json$Decode$string),
								A2(
									$author$project$DomainJson$decodeAndMap,
									A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string),
									$elm$json$Json$Decode$succeed($author$project$Types$FieldConfig))))))))));
var $elm$json$Json$Decode$list = _Json_decodeList;
var $author$project$DomainJson$decodeFilterOrder = $elm$json$Json$Decode$oneOf(
	_List_fromArray(
		[
			A2(
			$elm$json$Json$Decode$field,
			'filterOrder',
			$elm$json$Json$Decode$list($elm$json$Json$Decode$string)),
			$elm$json$Json$Decode$succeed(_List_Nil)
		]));
var $author$project$Types$Item = F2(
	function (id, values) {
		return {ai: id, aA: values};
	});
var $author$project$Types$Boolean = function (a) {
	return {$: 2, a: a};
};
var $author$project$Types$Text = function (a) {
	return {$: 0, a: a};
};
var $author$project$Types$TextList = function (a) {
	return {$: 1, a: a};
};
var $elm$core$Basics$composeR = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var $elm$core$List$append = F2(
	function (xs, ys) {
		if (!ys.b) {
			return xs;
		} else {
			return A3($elm$core$List$foldr, $elm$core$List$cons, ys, xs);
		}
	});
var $elm$core$List$concat = function (lists) {
	return A3($elm$core$List$foldr, $elm$core$List$append, _List_Nil, lists);
};
var $elm$core$List$concatMap = F2(
	function (f, list) {
		return $elm$core$List$concat(
			A2($elm$core$List$map, f, list));
	});
var $elm$core$Basics$composeL = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var $elm$core$List$filter = F2(
	function (isGood, list) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, xs) {
					return isGood(x) ? A2($elm$core$List$cons, x, xs) : xs;
				}),
			_List_Nil,
			list);
	});
var $elm$core$Basics$not = _Basics_not;
var $elm$core$String$trim = _String_trim;
var $author$project$DomainJson$parseCommaSeparated = function (str) {
	return A2(
		$elm$core$List$filter,
		A2($elm$core$Basics$composeL, $elm$core$Basics$not, $elm$core$String$isEmpty),
		A2(
			$elm$core$List$map,
			$elm$core$String$trim,
			A2($elm$core$String$split, ',', str)));
};
var $author$project$DomainJson$splitTextList = function (rawList) {
	return A2($elm$core$List$concatMap, $author$project$DomainJson$parseCommaSeparated, rawList);
};
var $author$project$DomainJson$decodeValue = $elm$json$Json$Decode$oneOf(
	_List_fromArray(
		[
			A2($elm$json$Json$Decode$map, $author$project$Types$Text, $elm$json$Json$Decode$string),
			A2(
			$elm$json$Json$Decode$map,
			A2($elm$core$Basics$composeR, $author$project$DomainJson$splitTextList, $author$project$Types$TextList),
			$elm$json$Json$Decode$list($elm$json$Json$Decode$string)),
			A2($elm$json$Json$Decode$map, $author$project$Types$Boolean, $elm$json$Json$Decode$bool)
		]));
var $elm$core$Dict$RBEmpty_elm_builtin = {$: -2};
var $elm$core$Dict$empty = $elm$core$Dict$RBEmpty_elm_builtin;
var $elm$core$Dict$Black = 1;
var $elm$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {$: -1, a: a, b: b, c: c, d: d, e: e};
	});
var $elm$core$Dict$Red = 0;
var $elm$core$Dict$balance = F5(
	function (color, key, value, left, right) {
		if ((right.$ === -1) && (!right.a)) {
			var _v1 = right.a;
			var rK = right.b;
			var rV = right.c;
			var rLeft = right.d;
			var rRight = right.e;
			if ((left.$ === -1) && (!left.a)) {
				var _v3 = left.a;
				var lK = left.b;
				var lV = left.c;
				var lLeft = left.d;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					key,
					value,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					rK,
					rV,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, left, rLeft),
					rRight);
			}
		} else {
			if ((((left.$ === -1) && (!left.a)) && (left.d.$ === -1)) && (!left.d.a)) {
				var _v5 = left.a;
				var lK = left.b;
				var lV = left.c;
				var _v6 = left.d;
				var _v7 = _v6.a;
				var llK = _v6.b;
				var llV = _v6.c;
				var llLeft = _v6.d;
				var llRight = _v6.e;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					lK,
					lV,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, key, value, lRight, right));
			} else {
				return A5($elm$core$Dict$RBNode_elm_builtin, color, key, value, left, right);
			}
		}
	});
var $elm$core$Basics$compare = _Utils_compare;
var $elm$core$Dict$insertHelp = F3(
	function (key, value, dict) {
		if (dict.$ === -2) {
			return A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, $elm$core$Dict$RBEmpty_elm_builtin, $elm$core$Dict$RBEmpty_elm_builtin);
		} else {
			var nColor = dict.a;
			var nKey = dict.b;
			var nValue = dict.c;
			var nLeft = dict.d;
			var nRight = dict.e;
			var _v1 = A2($elm$core$Basics$compare, key, nKey);
			switch (_v1) {
				case 0:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						A3($elm$core$Dict$insertHelp, key, value, nLeft),
						nRight);
				case 1:
					return A5($elm$core$Dict$RBNode_elm_builtin, nColor, nKey, value, nLeft, nRight);
				default:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						nLeft,
						A3($elm$core$Dict$insertHelp, key, value, nRight));
			}
		}
	});
var $elm$core$Dict$insert = F3(
	function (key, value, dict) {
		var _v0 = A3($elm$core$Dict$insertHelp, key, value, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$fromList = function (assocs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, dict) {
				var key = _v0.a;
				var value = _v0.b;
				return A3($elm$core$Dict$insert, key, value, dict);
			}),
		$elm$core$Dict$empty,
		assocs);
};
var $elm$json$Json$Decode$keyValuePairs = _Json_decodeKeyValuePairs;
var $elm$json$Json$Decode$dict = function (decoder) {
	return A2(
		$elm$json$Json$Decode$map,
		$elm$core$Dict$fromList,
		$elm$json$Json$Decode$keyValuePairs(decoder));
};
var $author$project$DomainJson$decodeItem = A3(
	$elm$json$Json$Decode$map2,
	$author$project$Types$Item,
	A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$string),
	A2(
		$elm$json$Json$Decode$field,
		'values',
		$elm$json$Json$Decode$dict($author$project$DomainJson$decodeValue)));
var $elm$json$Json$Decode$null = _Json_decodeNull;
var $elm$json$Json$Decode$nullable = function (decoder) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				$elm$json$Json$Decode$null($elm$core$Maybe$Nothing),
				A2($elm$json$Json$Decode$map, $elm$core$Maybe$Just, decoder)
			]));
};
var $author$project$DomainJson$decodeDataset = A2(
	$author$project$DomainJson$decodeAndMap,
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$field, 'wrapTitleOnCard', $elm$json$Json$Decode$bool),
				$elm$json$Json$Decode$succeed(false)
			])),
	A2(
		$author$project$DomainJson$decodeAndMap,
		$author$project$DomainJson$decodeFilterOrder,
		A2(
			$author$project$DomainJson$decodeAndMap,
			A2(
				$elm$json$Json$Decode$field,
				'titleLinkField',
				$elm$json$Json$Decode$nullable($elm$json$Json$Decode$string)),
			A2(
				$author$project$DomainJson$decodeAndMap,
				A2(
					$elm$json$Json$Decode$field,
					'imageLinkField',
					$elm$json$Json$Decode$nullable($elm$json$Json$Decode$string)),
				A2(
					$author$project$DomainJson$decodeAndMap,
					A2(
						$elm$json$Json$Decode$field,
						'items',
						$elm$json$Json$Decode$list($author$project$DomainJson$decodeItem)),
					A2(
						$author$project$DomainJson$decodeAndMap,
						A2(
							$elm$json$Json$Decode$field,
							'fields',
							$elm$json$Json$Decode$list($author$project$DomainJson$decodeFieldConfig)),
						A2(
							$author$project$DomainJson$decodeAndMap,
							A2($elm$json$Json$Decode$field, 'name', $elm$json$Json$Decode$string),
							A2(
								$author$project$DomainJson$decodeAndMap,
								A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$string),
								$elm$json$Json$Decode$succeed($author$project$Types$Dataset)))))))));
var $author$project$Types$RelAnd = 0;
var $author$project$Types$RelNot = 2;
var $author$project$Types$RelOr = 1;
var $author$project$Storage$decodeBetweenRelation = A2(
	$elm$json$Json$Decode$andThen,
	function (str) {
		switch (str) {
			case 'and':
				return $elm$json$Json$Decode$succeed(0);
			case 'or':
				return $elm$json$Json$Decode$succeed(1);
			case 'not':
				return $elm$json$Json$Decode$succeed(2);
			default:
				return $elm$json$Json$Decode$succeed(0);
		}
	},
	$elm$json$Json$Decode$string);
var $author$project$Types$WithinAnd = 0;
var $author$project$Types$WithinOr = 1;
var $author$project$Storage$decodeWithinRelation = A2(
	$elm$json$Json$Decode$andThen,
	function (str) {
		switch (str) {
			case 'and':
				return $elm$json$Json$Decode$succeed(0);
			case 'or':
				return $elm$json$Json$Decode$succeed(1);
			default:
				return $elm$json$Json$Decode$succeed(1);
		}
	},
	$elm$json$Json$Decode$string);
var $elm$core$Set$Set_elm_builtin = $elm$core$Basics$identity;
var $elm$core$Set$empty = $elm$core$Dict$empty;
var $elm$core$Set$insert = F2(
	function (key, _v0) {
		var dict = _v0;
		return A3($elm$core$Dict$insert, key, 0, dict);
	});
var $elm$core$Set$fromList = function (list) {
	return A3($elm$core$List$foldl, $elm$core$Set$insert, $elm$core$Set$empty, list);
};
var $elm$json$Json$Decode$map4 = _Json_map4;
var $author$project$Storage$decodeFilterUiState = A5(
	$elm$json$Json$Decode$map4,
	F4(
		function (selected, between, within, collapsed) {
			return {S: between, aM: collapsed, bl: false, l: selected, aC: within};
		}),
	A2(
		$elm$json$Json$Decode$field,
		'selected',
		A2(
			$elm$json$Json$Decode$map,
			$elm$core$Set$fromList,
			$elm$json$Json$Decode$list($elm$json$Json$Decode$string))),
	A2($elm$json$Json$Decode$field, 'betweenRelation', $author$project$Storage$decodeBetweenRelation),
	A2($elm$json$Json$Decode$field, 'withinRelation', $author$project$Storage$decodeWithinRelation),
	A2($elm$json$Json$Decode$field, 'collapsed', $elm$json$Json$Decode$bool));
var $author$project$Storage$decodeFilterUi = $elm$json$Json$Decode$oneOf(
	_List_fromArray(
		[
			A2(
			$elm$json$Json$Decode$field,
			'filterUi',
			$elm$json$Json$Decode$dict($author$project$Storage$decodeFilterUiState)),
			$elm$json$Json$Decode$succeed($elm$core$Dict$empty)
		]));
var $elm$json$Json$Decode$map3 = _Json_map3;
var $author$project$Storage$persistedStateDecoder = A4(
	$elm$json$Json$Decode$map3,
	$author$project$Storage$PersistedState,
	A2($elm$json$Json$Decode$field, 'dataset', $author$project$DomainJson$decodeDataset),
	A2($elm$json$Json$Decode$field, 'cardSize', $author$project$Storage$decodeCardSize),
	$author$project$Storage$decodeFilterUi);
var $author$project$Storage$decodeState = function (value) {
	return A2($elm$json$Json$Decode$decodeValue, $author$project$Storage$persistedStateDecoder, value);
};
var $author$project$Types$JsonFormat = 0;
var $author$project$Types$NewDataset = 0;
var $author$project$Types$SearchAll = {$: 0};
var $author$project$MockData$fields = _List_fromArray(
	[
		{aO: 1, aX: $elm$core$Maybe$Nothing, a0: false, a9: false, ba: false, ak: 'title', bb: 'タイトル', bq: true, bB: $elm$core$Maybe$Nothing},
		{aO: 0, aX: $elm$core$Maybe$Nothing, a0: true, a9: false, ba: false, ak: 'author', bb: '著者', bq: true, bB: $elm$core$Maybe$Nothing},
		{aO: 2, aX: $elm$core$Maybe$Nothing, a0: false, a9: false, ba: false, ak: 'coverUrl', bb: '表紙画像', bq: false, bB: $elm$core$Maybe$Nothing},
		{aO: 3, aX: $elm$core$Maybe$Nothing, a0: false, a9: false, ba: false, ak: 'infoUrl', bb: '詳細ページ', bq: false, bB: $elm$core$Maybe$Nothing},
		{aO: 0, aX: $elm$core$Maybe$Nothing, a0: true, a9: false, ba: true, ak: 'tags', bb: 'タグ', bq: true, bB: $elm$core$Maybe$Nothing},
		{
		aO: 0,
		aX: $elm$core$Maybe$Just('いいえ'),
		a0: true,
		a9: true,
		ba: false,
		ak: 'read',
		bb: '既読',
		bq: true,
		bB: $elm$core$Maybe$Just('はい')
	}
	]);
var $author$project$MockData$mkItem = F2(
	function (id, pairs) {
		return {
			ai: id,
			aA: $elm$core$Dict$fromList(pairs)
		};
	});
var $author$project$MockData$items = _List_fromArray(
	[
		A2(
		$author$project$MockData$mkItem,
		'item-1',
		_List_fromArray(
			[
				_Utils_Tuple2(
				'title',
				$author$project$Types$Text('深海の記録')),
				_Utils_Tuple2(
				'author',
				$author$project$Types$Text('小野寺 環')),
				_Utils_Tuple2(
				'coverUrl',
				$author$project$Types$Text('https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400')),
				_Utils_Tuple2(
				'infoUrl',
				$author$project$Types$Text('https://example.com/books/item-1')),
				_Utils_Tuple2(
				'tags',
				$author$project$Types$TextList(
					_List_fromArray(
						['海洋', '紀行']))),
				_Utils_Tuple2(
				'read',
				$author$project$Types$Boolean(true))
			])),
		A2(
		$author$project$MockData$mkItem,
		'item-2',
		_List_fromArray(
			[
				_Utils_Tuple2(
				'title',
				$author$project$Types$Text('北の灯台守')),
				_Utils_Tuple2(
				'author',
				$author$project$Types$Text('白石 誠')),
				_Utils_Tuple2(
				'coverUrl',
				$author$project$Types$Text('https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400')),
				_Utils_Tuple2(
				'infoUrl',
				$author$project$Types$Text('https://example.com/books/item-2')),
				_Utils_Tuple2(
				'tags',
				$author$project$Types$TextList(
					_List_fromArray(
						['小説']))),
				_Utils_Tuple2(
				'read',
				$author$project$Types$Boolean(false))
			])),
		A2(
		$author$project$MockData$mkItem,
		'item-3',
		_List_fromArray(
			[
				_Utils_Tuple2(
				'title',
				$author$project$Types$Text('都市計画ノート')),
				_Utils_Tuple2(
				'author',
				$author$project$Types$Text('本田 さくら')),
				_Utils_Tuple2(
				'tags',
				$author$project$Types$TextList(
					_List_fromArray(
						['建築', '都市']))),
				_Utils_Tuple2(
				'read',
				$author$project$Types$Boolean(false))
			])),
		A2(
		$author$project$MockData$mkItem,
		'item-4',
		_List_fromArray(
			[
				_Utils_Tuple2(
				'title',
				$author$project$Types$Text('静かな実験室')),
				_Utils_Tuple2(
				'author',
				$author$project$Types$Text('川上 悠')),
				_Utils_Tuple2(
				'coverUrl',
				$author$project$Types$Text('https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400')),
				_Utils_Tuple2(
				'infoUrl',
				$author$project$Types$Text('https://example.com/books/item-4')),
				_Utils_Tuple2(
				'tags',
				$author$project$Types$TextList(
					_List_fromArray(
						['科学', 'エッセイ']))),
				_Utils_Tuple2(
				'read',
				$author$project$Types$Boolean(true))
			])),
		A2(
		$author$project$MockData$mkItem,
		'item-5',
		_List_fromArray(
			[
				_Utils_Tuple2(
				'title',
				$author$project$Types$Text('旅の記憶、街の記憶')),
				_Utils_Tuple2(
				'author',
				$author$project$Types$Text('藤田 遼')),
				_Utils_Tuple2(
				'coverUrl',
				$author$project$Types$Text('https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=400')),
				_Utils_Tuple2(
				'infoUrl',
				$author$project$Types$Text('https://example.com/books/item-5')),
				_Utils_Tuple2(
				'tags',
				$author$project$Types$TextList(
					_List_fromArray(
						['紀行']))),
				_Utils_Tuple2(
				'read',
				$author$project$Types$Boolean(false))
			]))
	]);
var $author$project$MockData$dataset = {
	af: $author$project$MockData$fields,
	aZ: _List_Nil,
	ai: 'sample',
	a4: $elm$core$Maybe$Just('infoUrl'),
	aj: $author$project$MockData$items,
	bd: 'サンプル書籍データ',
	by: $elm$core$Maybe$Just('infoUrl'),
	bG: false
};
var $author$project$Main$defaultModel = {
	aG: false,
	aK: 1,
	m: $author$project$MockData$dataset,
	U: $elm$core$Maybe$Nothing,
	aQ: $elm$core$Maybe$Nothing,
	aR: false,
	aV: 0,
	D: false,
	a_: false,
	a$: $elm$core$Dict$empty,
	z: _List_Nil,
	a3: $elm$core$Maybe$Nothing,
	E: $elm$core$Maybe$Nothing,
	a5: 0,
	V: false,
	bc: 1.0,
	f: $elm$core$Maybe$Nothing,
	Y: 0,
	bm: $elm$core$Maybe$Nothing,
	bo: {al: $author$project$Types$SearchAll, bj: ''},
	bp: false,
	bs: 1.0,
	bt: false,
	bw: $elm$core$Maybe$Nothing,
	bA: $elm$core$Maybe$Nothing
};
var $elm$core$List$isEmpty = function (xs) {
	if (!xs.b) {
		return true;
	} else {
		return false;
	}
};
var $elm$core$Platform$Cmd$batch = _Platform_batch;
var $elm$core$Platform$Cmd$none = $elm$core$Platform$Cmd$batch(_List_Nil);
var $author$project$Main$init = function (flags) {
	var _v0 = $author$project$Storage$decodeState(flags);
	if (!_v0.$) {
		var state = _v0.a;
		return $elm$core$List$isEmpty(state.m.aj) ? _Utils_Tuple2($author$project$Main$defaultModel, $elm$core$Platform$Cmd$none) : _Utils_Tuple2(
			A2($author$project$Storage$applyPersistedState, state, $author$project$Main$defaultModel),
			$elm$core$Platform$Cmd$none);
	} else {
		return _Utils_Tuple2($author$project$Main$defaultModel, $elm$core$Platform$Cmd$none);
	}
};
var $author$project$Types$CloseAndApply = F2(
	function (a, b) {
		return {$: 2, a: a, b: b};
	});
var $author$project$Types$CreateItemWithId = function (a) {
	return {$: 17, a: a};
};
var $author$project$Types$DatasetFileImport = function (a) {
	return {$: 18, a: a};
};
var $author$project$Types$OpenWithTopCard = function (a) {
	return {$: 1, a: a};
};
var $author$project$Types$SortModalMsg = function (a) {
	return {$: 8, a: a};
};
var $author$project$Types$TopCardIdReceived = function (a) {
	return {$: 16, a: a};
};
var $elm$core$Platform$Sub$batch = _Platform_batch;
var $author$project$Ports$idGenerated = _Platform_incomingPort('idGenerated', $elm$json$Json$Decode$string);
var $author$project$Ports$idsArrayGenerated = _Platform_incomingPort(
	'idsArrayGenerated',
	$elm$json$Json$Decode$list($elm$json$Json$Decode$string));
var $author$project$Types$DetailModalMsg = function (a) {
	return {$: 15, a: a};
};
var $author$project$Types$DragLeft = {$: 15};
var $author$project$Types$FileFlowMsg = function (a) {
	return {$: 10, a: a};
};
var $author$project$Types$KeyDown = function (a) {
	return {$: 4, a: a};
};
var $author$project$Main$keyDecoder = function (model) {
	return A2(
		$elm$json$Json$Decode$andThen,
		function (key) {
			if (model.V && (key === 'Escape')) {
				return $elm$json$Json$Decode$succeed(
					$author$project$Types$FileFlowMsg($author$project$Types$DragLeft));
			} else {
				var _v0 = model.U;
				if (!_v0.$) {
					return $elm$json$Json$Decode$succeed(
						$author$project$Types$DetailModalMsg(
							$author$project$Types$KeyDown(key)));
				} else {
					return $elm$json$Json$Decode$fail('Ignored key');
				}
			}
		},
		A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string));
};
var $elm$core$Basics$neq = _Utils_notEqual;
var $elm$core$Platform$Sub$none = $elm$core$Platform$Sub$batch(_List_Nil);
var $elm$browser$Browser$Events$Document = 0;
var $elm$browser$Browser$Events$MySub = F3(
	function (a, b, c) {
		return {$: 0, a: a, b: b, c: c};
	});
var $elm$browser$Browser$Events$State = F2(
	function (subs, pids) {
		return {aq: pids, ay: subs};
	});
var $elm$browser$Browser$Events$init = $elm$core$Task$succeed(
	A2($elm$browser$Browser$Events$State, _List_Nil, $elm$core$Dict$empty));
var $elm$browser$Browser$Events$nodeToKey = function (node) {
	if (!node) {
		return 'd_';
	} else {
		return 'w_';
	}
};
var $elm$browser$Browser$Events$addKey = function (sub) {
	var node = sub.a;
	var name = sub.b;
	return _Utils_Tuple2(
		_Utils_ap(
			$elm$browser$Browser$Events$nodeToKey(node),
			name),
		sub);
};
var $elm$core$Process$kill = _Scheduler_kill;
var $elm$core$Dict$foldl = F3(
	function (func, acc, dict) {
		foldl:
		while (true) {
			if (dict.$ === -2) {
				return acc;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldl, func, acc, left)),
					$temp$dict = right;
				func = $temp$func;
				acc = $temp$acc;
				dict = $temp$dict;
				continue foldl;
			}
		}
	});
var $elm$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _v0) {
				stepState:
				while (true) {
					var list = _v0.a;
					var result = _v0.b;
					if (!list.b) {
						return _Utils_Tuple2(
							list,
							A3(rightStep, rKey, rValue, result));
					} else {
						var _v2 = list.a;
						var lKey = _v2.a;
						var lValue = _v2.b;
						var rest = list.b;
						if (_Utils_cmp(lKey, rKey) < 0) {
							var $temp$rKey = rKey,
								$temp$rValue = rValue,
								$temp$_v0 = _Utils_Tuple2(
								rest,
								A3(leftStep, lKey, lValue, result));
							rKey = $temp$rKey;
							rValue = $temp$rValue;
							_v0 = $temp$_v0;
							continue stepState;
						} else {
							if (_Utils_cmp(lKey, rKey) > 0) {
								return _Utils_Tuple2(
									list,
									A3(rightStep, rKey, rValue, result));
							} else {
								return _Utils_Tuple2(
									rest,
									A4(bothStep, lKey, lValue, rValue, result));
							}
						}
					}
				}
			});
		var _v3 = A3(
			$elm$core$Dict$foldl,
			stepState,
			_Utils_Tuple2(
				$elm$core$Dict$toList(leftDict),
				initialResult),
			rightDict);
		var leftovers = _v3.a;
		var intermediateResult = _v3.b;
		return A3(
			$elm$core$List$foldl,
			F2(
				function (_v4, result) {
					var k = _v4.a;
					var v = _v4.b;
					return A3(leftStep, k, v, result);
				}),
			intermediateResult,
			leftovers);
	});
var $elm$browser$Browser$Events$Event = F2(
	function (key, event) {
		return {ae: event, ak: key};
	});
var $elm$core$Platform$sendToSelf = _Platform_sendToSelf;
var $elm$browser$Browser$Events$spawn = F3(
	function (router, key, _v0) {
		var node = _v0.a;
		var name = _v0.b;
		var actualNode = function () {
			if (!node) {
				return _Browser_doc;
			} else {
				return _Browser_window;
			}
		}();
		return A2(
			$elm$core$Task$map,
			function (value) {
				return _Utils_Tuple2(key, value);
			},
			A3(
				_Browser_on,
				actualNode,
				name,
				function (event) {
					return A2(
						$elm$core$Platform$sendToSelf,
						router,
						A2($elm$browser$Browser$Events$Event, key, event));
				}));
	});
var $elm$core$Dict$union = F2(
	function (t1, t2) {
		return A3($elm$core$Dict$foldl, $elm$core$Dict$insert, t2, t1);
	});
var $elm$browser$Browser$Events$onEffects = F3(
	function (router, subs, state) {
		var stepRight = F3(
			function (key, sub, _v6) {
				var deads = _v6.a;
				var lives = _v6.b;
				var news = _v6.c;
				return _Utils_Tuple3(
					deads,
					lives,
					A2(
						$elm$core$List$cons,
						A3($elm$browser$Browser$Events$spawn, router, key, sub),
						news));
			});
		var stepLeft = F3(
			function (_v4, pid, _v5) {
				var deads = _v5.a;
				var lives = _v5.b;
				var news = _v5.c;
				return _Utils_Tuple3(
					A2($elm$core$List$cons, pid, deads),
					lives,
					news);
			});
		var stepBoth = F4(
			function (key, pid, _v2, _v3) {
				var deads = _v3.a;
				var lives = _v3.b;
				var news = _v3.c;
				return _Utils_Tuple3(
					deads,
					A3($elm$core$Dict$insert, key, pid, lives),
					news);
			});
		var newSubs = A2($elm$core$List$map, $elm$browser$Browser$Events$addKey, subs);
		var _v0 = A6(
			$elm$core$Dict$merge,
			stepLeft,
			stepBoth,
			stepRight,
			state.aq,
			$elm$core$Dict$fromList(newSubs),
			_Utils_Tuple3(_List_Nil, $elm$core$Dict$empty, _List_Nil));
		var deadPids = _v0.a;
		var livePids = _v0.b;
		var makeNewPids = _v0.c;
		return A2(
			$elm$core$Task$andThen,
			function (pids) {
				return $elm$core$Task$succeed(
					A2(
						$elm$browser$Browser$Events$State,
						newSubs,
						A2(
							$elm$core$Dict$union,
							livePids,
							$elm$core$Dict$fromList(pids))));
			},
			A2(
				$elm$core$Task$andThen,
				function (_v1) {
					return $elm$core$Task$sequence(makeNewPids);
				},
				$elm$core$Task$sequence(
					A2($elm$core$List$map, $elm$core$Process$kill, deadPids))));
	});
var $elm$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _v0 = f(mx);
		if (!_v0.$) {
			var x = _v0.a;
			return A2($elm$core$List$cons, x, xs);
		} else {
			return xs;
		}
	});
var $elm$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			$elm$core$List$maybeCons(f),
			_List_Nil,
			xs);
	});
var $elm$browser$Browser$Events$onSelfMsg = F3(
	function (router, _v0, state) {
		var key = _v0.ak;
		var event = _v0.ae;
		var toMessage = function (_v2) {
			var subKey = _v2.a;
			var _v3 = _v2.b;
			var node = _v3.a;
			var name = _v3.b;
			var decoder = _v3.c;
			return _Utils_eq(subKey, key) ? A2(_Browser_decodeEvent, decoder, event) : $elm$core$Maybe$Nothing;
		};
		var messages = A2($elm$core$List$filterMap, toMessage, state.ay);
		return A2(
			$elm$core$Task$andThen,
			function (_v1) {
				return $elm$core$Task$succeed(state);
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Platform$sendToApp(router),
					messages)));
	});
var $elm$browser$Browser$Events$subMap = F2(
	function (func, _v0) {
		var node = _v0.a;
		var name = _v0.b;
		var decoder = _v0.c;
		return A3(
			$elm$browser$Browser$Events$MySub,
			node,
			name,
			A2($elm$json$Json$Decode$map, func, decoder));
	});
_Platform_effectManagers['Browser.Events'] = _Platform_createManager($elm$browser$Browser$Events$init, $elm$browser$Browser$Events$onEffects, $elm$browser$Browser$Events$onSelfMsg, 0, $elm$browser$Browser$Events$subMap);
var $elm$browser$Browser$Events$subscription = _Platform_leaf('Browser.Events');
var $elm$browser$Browser$Events$on = F3(
	function (node, name, decoder) {
		return $elm$browser$Browser$Events$subscription(
			A3($elm$browser$Browser$Events$MySub, node, name, decoder));
	});
var $elm$browser$Browser$Events$onKeyDown = A2($elm$browser$Browser$Events$on, 0, 'keydown');
var $author$project$Main$keySubscription = function (model) {
	return (model.V || (!_Utils_eq(model.U, $elm$core$Maybe$Nothing))) ? $elm$browser$Browser$Events$onKeyDown(
		$author$project$Main$keyDecoder(model)) : $elm$core$Platform$Sub$none;
};
var $author$project$Ports$openSortModalWithTopCard = _Platform_incomingPort('openSortModalWithTopCard', $elm$json$Json$Decode$string);
var $author$project$Ports$receiveClosedSortModal = _Platform_incomingPort(
	'receiveClosedSortModal',
	A2(
		$elm$json$Json$Decode$andThen,
		function (topCardId) {
			return A2(
				$elm$json$Json$Decode$andThen,
				function (newOrder) {
					return $elm$json$Json$Decode$succeed(
						{bf: newOrder, bz: topCardId});
				},
				A2(
					$elm$json$Json$Decode$field,
					'newOrder',
					$elm$json$Json$Decode$list($elm$json$Json$Decode$string)));
		},
		A2(
			$elm$json$Json$Decode$field,
			'topCardId',
			$elm$json$Json$Decode$oneOf(
				_List_fromArray(
					[
						$elm$json$Json$Decode$null($elm$core$Maybe$Nothing),
						A2($elm$json$Json$Decode$map, $elm$core$Maybe$Just, $elm$json$Json$Decode$string)
					])))));
var $author$project$Ports$topCardIdReceived = _Platform_incomingPort(
	'topCardIdReceived',
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				$elm$json$Json$Decode$null($elm$core$Maybe$Nothing),
				A2($elm$json$Json$Decode$map, $elm$core$Maybe$Just, $elm$json$Json$Decode$string)
			])));
var $author$project$Main$subscriptions = function (model) {
	return $elm$core$Platform$Sub$batch(
		_List_fromArray(
			[
				$author$project$Ports$openSortModalWithTopCard(
				A2($elm$core$Basics$composeR, $author$project$Types$OpenWithTopCard, $author$project$Types$SortModalMsg)),
				$author$project$Ports$receiveClosedSortModal(
				function (data) {
					return $author$project$Types$SortModalMsg(
						A2($author$project$Types$CloseAndApply, data.bf, data.bz));
				}),
				$author$project$Ports$topCardIdReceived($author$project$Types$TopCardIdReceived),
				$author$project$Ports$idGenerated($author$project$Types$CreateItemWithId),
				$author$project$Ports$idsArrayGenerated($author$project$Types$DatasetFileImport),
				$author$project$Main$keySubscription(model)
			]));
};
var $elm$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			if (!list.b) {
				return false;
			} else {
				var x = list.a;
				var xs = list.b;
				if (isOkay(x)) {
					return true;
				} else {
					var $temp$isOkay = isOkay,
						$temp$list = xs;
					isOkay = $temp$isOkay;
					list = $temp$list;
					continue any;
				}
			}
		}
	});
var $elm$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			if (dict.$ === -2) {
				return $elm$core$Maybe$Nothing;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var _v1 = A2($elm$core$Basics$compare, targetKey, key);
				switch (_v1) {
					case 0:
						var $temp$targetKey = targetKey,
							$temp$dict = left;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
					case 1:
						return $elm$core$Maybe$Just(value);
					default:
						var $temp$targetKey = targetKey,
							$temp$dict = right;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
				}
			}
		}
	});
var $author$project$Update$ItemManager$isBooleanValue = function (val) {
	if (val.$ === 2) {
		return true;
	} else {
		return false;
	}
};
var $author$project$Update$ItemManager$hasAnyBooleanValueInDataset = F2(
	function (dataset, field) {
		return A2(
			$elm$core$List$any,
			$author$project$Update$ItemManager$isBooleanValue,
			A2(
				$elm$core$List$filterMap,
				function (item) {
					return A2($elm$core$Dict$get, field.ak, item.aA);
				},
				dataset.aj));
	});
var $author$project$Update$ItemManager$defaultFieldValue = F2(
	function (dataset, field) {
		return (field.a9 || A2($author$project$Update$ItemManager$hasAnyBooleanValueInDataset, dataset, field)) ? $author$project$Types$Boolean(false) : $author$project$Types$Text('');
	});
var $author$project$Update$ItemManager$toFieldEntry = F2(
	function (dataset, field) {
		return _Utils_Tuple2(
			field.ak,
			A2($author$project$Update$ItemManager$defaultFieldValue, dataset, field));
	});
var $author$project$Update$ItemManager$buildDefaultValues = function (dataset) {
	return $elm$core$Dict$fromList(
		A2(
			$elm$core$List$map,
			$author$project$Update$ItemManager$toFieldEntry(dataset),
			dataset.af));
};
var $author$project$Update$ItemManager$buildNewItem = F2(
	function (uuid, dataset) {
		return {
			ai: uuid,
			aA: $author$project$Update$ItemManager$buildDefaultValues(dataset)
		};
	});
var $author$project$Update$ItemManager$insertAtMatch = F4(
	function (targetId, newItem, current, items) {
		return _Utils_eq(current.ai, targetId) ? A2(
			$elm$core$List$cons,
			newItem,
			A2($elm$core$List$cons, current, items)) : A2(
			$elm$core$List$cons,
			current,
			A3($author$project$Update$ItemManager$insertBeforeId, targetId, newItem, items));
	});
var $author$project$Update$ItemManager$insertBeforeId = F3(
	function (targetId, newItem, items) {
		if (!items.b) {
			return _List_fromArray(
				[newItem]);
		} else {
			var head = items.a;
			var tail = items.b;
			return A4($author$project$Update$ItemManager$insertAtMatch, targetId, newItem, head, tail);
		}
	});
var $author$project$Update$ItemManager$placeItem = F3(
	function (maybeTargetId, newItem, items) {
		if (!maybeTargetId.$) {
			var targetId = maybeTargetId.a;
			return A3($author$project$Update$ItemManager$insertBeforeId, targetId, newItem, items);
		} else {
			return A2($elm$core$List$cons, newItem, items);
		}
	});
var $author$project$Update$ItemManager$insertNewItem = F3(
	function (uuid, maybeTargetId, dataset) {
		return _Utils_update(
			dataset,
			{
				aj: A3(
					$author$project$Update$ItemManager$placeItem,
					maybeTargetId,
					A2($author$project$Update$ItemManager$buildNewItem, uuid, dataset),
					dataset.aj)
			});
	});
var $author$project$History$maxSize = 20;
var $author$project$History$snapshotOf = function (model) {
	return {m: model.m};
};
var $elm$core$List$takeReverse = F3(
	function (n, list, kept) {
		takeReverse:
		while (true) {
			if (n <= 0) {
				return kept;
			} else {
				if (!list.b) {
					return kept;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs,
						$temp$kept = A2($elm$core$List$cons, x, kept);
					n = $temp$n;
					list = $temp$list;
					kept = $temp$kept;
					continue takeReverse;
				}
			}
		}
	});
var $elm$core$List$takeTailRec = F2(
	function (n, list) {
		return $elm$core$List$reverse(
			A3($elm$core$List$takeReverse, n, list, _List_Nil));
	});
var $elm$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (n <= 0) {
			return _List_Nil;
		} else {
			var _v0 = _Utils_Tuple2(n, list);
			_v0$1:
			while (true) {
				_v0$5:
				while (true) {
					if (!_v0.b.b) {
						return list;
					} else {
						if (_v0.b.b.b) {
							switch (_v0.a) {
								case 1:
									break _v0$1;
								case 2:
									var _v2 = _v0.b;
									var x = _v2.a;
									var _v3 = _v2.b;
									var y = _v3.a;
									return _List_fromArray(
										[x, y]);
								case 3:
									if (_v0.b.b.b.b) {
										var _v4 = _v0.b;
										var x = _v4.a;
										var _v5 = _v4.b;
										var y = _v5.a;
										var _v6 = _v5.b;
										var z = _v6.a;
										return _List_fromArray(
											[x, y, z]);
									} else {
										break _v0$5;
									}
								default:
									if (_v0.b.b.b.b && _v0.b.b.b.b.b) {
										var _v7 = _v0.b;
										var x = _v7.a;
										var _v8 = _v7.b;
										var y = _v8.a;
										var _v9 = _v8.b;
										var z = _v9.a;
										var _v10 = _v9.b;
										var w = _v10.a;
										var tl = _v10.b;
										return (ctr > 1000) ? A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A2($elm$core$List$takeTailRec, n - 4, tl))))) : A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A3($elm$core$List$takeFast, ctr + 1, n - 4, tl)))));
									} else {
										break _v0$5;
									}
							}
						} else {
							if (_v0.a === 1) {
								break _v0$1;
							} else {
								break _v0$5;
							}
						}
					}
				}
				return list;
			}
			var _v1 = _v0.b;
			var x = _v1.a;
			return _List_fromArray(
				[x]);
		}
	});
var $elm$core$List$take = F2(
	function (n, list) {
		return A3($elm$core$List$takeFast, 0, n, list);
	});
var $author$project$History$push = F2(
	function (model, stack) {
		return A2(
			$elm$core$List$take,
			$author$project$History$maxSize,
			A2(
				$elm$core$List$cons,
				$author$project$History$snapshotOf(model),
				stack));
	});
var $author$project$Update$ItemManager$recordHistory = F2(
	function (snapshot, model) {
		return _Utils_update(
			model,
			{
				z: A2($author$project$History$push, snapshot, model.z)
			});
	});
var $elm$json$Json$Encode$string = _Json_wrap;
var $author$project$Storage$encodeCardSize = function (size) {
	return $elm$json$Json$Encode$string(
		function () {
			switch (size) {
				case 0:
					return 'small';
				case 1:
					return 'medium';
				default:
					return 'large';
			}
		}());
};
var $elm$json$Json$Encode$bool = _Json_wrap;
var $author$project$DomainJson$encodeDisplayRole = function (role) {
	return $elm$json$Json$Encode$string(
		function () {
			switch (role) {
				case 0:
					return 'plain';
				case 1:
					return 'title';
				case 2:
					return 'image';
				default:
					return 'link';
			}
		}());
};
var $elm$json$Json$Encode$null = _Json_encodeNull;
var $author$project$DomainJson$encodeMaybeString = function (maybeValue) {
	if (!maybeValue.$) {
		var s = maybeValue.a;
		return $elm$json$Json$Encode$string(s);
	} else {
		return $elm$json$Json$Encode$null;
	}
};
var $elm$json$Json$Encode$object = function (pairs) {
	return _Json_wrap(
		A3(
			$elm$core$List$foldl,
			F2(
				function (_v0, obj) {
					var k = _v0.a;
					var v = _v0.b;
					return A3(_Json_addField, k, v, obj);
				}),
			_Json_emptyObject(0),
			pairs));
};
var $author$project$DomainJson$encodeFieldConfig = function (field) {
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'key',
				$elm$json$Json$Encode$string(field.ak)),
				_Utils_Tuple2(
				'label',
				$elm$json$Json$Encode$string(field.bb)),
				_Utils_Tuple2(
				'displayRole',
				$author$project$DomainJson$encodeDisplayRole(field.aO)),
				_Utils_Tuple2(
				'showOnCard',
				$elm$json$Json$Encode$bool(field.bq)),
				_Utils_Tuple2(
				'filterable',
				$elm$json$Json$Encode$bool(field.a0)),
				_Utils_Tuple2(
				'isBool',
				$elm$json$Json$Encode$bool(field.a9)),
				_Utils_Tuple2(
				'isTextList',
				$elm$json$Json$Encode$bool(field.ba)),
				_Utils_Tuple2(
				'trueLabel',
				$author$project$DomainJson$encodeMaybeString(field.bB)),
				_Utils_Tuple2(
				'falseLabel',
				$author$project$DomainJson$encodeMaybeString(field.aX))
			]));
};
var $elm$json$Json$Encode$list = F2(
	function (func, entries) {
		return _Json_wrap(
			A3(
				$elm$core$List$foldl,
				_Json_addEntry(func),
				_Json_emptyArray(0),
				entries));
	});
var $author$project$DomainJson$encodeValue = function (value) {
	switch (value.$) {
		case 0:
			var s = value.a;
			return $elm$json$Json$Encode$string(s);
		case 1:
			var xs = value.a;
			return A2($elm$json$Json$Encode$list, $elm$json$Json$Encode$string, xs);
		default:
			var b = value.a;
			return $elm$json$Json$Encode$bool(b);
	}
};
var $author$project$DomainJson$encodeValues = function (values) {
	return $elm$json$Json$Encode$object(
		A2(
			$elm$core$List$map,
			function (_v0) {
				var k = _v0.a;
				var v = _v0.b;
				return _Utils_Tuple2(
					k,
					$author$project$DomainJson$encodeValue(v));
			},
			$elm$core$Dict$toList(values)));
};
var $author$project$DomainJson$encodeItem = function (item) {
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'id',
				$elm$json$Json$Encode$string(item.ai)),
				_Utils_Tuple2(
				'values',
				$author$project$DomainJson$encodeValues(item.aA))
			]));
};
var $author$project$DomainJson$encodeDataset = function (dataset) {
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'id',
				$elm$json$Json$Encode$string(dataset.ai)),
				_Utils_Tuple2(
				'name',
				$elm$json$Json$Encode$string(dataset.bd)),
				_Utils_Tuple2(
				'fields',
				A2($elm$json$Json$Encode$list, $author$project$DomainJson$encodeFieldConfig, dataset.af)),
				_Utils_Tuple2(
				'items',
				A2($elm$json$Json$Encode$list, $author$project$DomainJson$encodeItem, dataset.aj)),
				_Utils_Tuple2(
				'imageLinkField',
				$author$project$DomainJson$encodeMaybeString(dataset.a4)),
				_Utils_Tuple2(
				'titleLinkField',
				$author$project$DomainJson$encodeMaybeString(dataset.by)),
				_Utils_Tuple2(
				'filterOrder',
				A2($elm$json$Json$Encode$list, $elm$json$Json$Encode$string, dataset.aZ)),
				_Utils_Tuple2(
				'wrapTitleOnCard',
				$elm$json$Json$Encode$bool(dataset.bG))
			]));
};
var $elm$json$Json$Encode$dict = F3(
	function (toKey, toValue, dictionary) {
		return _Json_wrap(
			A3(
				$elm$core$Dict$foldl,
				F3(
					function (key, value, obj) {
						return A3(
							_Json_addField,
							toKey(key),
							toValue(value),
							obj);
					}),
				_Json_emptyObject(0),
				dictionary));
	});
var $author$project$Storage$encodeBetweenRelation = function (rel) {
	return $elm$json$Json$Encode$string(
		function () {
			switch (rel) {
				case 0:
					return 'and';
				case 1:
					return 'or';
				default:
					return 'not';
			}
		}());
};
var $author$project$Storage$encodeWithinRelation = function (rel) {
	return $elm$json$Json$Encode$string(
		function () {
			if (!rel) {
				return 'and';
			} else {
				return 'or';
			}
		}());
};
var $author$project$Storage$encodeFilterUiState = function (ui) {
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'selected',
				A2(
					$elm$json$Json$Encode$list,
					$elm$json$Json$Encode$string,
					$elm$core$Set$toList(ui.l))),
				_Utils_Tuple2(
				'betweenRelation',
				$author$project$Storage$encodeBetweenRelation(ui.S)),
				_Utils_Tuple2(
				'withinRelation',
				$author$project$Storage$encodeWithinRelation(ui.aC)),
				_Utils_Tuple2(
				'collapsed',
				$elm$json$Json$Encode$bool(ui.aM))
			]));
};
var $author$project$Storage$encodeFilterUi = function (filterUi) {
	return A3($elm$json$Json$Encode$dict, $elm$core$Basics$identity, $author$project$Storage$encodeFilterUiState, filterUi);
};
var $author$project$Storage$encodeState = function (model) {
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'dataset',
				$author$project$DomainJson$encodeDataset(model.m)),
				_Utils_Tuple2(
				'cardSize',
				$author$project$Storage$encodeCardSize(model.aK)),
				_Utils_Tuple2(
				'filterUi',
				$author$project$Storage$encodeFilterUi(model.a$))
			]));
};
var $author$project$Ports$saveState = _Platform_outgoingPort('saveState', $elm$core$Basics$identity);
var $author$project$Storage$save = function (model) {
	return $author$project$Ports$saveState(
		$author$project$Storage$encodeState(model));
};
var $author$project$Update$ItemManager$saveModel = function (model) {
	return _Utils_Tuple2(
		model,
		$author$project$Storage$save(model));
};
var $author$project$Update$ItemManager$updateModelDatasets = F2(
	function (model, updatedDataset) {
		return _Utils_update(
			model,
			{m: updatedDataset});
	});
var $author$project$Update$ItemManager$appendItemAndSave = F4(
	function (uuid, maybeTopId, model, dataset) {
		return $author$project$Update$ItemManager$saveModel(
			A2(
				$author$project$Update$ItemManager$recordHistory,
				model,
				A2(
					$author$project$Update$ItemManager$updateModelDatasets,
					model,
					A3($author$project$Update$ItemManager$insertNewItem, uuid, maybeTopId, dataset))));
	});
var $author$project$Update$ItemManager$createNewItemWithUuid = F3(
	function (uuid, maybeTopId, model) {
		return A4($author$project$Update$ItemManager$appendItemAndSave, uuid, maybeTopId, model, model.m);
	});
var $elm$core$Maybe$map = F2(
	function (f, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return $elm$core$Maybe$Just(
				f(value));
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $author$project$Import$toItem = F2(
	function (uuid, pairs) {
		return {
			ai: uuid,
			aA: $elm$core$Dict$fromList(pairs)
		};
	});
var $author$project$Import$buildItems = F2(
	function (uuids, rawItems) {
		return A3($elm$core$List$map2, $author$project$Import$toItem, uuids, rawItems);
	});
var $author$project$Import$existingKeysOf = function (fields) {
	return A2(
		$elm$core$List$map,
		function ($) {
			return $.ak;
		},
		fields);
};
var $elm$core$Dict$member = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$get, key, dict);
		if (!_v0.$) {
			return true;
		} else {
			return false;
		}
	});
var $author$project$Import$fillItemBools = F2(
	function (boolKeys, item) {
		var filledValues = A3(
			$elm$core$List$foldl,
			F2(
				function (key, acc) {
					return A2($elm$core$Dict$member, key, acc) ? acc : A3(
						$elm$core$Dict$insert,
						key,
						$author$project$Types$Boolean(false),
						acc);
				}),
			item.aA,
			boolKeys);
		return _Utils_update(
			item,
			{aA: filledValues});
	});
var $author$project$Import$fillMissingBools = F2(
	function (fields, items) {
		var boolKeys = A2(
			$elm$core$List$map,
			function ($) {
				return $.ak;
			},
			A2(
				$elm$core$List$filter,
				function ($) {
					return $.a9;
				},
				fields));
		return $elm$core$List$isEmpty(boolKeys) ? items : A2(
			$elm$core$List$map,
			$author$project$Import$fillItemBools(boolKeys),
			items);
	});
var $elm$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			$elm$core$List$any,
			A2($elm$core$Basics$composeL, $elm$core$Basics$not, isOkay),
			list);
	});
var $author$project$Import$defaultFieldConfig = function (key) {
	return {aO: 0, aX: $elm$core$Maybe$Nothing, a0: false, a9: false, ba: false, ak: key, bb: key, bq: true, bB: $elm$core$Maybe$Nothing};
};
var $elm$core$List$head = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(x);
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $author$project$Import$firstTextValue = function (values) {
	return $elm$core$List$head(
		A2(
			$elm$core$List$filterMap,
			function (v) {
				if (!v.$) {
					var s = v.a;
					return $elm$core$String$isEmpty(
						$elm$core$String$trim(s)) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(s);
				} else {
					return $elm$core$Maybe$Nothing;
				}
			},
			values));
};
var $elm$core$String$endsWith = _String_endsWith;
var $elm$core$String$toLower = _String_toLower;
var $author$project$Import$isWebUrl = function (str) {
	var lower = $elm$core$String$toLower(
		$elm$core$String$trim(str));
	return A2($elm$core$String$startsWith, 'http://', lower) || A2($elm$core$String$startsWith, 'https://', lower);
};
var $elm$core$Maybe$withDefault = F2(
	function (_default, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return value;
		} else {
			return _default;
		}
	});
var $author$project$Import$isImageUrl = function (url) {
	if ($author$project$Import$isWebUrl(url)) {
		var imageExtensions = _List_fromArray(
			['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp']);
		var cleanPath = $elm$core$String$toLower(
			A2(
				$elm$core$Maybe$withDefault,
				url,
				$elm$core$List$head(
					A2(
						$elm$core$String$split,
						'#',
						A2(
							$elm$core$Maybe$withDefault,
							url,
							$elm$core$List$head(
								A2($elm$core$String$split, '?', url)))))));
		return A2(
			$elm$core$List$any,
			function (ext) {
				return A2($elm$core$String$endsWith, ext, cleanPath);
			},
			imageExtensions);
	} else {
		return false;
	}
};
var $author$project$Import$inferDisplayRole = F2(
	function (key, values) {
		var lowerKey = $elm$core$String$toLower(
			$elm$core$String$trim(key));
		if (lowerKey === 'title') {
			return 1;
		} else {
			var _v0 = $author$project$Import$firstTextValue(values);
			if (!_v0.$) {
				var textStr = _v0.a;
				var trimmed = $elm$core$String$trim(textStr);
				return $author$project$Import$isImageUrl(trimmed) ? 2 : ($author$project$Import$isWebUrl(trimmed) ? 3 : 0);
			} else {
				return 0;
			}
		}
	});
var $author$project$Import$isBooleanValue = function (val) {
	if (val.$ === 2) {
		return true;
	} else {
		return false;
	}
};
var $author$project$Import$isTextListValue = function (val) {
	if (val.$ === 1) {
		return true;
	} else {
		return false;
	}
};
var $author$project$Import$inferFieldConfig = F2(
	function (key, rawItems) {
		var valuesForKey = A2(
			$elm$core$List$concatMap,
			function (item) {
				return A2(
					$elm$core$List$filterMap,
					function (_v0) {
						var k = _v0.a;
						var v = _v0.b;
						return _Utils_eq(k, key) ? $elm$core$Maybe$Just(v) : $elm$core$Maybe$Nothing;
					},
					item);
			},
			rawItems);
		var isTextListType = $elm$core$List$isEmpty(valuesForKey) ? false : A2($elm$core$List$any, $author$project$Import$isTextListValue, valuesForKey);
		var isBoolType = $elm$core$List$isEmpty(valuesForKey) ? false : A2($elm$core$List$all, $author$project$Import$isBooleanValue, valuesForKey);
		var inferredRole = A2($author$project$Import$inferDisplayRole, key, valuesForKey);
		var base = $author$project$Import$defaultFieldConfig(key);
		return _Utils_update(
			base,
			{aO: inferredRole, a9: isBoolType, ba: isTextListType});
	});
var $elm$core$List$member = F2(
	function (x, xs) {
		return A2(
			$elm$core$List$any,
			function (a) {
				return _Utils_eq(a, x);
			},
			xs);
	});
var $author$project$Import$restrictKeys = F2(
	function (allowedKeys, pairs) {
		return A2(
			$elm$core$List$filter,
			function (_v0) {
				var key = _v0.a;
				return A2($elm$core$List$member, key, allowedKeys);
			},
			pairs);
	});
var $author$project$Import$mergeInto = F4(
	function (includeNewKeys, uuids, pending, target) {
		var newFields = includeNewKeys ? _Utils_ap(
			target.af,
			A2(
				$elm$core$List$map,
				function (key) {
					return A2($author$project$Import$inferFieldConfig, key, pending.G);
				},
				pending.an)) : target.af;
		var effectiveRawItems = includeNewKeys ? pending.G : A2(
			$elm$core$List$map,
			$author$project$Import$restrictKeys(
				$author$project$Import$existingKeysOf(target.af)),
			pending.G);
		var newItems = A2($author$project$Import$buildItems, uuids, effectiveRawItems);
		var mergedItems = function () {
			var _v0 = pending.al;
			if (_v0 === 2) {
				return newItems;
			} else {
				return _Utils_ap(target.aj, newItems);
			}
		}();
		return _Utils_update(
			target,
			{
				af: newFields,
				aj: A2($author$project$Import$fillMissingBools, newFields, mergedItems)
			});
	});
var $author$project$Import$applyChoice = F4(
	function (choice, uuids, pending, target) {
		switch (choice) {
			case 2:
				return $elm$core$Maybe$Nothing;
			case 0:
				return $elm$core$Maybe$Just(
					A4($author$project$Import$mergeInto, true, uuids, pending, target));
			default:
				return $elm$core$Maybe$Just(
					A4($author$project$Import$mergeInto, false, uuids, pending, target));
		}
	});
var $author$project$FileFlow$save = function (model) {
	return _Utils_Tuple2(
		model,
		$author$project$Storage$save(model));
};
var $author$project$FileFlow$applyImportAndSave = F4(
	function (choice, uuids, pending, model) {
		var _v0 = A4($author$project$Import$applyChoice, choice, uuids, pending, model.m);
		if (!_v0.$) {
			var updated = _v0.a;
			return $author$project$FileFlow$save(
				_Utils_update(
					model,
					{
						m: updated,
						D: false,
						z: A2($author$project$History$push, model, model.z),
						f: $elm$core$Maybe$Nothing
					}));
		} else {
			return _Utils_Tuple2(
				_Utils_update(
					model,
					{f: $elm$core$Maybe$Nothing}),
				$elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Update$applyImportToCurrentDataset = F3(
	function (uuids, pending, model) {
		return A4($author$project$FileFlow$applyImportAndSave, pending.T, uuids, pending, model);
	});
var $author$project$Import$addKeyIfNew = F2(
	function (_v0, acc) {
		var key = _v0.a;
		return A2($elm$core$List$member, key, acc) ? acc : A2($elm$core$List$cons, key, acc);
	});
var $author$project$Import$collectFromItem = F2(
	function (pairs, acc) {
		return A3($elm$core$List$foldl, $author$project$Import$addKeyIfNew, acc, pairs);
	});
var $author$project$Import$collectKeyOrder = function (rawItems) {
	return $elm$core$List$reverse(
		A3($elm$core$List$foldl, $author$project$Import$collectFromItem, _List_Nil, rawItems));
};
var $author$project$Import$buildNewDataset = F4(
	function (newId, name, uuids, rawItems) {
		var keys = $author$project$Import$collectKeyOrder(rawItems);
		var items = A2($author$project$Import$buildItems, uuids, rawItems);
		var fields = A2(
			$elm$core$List$map,
			function (key) {
				return A2($author$project$Import$inferFieldConfig, key, rawItems);
			},
			keys);
		return {
			af: fields,
			aZ: _List_Nil,
			ai: newId,
			a4: $elm$core$Maybe$Nothing,
			aj: A2($author$project$Import$fillMissingBools, fields, items),
			bd: name,
			by: $elm$core$Maybe$Nothing,
			bG: false
		};
	});
var $author$project$FileFlow$datasetNameOrDefault = function (input) {
	return $elm$core$String$isEmpty(
		$elm$core$String$trim(input)) ? '新しいデータ' : input;
};
var $author$project$FileFlow$finaliseNewDatasetImport = F2(
	function (uuids, model) {
		var _v0 = model.f;
		if (!_v0.$) {
			var pending = _v0.a;
			var newDataset = A4(
				$author$project$Import$buildNewDataset,
				model.m.ai,
				$author$project$FileFlow$datasetNameOrDefault(pending.P),
				uuids,
				pending.G);
			return $author$project$FileFlow$save(
				_Utils_update(
					model,
					{
						m: newDataset,
						D: false,
						z: A2($author$project$History$push, model, model.z),
						f: $elm$core$Maybe$Nothing
					}));
		} else {
			return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Update$processPendingImport = F3(
	function (uuids, model, pending) {
		var _v0 = pending.al;
		if (!_v0) {
			return A2($author$project$FileFlow$finaliseNewDatasetImport, uuids, model);
		} else {
			return A3($author$project$Update$applyImportToCurrentDataset, uuids, pending, model);
		}
	});
var $author$project$Update$fileImport = F2(
	function (uuids, model) {
		return A2(
			$elm$core$Maybe$withDefault,
			_Utils_Tuple2(model, $elm$core$Platform$Cmd$none),
			A2(
				$elm$core$Maybe$map,
				A2($author$project$Update$processPendingImport, uuids, model),
				model.f));
	});
var $elm$core$Tuple$pair = F2(
	function (a, b) {
		return _Utils_Tuple2(a, b);
	});
var $author$project$Update$DetailModalManager$findIdIndex = F2(
	function (targetId, list) {
		return A2(
			$elm$core$Maybe$map,
			$elm$core$Tuple$first,
			$elm$core$List$head(
				A2(
					$elm$core$List$filter,
					function (_v0) {
						var id = _v0.b;
						return _Utils_eq(id, targetId);
					},
					A2($elm$core$List$indexedMap, $elm$core$Tuple$pair, list))));
	});
var $elm$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (n <= 0) {
				return list;
			} else {
				if (!list.b) {
					return list;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs;
					n = $temp$n;
					list = $temp$list;
					continue drop;
				}
			}
		}
	});
var $author$project$Update$DetailModalManager$getAt = F2(
	function (index, list) {
		return (index < 0) ? $elm$core$Maybe$Nothing : $elm$core$List$head(
			A2($elm$core$List$drop, index, list));
	});
var $author$project$Filter$defaultFilterUi = {S: 0, aM: false, bl: false, l: $elm$core$Set$empty, aC: 1};
var $author$project$Filter$filterUiFor = F2(
	function (key, filterUi) {
		return A2(
			$elm$core$Maybe$withDefault,
			$author$project$Filter$defaultFilterUi,
			A2($elm$core$Dict$get, key, filterUi));
	});
var $elm$core$Dict$isEmpty = function (dict) {
	if (dict.$ === -2) {
		return true;
	} else {
		return false;
	}
};
var $elm$core$Set$isEmpty = function (_v0) {
	var dict = _v0;
	return $elm$core$Dict$isEmpty(dict);
};
var $author$project$Filter$booleanOptionValue = function (b) {
	return b ? 'true' : 'false';
};
var $author$project$Filter$optionKeysOfItem = F2(
	function (key, item) {
		var _v0 = A2($elm$core$Dict$get, key, item.aA);
		if (!_v0.$) {
			switch (_v0.a.$) {
				case 0:
					var s = _v0.a.a;
					return _List_fromArray(
						[s]);
				case 1:
					var xs = _v0.a.a;
					return xs;
				default:
					var b = _v0.a.a;
					return _List_fromArray(
						[
							$author$project$Filter$booleanOptionValue(b)
						]);
			}
		} else {
			return _List_Nil;
		}
	});
var $author$project$Filter$itemMatchesFilter = F3(
	function (field, ui, item) {
		if ($elm$core$Set$isEmpty(ui.l)) {
			return true;
		} else {
			var itemValues = A2($author$project$Filter$optionKeysOfItem, field.ak, item);
			var optionIsPresent = function (selectedValue) {
				return A2($elm$core$List$member, selectedValue, itemValues);
			};
			var _v0 = ui.aC;
			if (_v0 === 1) {
				return A2(
					$elm$core$List$any,
					optionIsPresent,
					$elm$core$Set$toList(ui.l));
			} else {
				return A2(
					$elm$core$List$all,
					optionIsPresent,
					$elm$core$Set$toList(ui.l));
			}
		}
	});
var $author$project$Filter$passesAllFilters = F3(
	function (filterUiDict, dataset, item) {
		var matches = function (_v2) {
			var field = _v2.a;
			var ui = _v2.b;
			return A3($author$project$Filter$itemMatchesFilter, field, ui, item);
		};
		var active = A2(
			$elm$core$List$filter,
			function (_v1) {
				var ui = _v1.b;
				return !$elm$core$Set$isEmpty(ui.l);
			},
			A2(
				$elm$core$List$map,
				function (field) {
					return _Utils_Tuple2(
						field,
						A2($author$project$Filter$filterUiFor, field.ak, filterUiDict));
				},
				A2(
					$elm$core$List$filter,
					function ($) {
						return $.a0;
					},
					dataset.af)));
		var inGroup = function (relation) {
			return A2(
				$elm$core$List$filter,
				function (_v0) {
					var ui = _v0.b;
					return _Utils_eq(ui.S, relation);
				},
				active);
		};
		return A2(
			$elm$core$List$all,
			matches,
			inGroup(0)) && (($elm$core$List$isEmpty(
			inGroup(1)) || A2(
			$elm$core$List$any,
			matches,
			inGroup(1))) && A2(
			$elm$core$List$all,
			A2($elm$core$Basics$composeR, matches, $elm$core$Basics$not),
			inGroup(2)));
	});
var $author$project$Search$valueToString = function (value) {
	switch (value.$) {
		case 0:
			var s = value.a;
			return $elm$core$String$toLower(s);
		case 1:
			var xs = value.a;
			return A2(
				$elm$core$String$join,
				' ',
				A2($elm$core$List$map, $elm$core$String$toLower, xs));
		default:
			var b = value.a;
			return b ? 'true' : 'false';
	}
};
var $elm$core$Dict$values = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return A2($elm$core$List$cons, value, valueList);
			}),
		_List_Nil,
		dict);
};
var $author$project$Search$matchesSearchAll = F2(
	function (queryLower, item) {
		return A2(
			$elm$core$List$any,
			function (value) {
				return A2(
					$elm$core$String$contains,
					queryLower,
					$author$project$Search$valueToString(value));
			},
			$elm$core$Dict$values(item.aA));
	});
var $author$project$Search$matchesSearchFields = F3(
	function (queryLower, fieldKeys, item) {
		return A2(
			$elm$core$List$any,
			function (fieldKey) {
				return A2(
					$elm$core$Maybe$withDefault,
					false,
					A2(
						$elm$core$Maybe$map,
						function (value) {
							return A2(
								$elm$core$String$contains,
								queryLower,
								$author$project$Search$valueToString(value));
						},
						A2($elm$core$Dict$get, fieldKey, item.aA)));
			},
			$elm$core$Set$toList(fieldKeys));
	});
var $author$project$Search$queryToLowercase = $elm$core$String$toLower;
var $author$project$Search$matchesSearch = F3(
	function (searchState, dataset, item) {
		if ($elm$core$String$isEmpty(
			$elm$core$String$trim(searchState.bj))) {
			return true;
		} else {
			var queryLower = $author$project$Search$queryToLowercase(searchState.bj);
			var _v0 = searchState.al;
			if (!_v0.$) {
				return A2($author$project$Search$matchesSearchAll, queryLower, item);
			} else {
				var fieldKeys = _v0.a;
				return $elm$core$Set$isEmpty(fieldKeys) ? true : A3($author$project$Search$matchesSearchFields, queryLower, fieldKeys, item);
			}
		}
	});
var $author$project$Search$searchResults = F2(
	function (searchState, dataset) {
		return A2(
			$elm$core$List$filter,
			A2($author$project$Search$matchesSearch, searchState, dataset),
			dataset.aj);
	});
var $author$project$Filter$searchAndFilter = F3(
	function (searchState, filterUiDict, dataset) {
		var searchedItems = A2($author$project$Search$searchResults, searchState, dataset);
		var filteredItems = A2(
			$elm$core$List$filter,
			A2($author$project$Filter$passesAllFilters, filterUiDict, dataset),
			searchedItems);
		return filteredItems;
	});
var $author$project$Filter$visibleItems = F3(
	function (searchState, filterUiDict, dataset) {
		return A3($author$project$Filter$searchAndFilter, searchState, filterUiDict, dataset);
	});
var $author$project$Update$DetailModalManager$navigateCard = F2(
	function (delta, model) {
		var _v0 = model.U;
		if (!_v0.$) {
			var currentId = _v0.a;
			var items = A3($author$project$Filter$visibleItems, model.bo, model.a$, model.m);
			var ids = A2(
				$elm$core$List$map,
				function ($) {
					return $.ai;
				},
				items);
			var currentIndex = A2($author$project$Update$DetailModalManager$findIdIndex, currentId, ids);
			if (!currentIndex.$) {
				var idx = currentIndex.a;
				var nextIdx = idx + delta;
				var _v2 = A2($author$project$Update$DetailModalManager$getAt, nextIdx, ids);
				if (!_v2.$) {
					var nextId = _v2.a;
					return _Utils_update(
						model,
						{
							U: $elm$core$Maybe$Just(nextId)
						});
				} else {
					return model;
				}
			} else {
				return model;
			}
		} else {
			return model;
		}
	});
var $elm$core$Basics$negate = function (n) {
	return -n;
};
var $author$project$Update$DetailModalManager$handleDetailModalMsg = F2(
	function (msg, model) {
		switch (msg.$) {
			case 0:
				var itemId = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							U: $elm$core$Maybe$Just(itemId)
						}),
					$elm$core$Platform$Cmd$none);
			case 1:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{U: $elm$core$Maybe$Nothing}),
					$elm$core$Platform$Cmd$none);
			case 2:
				return _Utils_Tuple2(
					A2($author$project$Update$DetailModalManager$navigateCard, 1, model),
					$elm$core$Platform$Cmd$none);
			case 3:
				return _Utils_Tuple2(
					A2($author$project$Update$DetailModalManager$navigateCard, -1, model),
					$elm$core$Platform$Cmd$none);
			default:
				var key = msg.a;
				switch (key) {
					case 'ArrowRight':
						return _Utils_Tuple2(
							A2($author$project$Update$DetailModalManager$navigateCard, 1, model),
							$elm$core$Platform$Cmd$none);
					case 'ArrowLeft':
						return _Utils_Tuple2(
							A2($author$project$Update$DetailModalManager$navigateCard, -1, model),
							$elm$core$Platform$Cmd$none);
					case 'Escape':
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{U: $elm$core$Maybe$Nothing}),
							$elm$core$Platform$Cmd$none);
					default:
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
		}
	});
var $author$project$Update$saveAfter = function (model) {
	return _Utils_Tuple2(
		model,
		$author$project$Storage$save(model));
};
var $author$project$Ports$scrollToTop = _Platform_outgoingPort(
	'scrollToTop',
	function ($) {
		return $elm$json$Json$Encode$null;
	});
var $author$project$Update$setCardSize = F2(
	function (size, model) {
		return _Utils_update(
			model,
			{aK: size, bc: 1.0});
	});
var $author$project$History$applySnapshot = F2(
	function (snapshot, model) {
		return _Utils_update(
			model,
			{m: snapshot.m});
	});
var $author$project$History$pop = function (stack) {
	if (stack.b) {
		var top = stack.a;
		var rest = stack.b;
		return $elm$core$Maybe$Just(
			_Utils_Tuple2(top, rest));
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $author$project$Update$undo = function (model) {
	var _v0 = $author$project$History$pop(model.z);
	if (!_v0.$) {
		var _v1 = _v0.a;
		var snapshot = _v1.a;
		var rest = _v1.b;
		return A2(
			$author$project$History$applySnapshot,
			snapshot,
			_Utils_update(
				model,
				{z: rest}));
	} else {
		return model;
	}
};
var $author$project$Update$DatasetManager$closeRenameModal = function (model) {
	return _Utils_update(
		model,
		{bm: $elm$core$Maybe$Nothing});
};
var $author$project$Update$DatasetManager$applyDatasetRename = F2(
	function (renameState, model) {
		var oldDataset = model.m;
		var updatedDataset = _Utils_update(
			oldDataset,
			{bd: renameState.bd});
		return _Utils_update(
			model,
			{m: updatedDataset});
	});
var $author$project$Update$DatasetManager$recordHistory = F2(
	function (snapshot, model) {
		return _Utils_update(
			model,
			{
				z: A2($author$project$History$push, snapshot, model.z)
			});
	});
var $author$project$Update$DatasetManager$applyRenameAndRecord = F2(
	function (model, renameState) {
		return $author$project$Update$DatasetManager$closeRenameModal(
			A2(
				$author$project$Update$DatasetManager$applyDatasetRename,
				renameState,
				A2($author$project$Update$DatasetManager$recordHistory, model, model)));
	});
var $author$project$Update$DatasetManager$confirmRenameDataset = function (model) {
	return A2(
		$elm$core$Maybe$withDefault,
		model,
		A2(
			$elm$core$Maybe$map,
			$author$project$Update$DatasetManager$applyRenameAndRecord(model),
			model.bm));
};
var $author$project$Update$DatasetManager$openRenameModal = function (model) {
	return _Utils_update(
		model,
		{
			bm: $elm$core$Maybe$Just(
				{aN: model.m.ai, bd: model.m.bd})
		});
};
var $author$project$Update$DatasetManager$updateRenameModalName = F2(
	function (name, model) {
		return _Utils_update(
			model,
			{
				bm: A2(
					$elm$core$Maybe$map,
					function (state) {
						return _Utils_update(
							state,
							{bd: name});
					},
					model.bm)
			});
	});
var $author$project$Update$updateDataset = F2(
	function (msg, model) {
		switch (msg.$) {
			case 0:
				return _Utils_Tuple2(
					$author$project$Update$DatasetManager$openRenameModal(model),
					$elm$core$Platform$Cmd$none);
			case 1:
				var name = msg.a;
				return _Utils_Tuple2(
					A2($author$project$Update$DatasetManager$updateRenameModalName, name, model),
					$elm$core$Platform$Cmd$none);
			case 2:
				return _Utils_Tuple2(
					$author$project$Update$DatasetManager$closeRenameModal(model),
					$elm$core$Platform$Cmd$none);
			default:
				return $author$project$Update$saveAfter(
					$author$project$Update$DatasetManager$confirmRenameDataset(model));
		}
	});
var $author$project$Types$EditingBoolean = function (a) {
	return {$: 2, a: a};
};
var $author$project$Types$EditingText = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $author$project$Types$NewFieldBoolean = 1;
var $author$project$Types$NewFieldString = 0;
var $author$project$Update$EditModalState$defaultNewFieldForm = {aJ: false, aY: 0, bd: '', bu: ''};
var $author$project$Update$EditModalState$addNewFieldToState = function (state) {
	var trimmedName = $elm$core$String$trim(state.be.bd);
	var alreadyExists = A2(
		$elm$core$List$any,
		function (f) {
			return _Utils_eq(f.ak, trimmedName);
		},
		state.af);
	if ($elm$core$String$isEmpty(trimmedName) || alreadyExists) {
		return state;
	} else {
		var isBool = state.be.aY === 1;
		var newEditingValue = isBool ? $author$project$Types$EditingBoolean(state.be.aJ) : A2(
			$author$project$Types$EditingText,
			state.be.bu,
			{a1: 50, bE: 536});
		var newField = {
			aO: 0,
			aX: isBool ? $elm$core$Maybe$Just('いいえ') : $elm$core$Maybe$Nothing,
			a0: false,
			a9: isBool,
			ba: false,
			ak: trimmedName,
			bb: trimmedName,
			bq: true,
			bB: isBool ? $elm$core$Maybe$Just('はい') : $elm$core$Maybe$Nothing
		};
		return _Utils_update(
			state,
			{
				aT: A3($elm$core$Dict$insert, trimmedName, newEditingValue, state.aT),
				af: _Utils_ap(
					state.af,
					_List_fromArray(
						[newField])),
				a8: false,
				be: $author$project$Update$EditModalState$defaultNewFieldForm
			});
	}
};
var $author$project$Update$EditModalManager$closeEditModal = function (model) {
	return _Utils_update(
		model,
		{aQ: $elm$core$Maybe$Nothing, aR: false});
};
var $author$project$Types$EditingTextList = function (a) {
	return {$: 1, a: a};
};
var $author$project$Update$EditModalState$parseCommaSeparatedText = function (rawInput) {
	return A2(
		$elm$core$List$map,
		function (val) {
			return {
				br: {a1: 0, bE: 0},
				M: val
			};
		},
		A2(
			$elm$core$List$filter,
			A2($elm$core$Basics$composeL, $elm$core$Basics$not, $elm$core$String$isEmpty),
			A2(
				$elm$core$List$map,
				$elm$core$String$trim,
				A2($elm$core$String$split, ',', rawInput))));
};
var $elm$core$Dict$getMin = function (dict) {
	getMin:
	while (true) {
		if ((dict.$ === -1) && (dict.d.$ === -1)) {
			var left = dict.d;
			var $temp$dict = left;
			dict = $temp$dict;
			continue getMin;
		} else {
			return dict;
		}
	}
};
var $elm$core$Dict$moveRedLeft = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.e.d.$ === -1) && (!dict.e.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var lLeft = _v1.d;
			var lRight = _v1.e;
			var _v2 = dict.e;
			var rClr = _v2.a;
			var rK = _v2.b;
			var rV = _v2.c;
			var rLeft = _v2.d;
			var _v3 = rLeft.a;
			var rlK = rLeft.b;
			var rlV = rLeft.c;
			var rlL = rLeft.d;
			var rlR = rLeft.e;
			var rRight = _v2.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				rlK,
				rlV,
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					rlL),
				A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rlR, rRight));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v4 = dict.d;
			var lClr = _v4.a;
			var lK = _v4.b;
			var lV = _v4.c;
			var lLeft = _v4.d;
			var lRight = _v4.e;
			var _v5 = dict.e;
			var rClr = _v5.a;
			var rK = _v5.b;
			var rV = _v5.c;
			var rLeft = _v5.d;
			var rRight = _v5.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$moveRedRight = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.d.d.$ === -1) && (!dict.d.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var _v2 = _v1.d;
			var _v3 = _v2.a;
			var llK = _v2.b;
			var llV = _v2.c;
			var llLeft = _v2.d;
			var llRight = _v2.e;
			var lRight = _v1.e;
			var _v4 = dict.e;
			var rClr = _v4.a;
			var rK = _v4.b;
			var rV = _v4.c;
			var rLeft = _v4.d;
			var rRight = _v4.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				lK,
				lV,
				A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					lRight,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight)));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v5 = dict.d;
			var lClr = _v5.a;
			var lK = _v5.b;
			var lV = _v5.c;
			var lLeft = _v5.d;
			var lRight = _v5.e;
			var _v6 = dict.e;
			var rClr = _v6.a;
			var rK = _v6.b;
			var rV = _v6.c;
			var rLeft = _v6.d;
			var rRight = _v6.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$removeHelpPrepEQGT = F7(
	function (targetKey, dict, color, key, value, left, right) {
		if ((left.$ === -1) && (!left.a)) {
			var _v1 = left.a;
			var lK = left.b;
			var lV = left.c;
			var lLeft = left.d;
			var lRight = left.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				lK,
				lV,
				lLeft,
				A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, lRight, right));
		} else {
			_v2$2:
			while (true) {
				if ((right.$ === -1) && (right.a === 1)) {
					if (right.d.$ === -1) {
						if (right.d.a === 1) {
							var _v3 = right.a;
							var _v4 = right.d;
							var _v5 = _v4.a;
							return $elm$core$Dict$moveRedRight(dict);
						} else {
							break _v2$2;
						}
					} else {
						var _v6 = right.a;
						var _v7 = right.d;
						return $elm$core$Dict$moveRedRight(dict);
					}
				} else {
					break _v2$2;
				}
			}
			return dict;
		}
	});
var $elm$core$Dict$removeMin = function (dict) {
	if ((dict.$ === -1) && (dict.d.$ === -1)) {
		var color = dict.a;
		var key = dict.b;
		var value = dict.c;
		var left = dict.d;
		var lColor = left.a;
		var lLeft = left.d;
		var right = dict.e;
		if (lColor === 1) {
			if ((lLeft.$ === -1) && (!lLeft.a)) {
				var _v3 = lLeft.a;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					key,
					value,
					$elm$core$Dict$removeMin(left),
					right);
			} else {
				var _v4 = $elm$core$Dict$moveRedLeft(dict);
				if (_v4.$ === -1) {
					var nColor = _v4.a;
					var nKey = _v4.b;
					var nValue = _v4.c;
					var nLeft = _v4.d;
					var nRight = _v4.e;
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						$elm$core$Dict$removeMin(nLeft),
						nRight);
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			}
		} else {
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				key,
				value,
				$elm$core$Dict$removeMin(left),
				right);
		}
	} else {
		return $elm$core$Dict$RBEmpty_elm_builtin;
	}
};
var $elm$core$Dict$removeHelp = F2(
	function (targetKey, dict) {
		if (dict.$ === -2) {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_cmp(targetKey, key) < 0) {
				if ((left.$ === -1) && (left.a === 1)) {
					var _v4 = left.a;
					var lLeft = left.d;
					if ((lLeft.$ === -1) && (!lLeft.a)) {
						var _v6 = lLeft.a;
						return A5(
							$elm$core$Dict$RBNode_elm_builtin,
							color,
							key,
							value,
							A2($elm$core$Dict$removeHelp, targetKey, left),
							right);
					} else {
						var _v7 = $elm$core$Dict$moveRedLeft(dict);
						if (_v7.$ === -1) {
							var nColor = _v7.a;
							var nKey = _v7.b;
							var nValue = _v7.c;
							var nLeft = _v7.d;
							var nRight = _v7.e;
							return A5(
								$elm$core$Dict$balance,
								nColor,
								nKey,
								nValue,
								A2($elm$core$Dict$removeHelp, targetKey, nLeft),
								nRight);
						} else {
							return $elm$core$Dict$RBEmpty_elm_builtin;
						}
					}
				} else {
					return A5(
						$elm$core$Dict$RBNode_elm_builtin,
						color,
						key,
						value,
						A2($elm$core$Dict$removeHelp, targetKey, left),
						right);
				}
			} else {
				return A2(
					$elm$core$Dict$removeHelpEQGT,
					targetKey,
					A7($elm$core$Dict$removeHelpPrepEQGT, targetKey, dict, color, key, value, left, right));
			}
		}
	});
var $elm$core$Dict$removeHelpEQGT = F2(
	function (targetKey, dict) {
		if (dict.$ === -1) {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_eq(targetKey, key)) {
				var _v1 = $elm$core$Dict$getMin(right);
				if (_v1.$ === -1) {
					var minKey = _v1.b;
					var minValue = _v1.c;
					return A5(
						$elm$core$Dict$balance,
						color,
						minKey,
						minValue,
						left,
						$elm$core$Dict$removeMin(right));
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			} else {
				return A5(
					$elm$core$Dict$balance,
					color,
					key,
					value,
					left,
					A2($elm$core$Dict$removeHelp, targetKey, right));
			}
		} else {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		}
	});
var $elm$core$Dict$remove = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$removeHelp, key, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$update = F3(
	function (targetKey, alter, dictionary) {
		var _v0 = alter(
			A2($elm$core$Dict$get, targetKey, dictionary));
		if (!_v0.$) {
			var value = _v0.a;
			return A3($elm$core$Dict$insert, targetKey, value, dictionary);
		} else {
			return A2($elm$core$Dict$remove, targetKey, dictionary);
		}
	});
var $author$project$Update$EditModalState$updateField = F4(
	function (fieldKey, defaultValue, transform, editState) {
		var updater = function (maybeValue) {
			if (!maybeValue.$) {
				var value = maybeValue.a;
				return $elm$core$Maybe$Just(
					transform(value));
			} else {
				return $elm$core$Maybe$Just(
					transform(defaultValue));
			}
		};
		return _Utils_update(
			editState,
			{
				aT: A3($elm$core$Dict$update, fieldKey, updater, editState.aT)
			});
	});
var $author$project$Update$EditModalState$confirmTextListField = function (fieldKey) {
	return A3(
		$author$project$Update$EditModalState$updateField,
		fieldKey,
		$author$project$Types$EditingTextList(
			{aj: _List_Nil, bk: ''}),
		function (fieldValue) {
			if (fieldValue.$ === 1) {
				var state = fieldValue.a;
				return $author$project$Types$EditingTextList(
					_Utils_update(
						state,
						{
							aj: $author$project$Update$EditModalState$parseCommaSeparatedText(state.bk)
						}));
			} else {
				var other = fieldValue;
				return other;
			}
		});
};
var $author$project$Update$confirmAllTextLists = function (editState) {
	var keys = $elm$core$Dict$keys(editState.aT);
	return A3($elm$core$List$foldl, $author$project$Update$EditModalState$confirmTextListField, editState, keys);
};
var $author$project$Update$DatasetEdit$applyDatasetChange = F2(
	function (model, updatedDataset) {
		return _Utils_update(
			model,
			{
				m: updatedDataset,
				z: A2($author$project$History$push, model, model.z)
			});
	});
var $author$project$Update$DatasetEdit$getEditingContext = function (model) {
	return A2(
		$elm$core$Maybe$map,
		function (editState) {
			return _Utils_Tuple2(editState, model.m);
		},
		model.aQ);
};
var $elm$core$Dict$map = F2(
	function (func, dict) {
		if (dict.$ === -2) {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				key,
				A2(func, key, value),
				A2($elm$core$Dict$map, func, left),
				A2($elm$core$Dict$map, func, right));
		}
	});
var $author$project$Update$DatasetEdit$parseCommaSeparatedText = function (rawInput) {
	return A2(
		$elm$core$List$filter,
		A2($elm$core$Basics$composeL, $elm$core$Basics$not, $elm$core$String$isEmpty),
		A2(
			$elm$core$List$map,
			$elm$core$String$trim,
			A2($elm$core$String$split, ',', rawInput)));
};
var $author$project$Update$DatasetEdit$applyEditingValuesToItem = function (editState) {
	var fieldConfigMap = $elm$core$Dict$fromList(
		A2(
			$elm$core$List$map,
			function (f) {
				return _Utils_Tuple2(f.ak, f);
			},
			editState.af));
	var newValues = A2(
		$elm$core$Dict$map,
		F2(
			function (fieldKey, editingValue) {
				var isTextListField = A2(
					$elm$core$Maybe$withDefault,
					false,
					A2(
						$elm$core$Maybe$map,
						function ($) {
							return $.ba;
						},
						A2($elm$core$Dict$get, fieldKey, fieldConfigMap)));
				switch (editingValue.$) {
					case 0:
						var text = editingValue.a;
						return isTextListField ? $author$project$Types$TextList(
							$author$project$Update$DatasetEdit$parseCommaSeparatedText(text)) : $author$project$Types$Text(text);
					case 1:
						var state = editingValue.a;
						return $author$project$Types$TextList(
							A2(
								$elm$core$List$map,
								function ($) {
									return $.M;
								},
								state.aj));
					default:
						var bool = editingValue.a;
						return $author$project$Types$Boolean(bool);
				}
			}),
		editState.aT);
	return A2($author$project$Types$Item, editState.aS, newValues);
};
var $author$project$Update$DatasetEdit$fillItemBools = F2(
	function (boolKeys, item) {
		var filledValues = A3(
			$elm$core$List$foldl,
			F2(
				function (key, acc) {
					return A2($elm$core$Dict$member, key, acc) ? acc : A3(
						$elm$core$Dict$insert,
						key,
						$author$project$Types$Boolean(false),
						acc);
				}),
			item.aA,
			boolKeys);
		return _Utils_update(
			item,
			{aA: filledValues});
	});
var $author$project$Update$DatasetEdit$fillMissingBools = F2(
	function (fields, items) {
		var boolKeys = A2(
			$elm$core$List$map,
			function ($) {
				return $.ak;
			},
			A2(
				$elm$core$List$filter,
				function ($) {
					return $.a9;
				},
				fields));
		return $elm$core$List$isEmpty(boolKeys) ? items : A2(
			$elm$core$List$map,
			$author$project$Update$DatasetEdit$fillItemBools(boolKeys),
			items);
	});
var $author$project$Update$DatasetEdit$updateItemIfMatch = F3(
	function (targetId, newItem, currentItem) {
		return _Utils_eq(currentItem.ai, targetId) ? newItem : currentItem;
	});
var $author$project$Update$DatasetEdit$saveItemToDataset = F2(
	function (editState, dataset) {
		var updatedItem = $author$project$Update$DatasetEdit$applyEditingValuesToItem(editState);
		var isNewItem = !A2(
			$elm$core$List$any,
			function (item) {
				return _Utils_eq(item.ai, editState.aS);
			},
			dataset.aj);
		var updatedItems = isNewItem ? _Utils_ap(
			dataset.aj,
			_List_fromArray(
				[updatedItem])) : A2(
			$elm$core$List$map,
			A2($author$project$Update$DatasetEdit$updateItemIfMatch, editState.aS, updatedItem),
			dataset.aj);
		var existingKeys = A2(
			$elm$core$List$map,
			function ($) {
				return $.ak;
			},
			dataset.af);
		var newFields = A2(
			$elm$core$List$filter,
			function (f) {
				return !A2($elm$core$List$member, f.ak, existingKeys);
			},
			editState.af);
		var allFields = _Utils_ap(dataset.af, newFields);
		return _Utils_update(
			dataset,
			{
				af: allFields,
				aj: A2($author$project$Update$DatasetEdit$fillMissingBools, allFields, updatedItems)
			});
	});
var $author$project$Update$DatasetEdit$confirmEditItem = function (model) {
	var _v0 = $author$project$Update$DatasetEdit$getEditingContext(model);
	if (!_v0.$) {
		var _v1 = _v0.a;
		var editState = _v1.a;
		var dataset = _v1.b;
		var updatedDataset = A2($author$project$Update$DatasetEdit$saveItemToDataset, editState, dataset);
		return A2($author$project$Update$DatasetEdit$applyDatasetChange, model, updatedDataset);
	} else {
		return model;
	}
};
var $author$project$Update$DatasetEdit$removeItemFromDataset = F2(
	function (itemId, dataset) {
		return _Utils_update(
			dataset,
			{
				aj: A2(
					$elm$core$List$filter,
					function (item) {
						return !_Utils_eq(item.ai, itemId);
					},
					dataset.aj)
			});
	});
var $author$project$Update$DatasetEdit$deleteEditingItem = function (model) {
	var _v0 = $author$project$Update$DatasetEdit$getEditingContext(model);
	if (!_v0.$) {
		var _v1 = _v0.a;
		var editState = _v1.a;
		var dataset = _v1.b;
		var updatedDataset = A2($author$project$Update$DatasetEdit$removeItemFromDataset, editState.aS, dataset);
		return A2($author$project$Update$DatasetEdit$applyDatasetChange, model, updatedDataset);
	} else {
		return model;
	}
};
var $author$project$Ports$generateUuid = _Platform_outgoingPort(
	'generateUuid',
	function ($) {
		return $elm$json$Json$Encode$null;
	});
var $author$project$Update$EditModalManager$defaultValueForField = function (field) {
	return field.a9 ? $author$project$Types$Boolean(false) : (field.ba ? $author$project$Types$TextList(_List_Nil) : $author$project$Types$Text(''));
};
var $author$project$Update$EditModalManager$defaultTextSize = {a1: 50, bE: 536};
var $author$project$Update$EditModalManager$parseCommaSeparatedText = function (rawInput) {
	return A2(
		$elm$core$List$map,
		function (val) {
			return {br: $author$project$Update$EditModalManager$defaultTextSize, M: val};
		},
		A2(
			$elm$core$List$filter,
			A2($elm$core$Basics$composeL, $elm$core$Basics$not, $elm$core$String$isEmpty),
			A2(
				$elm$core$List$map,
				$elm$core$String$trim,
				A2($elm$core$String$split, ',', rawInput))));
};
var $author$project$Update$EditModalManager$textToEditingListItem = function (text) {
	return {br: $author$project$Update$EditModalManager$defaultTextSize, M: text};
};
var $author$project$Update$EditModalManager$valueToEditingFieldValue = F2(
	function (field, value) {
		switch (value.$) {
			case 0:
				var text = value.a;
				if (field.ba) {
					var items = $author$project$Update$EditModalManager$parseCommaSeparatedText(text);
					return $author$project$Types$EditingTextList(
						{aj: items, bk: text});
				} else {
					return A2($author$project$Types$EditingText, text, $author$project$Update$EditModalManager$defaultTextSize);
				}
			case 1:
				var list = value.a;
				var rawInput = A2($elm$core$String$join, ', ', list);
				var items = A2($elm$core$List$map, $author$project$Update$EditModalManager$textToEditingListItem, list);
				return $author$project$Types$EditingTextList(
					{aj: items, bk: rawInput});
			default:
				var bool = value.a;
				return $author$project$Types$EditingBoolean(bool);
		}
	});
var $author$project$Update$EditModalManager$buildEditingValues = F2(
	function (item, fields) {
		return $elm$core$Dict$fromList(
			A2(
				$elm$core$List$map,
				function (field) {
					var value = A2(
						$elm$core$Maybe$withDefault,
						$author$project$Update$EditModalManager$defaultValueForField(field),
						A2($elm$core$Dict$get, field.ak, item.aA));
					return _Utils_Tuple2(
						field.ak,
						A2($author$project$Update$EditModalManager$valueToEditingFieldValue, field, value));
				},
				fields));
	});
var $author$project$Update$EditModalManager$initializeEditModal = F3(
	function (itemId, item, dataset) {
		return {
			aS: itemId,
			aT: A2($author$project$Update$EditModalManager$buildEditingValues, item, dataset.af),
			af: dataset.af,
			a8: false,
			be: {aJ: false, aY: 0, bd: '', bu: ''}
		};
	});
var $author$project$Update$EditModalManager$activateEditModal = F4(
	function (itemId, item, dataset, model) {
		return _Utils_update(
			model,
			{
				aQ: $elm$core$Maybe$Just(
					A3($author$project$Update$EditModalManager$initializeEditModal, itemId, item, dataset)),
				aR: true
			});
	});
var $author$project$Update$EditModalManager$activateModalWithItem = F3(
	function (itemId, model, _v0) {
		var item = _v0.a;
		var dataset = _v0.b;
		return A4($author$project$Update$EditModalManager$activateEditModal, itemId, item, dataset, model);
	});
var $author$project$Update$EditModalManager$isMatchingId = F2(
	function (targetId, item) {
		return _Utils_eq(item.ai, targetId);
	});
var $author$project$Update$EditModalManager$findItemById = F2(
	function (itemId, items) {
		return $elm$core$List$head(
			A2(
				$elm$core$List$filter,
				$author$project$Update$EditModalManager$isMatchingId(itemId),
				items));
	});
var $author$project$Update$EditModalManager$pairWithDataset = F2(
	function (dataset, item) {
		return _Utils_Tuple2(item, dataset);
	});
var $author$project$Update$EditModalManager$findItemInDataset = F2(
	function (itemId, dataset) {
		return A2(
			$elm$core$Maybe$map,
			$author$project$Update$EditModalManager$pairWithDataset(dataset),
			A2($author$project$Update$EditModalManager$findItemById, itemId, dataset.aj));
	});
var $author$project$Update$EditModalManager$findItemWithDataset = F2(
	function (itemId, model) {
		return A2($author$project$Update$EditModalManager$findItemInDataset, itemId, model.m);
	});
var $author$project$Update$EditModalManager$openEditModal = F2(
	function (itemId, model) {
		return A2(
			$elm$core$Maybe$withDefault,
			model,
			A2(
				$elm$core$Maybe$map,
				A2($author$project$Update$EditModalManager$activateModalWithItem, itemId, model),
				A2($author$project$Update$EditModalManager$findItemWithDataset, itemId, model)));
	});
var $author$project$Update$EditModalState$setBooleanField = F2(
	function (fieldKey, newValue) {
		return A3(
			$author$project$Update$EditModalState$updateField,
			fieldKey,
			$author$project$Types$EditingBoolean(false),
			function (fieldValue) {
				if (fieldValue.$ === 2) {
					return $author$project$Types$EditingBoolean(newValue);
				} else {
					var other = fieldValue;
					return other;
				}
			});
	});
var $author$project$Update$EditModalState$setNewFieldBool = F2(
	function (val, state) {
		var form = state.be;
		return _Utils_update(
			state,
			{
				be: _Utils_update(
					form,
					{aJ: val})
			});
	});
var $author$project$Update$EditModalState$setNewFieldName = F2(
	function (name, state) {
		var form = state.be;
		return _Utils_update(
			state,
			{
				be: _Utils_update(
					form,
					{bd: name})
			});
	});
var $author$project$Update$EditModalState$setNewFieldType = F2(
	function (fieldType, state) {
		var form = state.be;
		return _Utils_update(
			state,
			{
				be: _Utils_update(
					form,
					{aY: fieldType})
			});
	});
var $author$project$Update$EditModalState$setNewFieldValue = F2(
	function (val, state) {
		var form = state.be;
		return _Utils_update(
			state,
			{
				be: _Utils_update(
					form,
					{bu: val})
			});
	});
var $author$project$Update$EditModalState$setTextField = F2(
	function (fieldKey, newValue) {
		return A3(
			$author$project$Update$EditModalState$updateField,
			fieldKey,
			A2(
				$author$project$Types$EditingText,
				'',
				{a1: 0, bE: 0}),
			function (fieldValue) {
				if (!fieldValue.$) {
					var size = fieldValue.b;
					return A2($author$project$Types$EditingText, newValue, size);
				} else {
					var other = fieldValue;
					return other;
				}
			});
	});
var $author$project$Update$EditModalState$setTextListField = F2(
	function (fieldKey, newValue) {
		return A3(
			$author$project$Update$EditModalState$updateField,
			fieldKey,
			$author$project$Types$EditingTextList(
				{aj: _List_Nil, bk: ''}),
			function (fieldValue) {
				if (fieldValue.$ === 1) {
					var state = fieldValue.a;
					return $author$project$Types$EditingTextList(
						_Utils_update(
							state,
							{bk: newValue}));
				} else {
					var other = fieldValue;
					return other;
				}
			});
	});
var $author$project$Update$EditModalState$setTextListItem = F3(
	function (fieldKey, index, newValue) {
		return A3(
			$author$project$Update$EditModalState$updateField,
			fieldKey,
			$author$project$Types$EditingTextList(
				{aj: _List_Nil, bk: ''}),
			function (fieldValue) {
				if (fieldValue.$ === 1) {
					var state = fieldValue.a;
					var updatedItems = A2(
						$elm$core$List$indexedMap,
						F2(
							function (i, item) {
								return _Utils_eq(i, index) ? _Utils_update(
									item,
									{M: newValue}) : item;
							}),
						state.aj);
					return $author$project$Types$EditingTextList(
						_Utils_update(
							state,
							{aj: updatedItems}));
				} else {
					var other = fieldValue;
					return other;
				}
			});
	});
var $author$project$Update$EditModalState$setTextListItemSize = F4(
	function (fieldKey, index, width, height) {
		return A3(
			$author$project$Update$EditModalState$updateField,
			fieldKey,
			$author$project$Types$EditingTextList(
				{aj: _List_Nil, bk: ''}),
			function (fieldValue) {
				if (fieldValue.$ === 1) {
					var state = fieldValue.a;
					var updatedItems = A2(
						$elm$core$List$indexedMap,
						F2(
							function (i, item) {
								return _Utils_eq(i, index) ? _Utils_update(
									item,
									{
										br: {a1: height, bE: width}
									}) : item;
							}),
						state.aj);
					return $author$project$Types$EditingTextList(
						_Utils_update(
							state,
							{aj: updatedItems}));
				} else {
					var other = fieldValue;
					return other;
				}
			});
	});
var $author$project$Update$EditModalState$setTextSize = F3(
	function (fieldKey, width, height) {
		return A3(
			$author$project$Update$EditModalState$updateField,
			fieldKey,
			A2(
				$author$project$Types$EditingText,
				'',
				{a1: height, bE: width}),
			function (fieldValue) {
				if (!fieldValue.$) {
					var content = fieldValue.a;
					return A2(
						$author$project$Types$EditingText,
						content,
						{a1: height, bE: width});
				} else {
					var other = fieldValue;
					return other;
				}
			});
	});
var $author$project$Update$EditModalState$toggleAddFieldForm = function (state) {
	return _Utils_update(
		state,
		{a8: !state.a8});
};
var $author$project$Update$updateEditModalState = F2(
	function (transform, model) {
		return _Utils_update(
			model,
			{
				aQ: A2($elm$core$Maybe$map, transform, model.aQ)
			});
	});
var $author$project$Update$updateEditModalMsg = F2(
	function (msg, model) {
		switch (msg.$) {
			case 0:
				var itemId = msg.a;
				return _Utils_Tuple2(
					A2($author$project$Update$EditModalManager$openEditModal, itemId, model),
					$elm$core$Platform$Cmd$none);
			case 1:
				var itemId = msg.a;
				return _Utils_Tuple2(
					A2($author$project$Update$EditModalManager$openEditModal, itemId, model),
					$elm$core$Platform$Cmd$none);
			case 2:
				return _Utils_Tuple2(
					$author$project$Update$EditModalManager$closeEditModal(model),
					$elm$core$Platform$Cmd$none);
			case 3:
				var fieldKey = msg.a;
				var newValue = msg.b;
				return _Utils_Tuple2(
					A2(
						$author$project$Update$updateEditModalState,
						A2($author$project$Update$EditModalState$setTextField, fieldKey, newValue),
						model),
					$elm$core$Platform$Cmd$none);
			case 4:
				var fieldKey = msg.a;
				var newValue = msg.b;
				return _Utils_Tuple2(
					A2(
						$author$project$Update$updateEditModalState,
						A2($author$project$Update$EditModalState$setTextListField, fieldKey, newValue),
						model),
					$elm$core$Platform$Cmd$none);
			case 5:
				var fieldKey = msg.a;
				var width = msg.b;
				var height = msg.c;
				return _Utils_Tuple2(
					A2(
						$author$project$Update$updateEditModalState,
						A3($author$project$Update$EditModalState$setTextSize, fieldKey, width, height),
						model),
					$elm$core$Platform$Cmd$none);
			case 6:
				var fieldKey = msg.a;
				var index = msg.b;
				var newValue = msg.c;
				return _Utils_Tuple2(
					A2(
						$author$project$Update$updateEditModalState,
						A3($author$project$Update$EditModalState$setTextListItem, fieldKey, index, newValue),
						model),
					$elm$core$Platform$Cmd$none);
			case 7:
				var fieldKey = msg.a;
				var index = msg.b;
				var width = msg.c;
				var height = msg.d;
				return _Utils_Tuple2(
					A2(
						$author$project$Update$updateEditModalState,
						A4($author$project$Update$EditModalState$setTextListItemSize, fieldKey, index, width, height),
						model),
					$elm$core$Platform$Cmd$none);
			case 8:
				var fieldKey = msg.a;
				var newValue = msg.b;
				return _Utils_Tuple2(
					A2(
						$author$project$Update$updateEditModalState,
						A2($author$project$Update$EditModalState$setBooleanField, fieldKey, newValue),
						model),
					$elm$core$Platform$Cmd$none);
			case 9:
				var modelWithParsedLists = A2($author$project$Update$updateEditModalState, $author$project$Update$confirmAllTextLists, model);
				return $author$project$Update$saveAfter(
					$author$project$Update$EditModalManager$closeEditModal(
						$author$project$Update$DatasetEdit$confirmEditItem(modelWithParsedLists)));
			case 10:
				return _Utils_Tuple2(
					$author$project$Update$EditModalManager$closeEditModal(model),
					$elm$core$Platform$Cmd$none);
			case 11:
				return $author$project$Update$saveAfter(
					$author$project$Update$EditModalManager$closeEditModal(
						$author$project$Update$DatasetEdit$deleteEditingItem(model)));
			case 12:
				return _Utils_Tuple2(
					model,
					$author$project$Ports$generateUuid(0));
			case 13:
				return _Utils_Tuple2(
					A2($author$project$Update$updateEditModalState, $author$project$Update$EditModalState$toggleAddFieldForm, model),
					$elm$core$Platform$Cmd$none);
			case 14:
				var name = msg.a;
				return _Utils_Tuple2(
					A2(
						$author$project$Update$updateEditModalState,
						$author$project$Update$EditModalState$setNewFieldName(name),
						model),
					$elm$core$Platform$Cmd$none);
			case 15:
				var fieldType = msg.a;
				return _Utils_Tuple2(
					A2(
						$author$project$Update$updateEditModalState,
						$author$project$Update$EditModalState$setNewFieldType(fieldType),
						model),
					$elm$core$Platform$Cmd$none);
			case 16:
				var val = msg.a;
				return _Utils_Tuple2(
					A2(
						$author$project$Update$updateEditModalState,
						$author$project$Update$EditModalState$setNewFieldValue(val),
						model),
					$elm$core$Platform$Cmd$none);
			case 17:
				var val = msg.a;
				return _Utils_Tuple2(
					A2(
						$author$project$Update$updateEditModalState,
						$author$project$Update$EditModalState$setNewFieldBool(val),
						model),
					$elm$core$Platform$Cmd$none);
			default:
				return _Utils_Tuple2(
					A2($author$project$Update$updateEditModalState, $author$project$Update$EditModalState$addNewFieldToState, model),
					$elm$core$Platform$Cmd$none);
		}
	});
var $elm$core$Basics$ge = _Utils_ge;
var $author$project$Settings$indexOfPred = F2(
	function (isTarget, list) {
		return A2(
			$elm$core$Maybe$map,
			$elm$core$Tuple$first,
			$elm$core$List$head(
				A2(
					$elm$core$List$filter,
					function (_v0) {
						var x = _v0.b;
						return isTarget(x);
					},
					A2($elm$core$List$indexedMap, $elm$core$Tuple$pair, list))));
	});
var $author$project$Settings$atIndex = F2(
	function (idx, list) {
		return $elm$core$List$head(
			A2($elm$core$List$drop, idx, list));
	});
var $author$project$Settings$swapAt = F6(
	function (i, j, a, b, idx, x) {
		return _Utils_eq(idx, i) ? b : (_Utils_eq(idx, j) ? a : x);
	});
var $author$project$Settings$swapIndices = F3(
	function (i, j, list) {
		var _v0 = _Utils_Tuple2(
			A2($author$project$Settings$atIndex, i, list),
			A2($author$project$Settings$atIndex, j, list));
		if ((!_v0.a.$) && (!_v0.b.$)) {
			var a = _v0.a.a;
			var b = _v0.b.a;
			return A2(
				$elm$core$List$indexedMap,
				A4($author$project$Settings$swapAt, i, j, a, b),
				list);
		} else {
			return list;
		}
	});
var $author$project$Settings$moveBy = F3(
	function (delta, isTarget, list) {
		var _v0 = A2($author$project$Settings$indexOfPred, isTarget, list);
		if (!_v0.$) {
			var i = _v0.a;
			var j = i + delta;
			return ((j >= 0) && (_Utils_cmp(
				j,
				$elm$core$List$length(list)) < 0)) ? A3($author$project$Settings$swapIndices, i, j, list) : list;
		} else {
			return list;
		}
	});
var $author$project$Settings$moveFieldDown = F2(
	function (key, dataset) {
		return _Utils_update(
			dataset,
			{
				af: A3(
					$author$project$Settings$moveBy,
					1,
					function (f) {
						return _Utils_eq(f.ak, key);
					},
					dataset.af)
			});
	});
var $author$project$Settings$moveFieldUp = F2(
	function (key, dataset) {
		return _Utils_update(
			dataset,
			{
				af: A3(
					$author$project$Settings$moveBy,
					-1,
					function (f) {
						return _Utils_eq(f.ak, key);
					},
					dataset.af)
			});
	});
var $author$project$Settings$mapIfMatching = F3(
	function (key, transform, field) {
		return _Utils_eq(field.ak, key) ? transform(field) : field;
	});
var $author$project$Settings$mapField = F3(
	function (key, transform, dataset) {
		return _Utils_update(
			dataset,
			{
				af: A2(
					$elm$core$List$map,
					A2($author$project$Settings$mapIfMatching, key, transform),
					dataset.af)
			});
	});
var $author$project$Settings$setDisplayRole = F3(
	function (key, role, dataset) {
		return A3(
			$author$project$Settings$mapField,
			key,
			function (f) {
				return _Utils_update(
					f,
					{aO: role});
			},
			dataset);
	});
var $author$project$Settings$setFalseLabel = F3(
	function (key, value, dataset) {
		return _Utils_update(
			dataset,
			{
				af: A2(
					$elm$core$List$map,
					function (field) {
						return _Utils_eq(field.ak, key) ? _Utils_update(
							field,
							{
								aX: $elm$core$Maybe$Just(value)
							}) : field;
					},
					dataset.af)
			});
	});
var $author$project$Settings$setFilterable = F3(
	function (key, value, dataset) {
		return A3(
			$author$project$Settings$mapField,
			key,
			function (f) {
				return _Utils_update(
					f,
					{a0: value});
			},
			dataset);
	});
var $author$project$Settings$setImageLinkField = F2(
	function (value, dataset) {
		return _Utils_update(
			dataset,
			{a4: value});
	});
var $author$project$Settings$setLabel = F3(
	function (key, newLabel, dataset) {
		return A3(
			$author$project$Settings$mapField,
			key,
			function (f) {
				return _Utils_update(
					f,
					{bb: newLabel});
			},
			dataset);
	});
var $author$project$Settings$setShowOnCard = F3(
	function (key, value, dataset) {
		return A3(
			$author$project$Settings$mapField,
			key,
			function (f) {
				return _Utils_update(
					f,
					{bq: value});
			},
			dataset);
	});
var $author$project$Settings$setTitleLinkField = F2(
	function (value, dataset) {
		return _Utils_update(
			dataset,
			{by: value});
	});
var $author$project$Settings$setTrueLabel = F3(
	function (key, value, dataset) {
		return _Utils_update(
			dataset,
			{
				af: A2(
					$elm$core$List$map,
					function (field) {
						return _Utils_eq(field.ak, key) ? _Utils_update(
							field,
							{
								bB: $elm$core$Maybe$Just(value)
							}) : field;
					},
					dataset.af)
			});
	});
var $author$project$Settings$setWrapTitleOnCard = F2(
	function (value, dataset) {
		return _Utils_update(
			dataset,
			{bG: value});
	});
var $author$project$Update$updateCurrentDataset = F2(
	function (transform, model) {
		return $author$project$Update$saveAfter(
			_Utils_update(
				model,
				{
					m: transform(model.m)
				}));
	});
var $author$project$Update$updateFieldSettings = F2(
	function (msg, model) {
		switch (msg.$) {
			case 0:
				var key = msg.a;
				var newLabel = msg.b;
				return A2(
					$author$project$Update$updateCurrentDataset,
					A2($author$project$Settings$setLabel, key, newLabel),
					model);
			case 1:
				var key = msg.a;
				var role = msg.b;
				return A2(
					$author$project$Update$updateCurrentDataset,
					A2($author$project$Settings$setDisplayRole, key, role),
					model);
			case 2:
				var key = msg.a;
				var value = msg.b;
				return A2(
					$author$project$Update$updateCurrentDataset,
					A2($author$project$Settings$setShowOnCard, key, value),
					model);
			case 3:
				var key = msg.a;
				var value = msg.b;
				return A2(
					$author$project$Update$updateCurrentDataset,
					A2($author$project$Settings$setFilterable, key, value),
					model);
			case 4:
				var key = msg.a;
				var value = msg.b;
				return A2(
					$author$project$Update$updateCurrentDataset,
					A2($author$project$Settings$setTrueLabel, key, value),
					model);
			case 5:
				var key = msg.a;
				var value = msg.b;
				return A2(
					$author$project$Update$updateCurrentDataset,
					A2($author$project$Settings$setFalseLabel, key, value),
					model);
			case 6:
				var key = msg.a;
				return A2(
					$author$project$Update$updateCurrentDataset,
					$author$project$Settings$moveFieldUp(key),
					model);
			case 7:
				var key = msg.a;
				return A2(
					$author$project$Update$updateCurrentDataset,
					$author$project$Settings$moveFieldDown(key),
					model);
			case 8:
				var value = msg.a;
				return A2(
					$author$project$Update$updateCurrentDataset,
					$author$project$Settings$setImageLinkField(value),
					model);
			case 9:
				var value = msg.a;
				return A2(
					$author$project$Update$updateCurrentDataset,
					$author$project$Settings$setTitleLinkField(value),
					model);
			default:
				var value = msg.a;
				return A2(
					$author$project$Update$updateCurrentDataset,
					$author$project$Settings$setWrapTitleOnCard(value),
					model);
		}
	});
var $author$project$Types$AppendData = 1;
var $elm$json$Json$Encode$int = _Json_wrap;
var $author$project$Ports$generateUuids = _Platform_outgoingPort('generateUuids', $elm$json$Json$Encode$int);
var $author$project$FileFlow$confirmNewDataset = function (model) {
	var _v0 = model.f;
	if (!_v0.$) {
		var pending = _v0.a;
		return _Utils_Tuple2(
			model,
			$author$project$Ports$generateUuids(
				$elm$core$List$length(pending.G)));
	} else {
		return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
	}
};
var $elm$time$Time$Posix = $elm$core$Basics$identity;
var $elm$time$Time$millisToPosix = $elm$core$Basics$identity;
var $elm$file$File$Download$string = F3(
	function (name, mime, content) {
		return A2(
			$elm$core$Task$perform,
			$elm$core$Basics$never,
			A3(_File_download, name, mime, content));
	});
var $author$project$FileFlow$exportBackup = function (model) {
	var dataset = model.m;
	return A3(
		$elm$file$File$Download$string,
		'Mica-backup-' + (dataset.bd + '.json'),
		'application/json',
		A2(
			$elm$json$Json$Encode$encode,
			2,
			$author$project$DomainJson$encodeDataset(dataset)));
};
var $author$project$CsvCodec$valueToCell = function (value) {
	switch (value.$) {
		case 0:
			var s = value.a;
			return s;
		case 1:
			var xs = value.a;
			return A2($elm$core$String$join, ',', xs);
		default:
			var b = value.a;
			return b ? 'true' : 'false';
	}
};
var $author$project$CsvCodec$cellFor = F2(
	function (item, field) {
		return A2(
			$elm$core$Maybe$withDefault,
			'',
			A2(
				$elm$core$Maybe$map,
				$author$project$CsvCodec$valueToCell,
				A2($elm$core$Dict$get, field.ak, item.aA)));
	});
var $author$project$CsvCodec$itemToRow = F2(
	function (fields, item) {
		return A2(
			$elm$core$List$map,
			$author$project$CsvCodec$cellFor(item),
			fields);
	});
var $author$project$Csv$needsQuoting = function (cell) {
	return A2($elm$core$String$contains, ',', cell) || (A2($elm$core$String$contains, '\"', cell) || A2($elm$core$String$contains, '\n', cell));
};
var $elm$core$String$replace = F3(
	function (before, after, string) {
		return A2(
			$elm$core$String$join,
			after,
			A2($elm$core$String$split, before, string));
	});
var $author$project$Csv$escapeCell = function (cell) {
	return $author$project$Csv$needsQuoting(cell) ? ('\"' + (A3($elm$core$String$replace, '\"', '\"\"', cell) + '\"')) : cell;
};
var $author$project$Csv$rowToCsvLine = function (cells) {
	return A2(
		$elm$core$String$join,
		',',
		A2($elm$core$List$map, $author$project$Csv$escapeCell, cells));
};
var $author$project$Csv$toCsvText = function (rows) {
	return A2(
		$elm$core$String$join,
		'\n',
		A2($elm$core$List$map, $author$project$Csv$rowToCsvLine, rows));
};
var $author$project$CsvCodec$encodeDataset = function (dataset) {
	var rows = A2(
		$elm$core$List$map,
		$author$project$CsvCodec$itemToRow(dataset.af),
		dataset.aj);
	var header = A2(
		$elm$core$List$map,
		function ($) {
			return $.ak;
		},
		dataset.af);
	return $author$project$Csv$toCsvText(
		A2($elm$core$List$cons, header, rows));
};
var $author$project$FileFlow$exportField = F2(
	function (item, field) {
		return A2(
			$elm$core$Maybe$map,
			function (v) {
				return _Utils_Tuple2(
					field.ak,
					$author$project$DomainJson$encodeValue(v));
			},
			A2($elm$core$Dict$get, field.ak, item.aA));
	});
var $author$project$FileFlow$encodeExportItem = F2(
	function (fields, item) {
		return $elm$json$Json$Encode$object(
			A2(
				$elm$core$List$filterMap,
				$author$project$FileFlow$exportField(item),
				fields));
	});
var $author$project$FileFlow$exportJsonText = function (dataset) {
	return A2(
		$elm$json$Json$Encode$encode,
		2,
		A2(
			$elm$json$Json$Encode$list,
			$author$project$FileFlow$encodeExportItem(dataset.af),
			dataset.aj));
};
var $author$project$FileFlow$downloadDataset = F2(
	function (format, dataset) {
		if (!format) {
			return A3(
				$elm$file$File$Download$string,
				dataset.bd + '.json',
				'application/json',
				$author$project$FileFlow$exportJsonText(dataset));
		} else {
			return A3(
				$elm$file$File$Download$string,
				dataset.bd + '.csv',
				'text/csv',
				$author$project$CsvCodec$encodeDataset(dataset));
		}
	});
var $author$project$FileFlow$exportCurrentDataset = F2(
	function (format, model) {
		return A2($author$project$FileFlow$downloadDataset, format, model.m);
	});
var $elm$json$Json$Decode$decodeString = _Json_runOnString;
var $author$project$FileFlow$restoreDataset = F2(
	function (dataset, model) {
		var pushed = _Utils_update(
			model,
			{
				z: A2($author$project$History$push, model, model.z)
			});
		return $author$project$FileFlow$save(
			_Utils_update(
				pushed,
				{m: dataset, D: false}));
	});
var $author$project$FileFlow$handleBackupText = F2(
	function (text, model) {
		var _v0 = A2($elm$json$Json$Decode$decodeString, $author$project$DomainJson$decodeDataset, text);
		if (!_v0.$) {
			var dataset = _v0.a;
			return A2($author$project$FileFlow$restoreDataset, dataset, model);
		} else {
			return _Utils_Tuple2(
				_Utils_update(
					model,
					{
						E: $elm$core$Maybe$Just('バックアップの形式が正しくありません。')
					}),
				$elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Csv$emptyState = {r: '', s: _List_Nil, u: false, H: _List_Nil};
var $author$project$Csv$normalizeNewlines = function (text) {
	return A3(
		$elm$core$String$replace,
		'\u000D',
		'\n',
		A3($elm$core$String$replace, '\u000D\n', '\n', text));
};
var $elm$core$String$cons = _String_cons;
var $elm$core$String$fromChar = function (_char) {
	return A2($elm$core$String$cons, _char, '');
};
var $author$project$Csv$appendChar = F2(
	function (c, state) {
		return _Utils_update(
			state,
			{
				r: _Utils_ap(
					state.r,
					$elm$core$String$fromChar(c))
			});
	});
var $author$project$Csv$endCell = function (state) {
	return _Utils_update(
		state,
		{
			r: '',
			s: A2($elm$core$List$cons, state.r, state.s)
		});
};
var $author$project$Csv$endRow = function (state) {
	return _Utils_update(
		state,
		{
			s: _List_Nil,
			H: A2($elm$core$List$cons, state.s, state.H)
		});
};
var $author$project$Csv$finalizeState = function (state) {
	return ((state.r === '') && $elm$core$List$isEmpty(state.s)) ? state : $author$project$Csv$endRow(
		$author$project$Csv$endCell(state));
};
var $author$project$Csv$parseChars = F2(
	function (chars, state) {
		parseChars:
		while (true) {
			if (!chars.b) {
				return $author$project$Csv$finalizeState(state);
			} else {
				switch (chars.a) {
					case '\"':
						var rest = chars.b;
						if (state.u) {
							if (rest.b && ('\"' === rest.a)) {
								var rest2 = rest.b;
								var $temp$chars = rest2,
									$temp$state = A2($author$project$Csv$appendChar, '\"', state);
								chars = $temp$chars;
								state = $temp$state;
								continue parseChars;
							} else {
								var $temp$chars = rest,
									$temp$state = _Utils_update(
									state,
									{u: false});
								chars = $temp$chars;
								state = $temp$state;
								continue parseChars;
							}
						} else {
							var $temp$chars = rest,
								$temp$state = _Utils_update(
								state,
								{u: true});
							chars = $temp$chars;
							state = $temp$state;
							continue parseChars;
						}
					case ',':
						var rest = chars.b;
						if (state.u) {
							var $temp$chars = rest,
								$temp$state = A2($author$project$Csv$appendChar, ',', state);
							chars = $temp$chars;
							state = $temp$state;
							continue parseChars;
						} else {
							var $temp$chars = rest,
								$temp$state = $author$project$Csv$endCell(state);
							chars = $temp$chars;
							state = $temp$state;
							continue parseChars;
						}
					case '\n':
						var rest = chars.b;
						if (state.u) {
							var $temp$chars = rest,
								$temp$state = A2($author$project$Csv$appendChar, '\n', state);
							chars = $temp$chars;
							state = $temp$state;
							continue parseChars;
						} else {
							var $temp$chars = rest,
								$temp$state = $author$project$Csv$endRow(
								$author$project$Csv$endCell(state));
							chars = $temp$chars;
							state = $temp$state;
							continue parseChars;
						}
					default:
						var c = chars.a;
						var rest = chars.b;
						var $temp$chars = rest,
							$temp$state = A2($author$project$Csv$appendChar, c, state);
						chars = $temp$chars;
						state = $temp$state;
						continue parseChars;
				}
			}
		}
	});
var $elm$core$String$foldr = _String_foldr;
var $elm$core$String$toList = function (string) {
	return A3($elm$core$String$foldr, $elm$core$List$cons, _List_Nil, string);
};
var $author$project$Csv$parse = function (text) {
	return A2(
		$elm$core$List$map,
		$elm$core$List$reverse,
		$elm$core$List$reverse(
			A2(
				$author$project$Csv$parseChars,
				$elm$core$String$toList(
					$author$project$Csv$normalizeNewlines(text)),
				$author$project$Csv$emptyState).H));
};
var $elm$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		if (!maybeValue.$) {
			var value = maybeValue.a;
			return callback(value);
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $author$project$CsvCodec$atIndex = F2(
	function (idx, list) {
		return $elm$core$List$head(
			A2($elm$core$List$drop, idx, list));
	});
var $author$project$CsvCodec$indexOf = F2(
	function (key, list) {
		return A2(
			$elm$core$Maybe$map,
			$elm$core$Tuple$first,
			$elm$core$List$head(
				A2(
					$elm$core$List$filter,
					function (_v0) {
						var k = _v0.b;
						return _Utils_eq(k, key);
					},
					A2($elm$core$List$indexedMap, $elm$core$Tuple$pair, list))));
	});
var $author$project$CsvCodec$columnValues = F3(
	function (header, rows, key) {
		var _v0 = A2($author$project$CsvCodec$indexOf, key, header);
		if (!_v0.$) {
			var idx = _v0.a;
			return A2(
				$elm$core$List$filter,
				A2($elm$core$Basics$composeL, $elm$core$Basics$not, $elm$core$String$isEmpty),
				A2(
					$elm$core$List$filterMap,
					$author$project$CsvCodec$atIndex(idx),
					rows));
		} else {
			return _List_Nil;
		}
	});
var $author$project$CsvCodec$TypeBoolean = 2;
var $author$project$CsvCodec$TypeText = 0;
var $author$project$CsvCodec$TypeTextList = 1;
var $author$project$CsvCodec$valueToColumnType = function (value) {
	switch (value.$) {
		case 0:
			return 0;
		case 1:
			return 1;
		default:
			return 2;
	}
};
var $author$project$CsvCodec$existingTypeOf = F2(
	function (key, dataset) {
		return A2(
			$elm$core$Maybe$map,
			$author$project$CsvCodec$valueToColumnType,
			$elm$core$List$head(
				A2(
					$elm$core$List$filterMap,
					function (item) {
						return A2($elm$core$Dict$get, key, item.aA);
					},
					dataset.aj)));
	});
var $author$project$CsvCodec$isBooleanLiteral = function (value) {
	var lower = $elm$core$String$toLower(value);
	return (lower === 'true') || (lower === 'false');
};
var $author$project$CsvCodec$inferFromColumnValues = function (values) {
	return $elm$core$List$isEmpty(values) ? 0 : (A2($elm$core$List$all, $author$project$CsvCodec$isBooleanLiteral, values) ? 2 : (A2(
		$elm$core$List$any,
		$elm$core$String$contains(','),
		values) ? 1 : 0));
};
var $author$project$CsvCodec$columnTypeForKey = F4(
	function (maybeExisting, header, rows, key) {
		var _v0 = A2(
			$elm$core$Maybe$andThen,
			$author$project$CsvCodec$existingTypeOf(key),
			maybeExisting);
		if (!_v0.$) {
			var columnType = _v0.a;
			return columnType;
		} else {
			return $author$project$CsvCodec$inferFromColumnValues(
				A3($author$project$CsvCodec$columnValues, header, rows, key));
		}
	});
var $author$project$CsvCodec$inferColumnTypes = F3(
	function (maybeExisting, header, rows) {
		return $elm$core$Dict$fromList(
			A2(
				$elm$core$List$map,
				function (key) {
					return _Utils_Tuple2(
						key,
						A4($author$project$CsvCodec$columnTypeForKey, maybeExisting, header, rows, key));
				},
				header));
	});
var $author$project$CsvCodec$cellToValue = F2(
	function (columnType, raw) {
		switch (columnType) {
			case 0:
				return $author$project$Types$Text(raw);
			case 1:
				return $author$project$Types$TextList(
					A2(
						$elm$core$List$filter,
						A2($elm$core$Basics$composeL, $elm$core$Basics$not, $elm$core$String$isEmpty),
						A2(
							$elm$core$List$map,
							$elm$core$String$trim,
							A2($elm$core$String$split, ',', raw))));
			default:
				return $author$project$Types$Boolean(
					$elm$core$String$toLower(raw) === 'true');
		}
	});
var $author$project$CsvCodec$columnTypeFor = F2(
	function (columnTypes, key) {
		return A2(
			$elm$core$Maybe$withDefault,
			0,
			A2($elm$core$Dict$get, key, columnTypes));
	});
var $author$project$CsvCodec$cellPair = F2(
	function (columnTypes, _v0) {
		var key = _v0.a;
		var raw = _v0.b;
		return $elm$core$String$isEmpty(raw) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(
			_Utils_Tuple2(
				key,
				A2(
					$author$project$CsvCodec$cellToValue,
					A2($author$project$CsvCodec$columnTypeFor, columnTypes, key),
					raw)));
	});
var $author$project$CsvCodec$rowToPairs = F3(
	function (header, columnTypes, cells) {
		return A2(
			$elm$core$List$filterMap,
			$author$project$CsvCodec$cellPair(columnTypes),
			A3($elm$core$List$map2, $elm$core$Tuple$pair, header, cells));
	});
var $author$project$CsvCodec$rowsToItems = F3(
	function (maybeExisting, header, rows) {
		var columnTypes = A3($author$project$CsvCodec$inferColumnTypes, maybeExisting, header, rows);
		return A2(
			$elm$core$List$map,
			A2($author$project$CsvCodec$rowToPairs, header, columnTypes),
			rows);
	});
var $author$project$CsvCodec$decodeRawItems = F2(
	function (maybeExisting, text) {
		var _v0 = $author$project$Csv$parse(text);
		if (!_v0.b) {
			return $elm$core$Result$Ok(_List_Nil);
		} else {
			var header = _v0.a;
			var rows = _v0.b;
			return $elm$core$List$isEmpty(header) ? $elm$core$Result$Err('ヘッダー行がありません。') : $elm$core$Result$Ok(
				A3($author$project$CsvCodec$rowsToItems, maybeExisting, header, rows));
		}
	});
var $author$project$Import$dropNull = function (_v0) {
	var key = _v0.a;
	var maybeVal = _v0.b;
	if (!maybeVal.$) {
		var val = maybeVal.a;
		return $elm$core$Maybe$Just(
			_Utils_Tuple2(key, val));
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $author$project$Import$rawItemsDecoder = $elm$json$Json$Decode$list(
	A2(
		$elm$json$Json$Decode$map,
		$elm$core$List$filterMap($author$project$Import$dropNull),
		$elm$json$Json$Decode$keyValuePairs(
			$elm$json$Json$Decode$nullable($author$project$DomainJson$decodeValue))));
var $author$project$Import$decodeRawItems = function (text) {
	return A2($elm$json$Json$Decode$decodeString, $author$project$Import$rawItemsDecoder, text);
};
var $author$project$FileFlow$existingDatasetFor = function (model) {
	return (!model.Y) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(model.m);
};
var $elm$core$Result$mapError = F2(
	function (f, result) {
		if (!result.$) {
			var v = result.a;
			return $elm$core$Result$Ok(v);
		} else {
			var e = result.a;
			return $elm$core$Result$Err(
				f(e));
		}
	});
var $author$project$FileFlow$parseRawItems = F3(
	function (fileName, text, model) {
		var lowerName = $elm$core$String$toLower(fileName);
		if (A2($elm$core$String$endsWith, '.csv', lowerName)) {
			return A2(
				$author$project$CsvCodec$decodeRawItems,
				$author$project$FileFlow$existingDatasetFor(model),
				text);
		} else {
			if (A2($elm$core$String$endsWith, '.json', lowerName)) {
				return A2(
					$elm$core$Result$mapError,
					function (_v0) {
						return 'JSONの形式が正しくありません。';
					},
					$author$project$Import$decodeRawItems(text));
			} else {
				var _v1 = $author$project$Import$decodeRawItems(text);
				if (!_v1.$) {
					var items = _v1.a;
					return $elm$core$Result$Ok(items);
				} else {
					return A2(
						$author$project$CsvCodec$decodeRawItems,
						$author$project$FileFlow$existingDatasetFor(model),
						text);
				}
			}
		}
	});
var $author$project$Types$AddNewFields = 0;
var $author$project$FileFlow$newPendingImport = function (rawItems) {
	return {T: 0, al: 0, P: '', an: _List_Nil, G: rawItems};
};
var $author$project$Import$findNewKeys = F2(
	function (existingFields, rawItems) {
		return A2(
			$elm$core$List$filter,
			function (key) {
				return !A2(
					$elm$core$List$member,
					key,
					$author$project$Import$existingKeysOf(existingFields));
			},
			$author$project$Import$collectKeyOrder(rawItems));
	});
var $author$project$FileFlow$resolveOrPrompt = F3(
	function (rawItems, target, model) {
		var newKeys = A2($author$project$Import$findNewKeys, target.af, rawItems);
		var pending = {T: 0, al: model.Y, P: '', an: newKeys, G: rawItems};
		if ($elm$core$List$isEmpty(newKeys)) {
			var count = $elm$core$List$length(rawItems);
			return _Utils_Tuple2(
				_Utils_update(
					model,
					{
						E: $elm$core$Maybe$Nothing,
						f: $elm$core$Maybe$Just(pending)
					}),
				$author$project$Ports$generateUuids(count));
		} else {
			return _Utils_Tuple2(
				_Utils_update(
					model,
					{
						D: true,
						E: $elm$core$Maybe$Nothing,
						f: $elm$core$Maybe$Just(pending)
					}),
				$elm$core$Platform$Cmd$none);
		}
	});
var $author$project$FileFlow$startImport = F2(
	function (rawItems, model) {
		var _v0 = model.Y;
		if (!_v0) {
			return _Utils_Tuple2(
				_Utils_update(
					model,
					{
						E: $elm$core$Maybe$Nothing,
						f: $elm$core$Maybe$Just(
							$author$project$FileFlow$newPendingImport(rawItems))
					}),
				$elm$core$Platform$Cmd$none);
		} else {
			return A3($author$project$FileFlow$resolveOrPrompt, rawItems, model.m, model);
		}
	});
var $author$project$FileFlow$handleFileLoaded = F3(
	function (fileName, text, model) {
		var _v0 = A3($author$project$FileFlow$parseRawItems, fileName, text, model);
		if (!_v0.$) {
			var rawItems = _v0.a;
			return A2($author$project$FileFlow$startImport, rawItems, model);
		} else {
			var message = _v0.a;
			return _Utils_Tuple2(
				_Utils_update(
					model,
					{
						D: true,
						E: $elm$core$Maybe$Just(message),
						f: $elm$core$Maybe$Nothing
					}),
				$elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Types$BackupFileSelected = function (a) {
	return {$: 11, a: a};
};
var $elm$file$File$Select$file = F2(
	function (mimes, toMsg) {
		return A2(
			$elm$core$Task$perform,
			toMsg,
			_File_uploadOne(mimes));
	});
var $author$project$FileFlow$openBackupFile = A2(
	$elm$file$File$Select$file,
	_List_fromArray(
		['application/json', '.json']),
	A2($elm$core$Basics$composeR, $author$project$Types$BackupFileSelected, $author$project$Types$FileFlowMsg));
var $author$project$Types$FileSelected = function (a) {
	return {$: 3, a: a};
};
var $author$project$FileFlow$openFile = A2(
	$elm$file$File$Select$file,
	_List_fromArray(
		['application/json', 'text/csv', '.json', '.csv']),
	A2($elm$core$Basics$composeR, $author$project$Types$FileSelected, $author$project$Types$FileFlowMsg));
var $author$project$Update$openOrCloseFileModal = F2(
	function (open, model) {
		return _Utils_update(
			model,
			{D: open, E: $elm$core$Maybe$Nothing, f: $elm$core$Maybe$Nothing});
	});
var $author$project$Types$BackupTextLoaded = function (a) {
	return {$: 12, a: a};
};
var $elm$file$File$toString = _File_toString;
var $author$project$FileFlow$readBackupFile = function (file) {
	return A2(
		$elm$core$Task$perform,
		A2($elm$core$Basics$composeR, $author$project$Types$BackupTextLoaded, $author$project$Types$FileFlowMsg),
		$elm$file$File$toString(file));
};
var $author$project$Types$FileLoaded = F2(
	function (a, b) {
		return {$: 4, a: a, b: b};
	});
var $elm$file$File$name = _File_name;
var $author$project$FileFlow$readFile = function (file) {
	var fileName = $elm$file$File$name(file);
	return A2(
		$elm$core$Task$perform,
		function (content) {
			return $author$project$Types$FileFlowMsg(
				A2($author$project$Types$FileLoaded, fileName, content));
		},
		$elm$file$File$toString(file));
};
var $author$project$FileFlow$resolveChoice = F2(
	function (choice, model) {
		var _v0 = model.f;
		if (!_v0.$) {
			var pending = _v0.a;
			var updatedPending = _Utils_update(
				pending,
				{T: choice});
			var count = $elm$core$List$length(pending.G);
			return _Utils_Tuple2(
				_Utils_update(
					model,
					{
						f: $elm$core$Maybe$Just(updatedPending)
					}),
				$author$project$Ports$generateUuids(count));
		} else {
			return _Utils_Tuple2(
				_Utils_update(
					model,
					{f: $elm$core$Maybe$Nothing}),
				$elm$core$Platform$Cmd$none);
		}
	});
var $author$project$FileFlow$updatePendingName = F2(
	function (text, model) {
		return _Utils_update(
			model,
			{
				f: A2(
					$elm$core$Maybe$map,
					function (p) {
						return _Utils_update(
							p,
							{P: text});
					},
					model.f)
			});
	});
var $author$project$Update$updateFileFlow = F2(
	function (msg, model) {
		switch (msg.$) {
			case 0:
				var open = msg.a;
				return _Utils_Tuple2(
					A2($author$project$Update$openOrCloseFileModal, open, model),
					$elm$core$Platform$Cmd$none);
			case 1:
				var mode = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{Y: mode}),
					$elm$core$Platform$Cmd$none);
			case 2:
				return _Utils_Tuple2(model, $author$project$FileFlow$openFile);
			case 3:
				var file = msg.a;
				return _Utils_Tuple2(
					model,
					$author$project$FileFlow$readFile(file));
			case 4:
				var fileName = msg.a;
				var text = msg.b;
				return A3($author$project$FileFlow$handleFileLoaded, fileName, text, model);
			case 5:
				var text = msg.a;
				return _Utils_Tuple2(
					A2($author$project$FileFlow$updatePendingName, text, model),
					$elm$core$Platform$Cmd$none);
			case 6:
				return $author$project$FileFlow$confirmNewDataset(model);
			case 7:
				var choice = msg.a;
				return A2($author$project$FileFlow$resolveChoice, choice, model);
			case 8:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{f: $elm$core$Maybe$Nothing}),
					$elm$core$Platform$Cmd$none);
			case 9:
				var format = msg.a;
				return _Utils_Tuple2(
					model,
					A2($author$project$FileFlow$exportCurrentDataset, format, model));
			case 10:
				return _Utils_Tuple2(model, $author$project$FileFlow$openBackupFile);
			case 11:
				var file = msg.a;
				return _Utils_Tuple2(
					model,
					$author$project$FileFlow$readBackupFile(file));
			case 12:
				var text = msg.a;
				return A2($author$project$FileFlow$handleBackupText, text, model);
			case 13:
				return _Utils_Tuple2(
					model,
					$author$project$FileFlow$exportBackup(model));
			case 14:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{V: true}),
					$elm$core$Platform$Cmd$none);
			case 15:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{V: false}),
					$elm$core$Platform$Cmd$none);
			case 16:
				return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
			default:
				var file = msg.a;
				var newModel = _Utils_update(
					model,
					{V: false, Y: 1});
				return _Utils_Tuple2(
					newModel,
					$author$project$FileFlow$readFile(file));
		}
	});
var $author$project$Filter$clearAllFilters = function (filterUi) {
	return A2(
		$elm$core$Dict$map,
		F2(
			function (_v0, ui) {
				return _Utils_update(
					ui,
					{l: $elm$core$Set$empty});
			}),
		filterUi);
};
var $author$project$Filter$orderedFilterableFields = function (dataset) {
	var filterableFields = A2(
		$elm$core$List$filter,
		function ($) {
			return $.a0;
		},
		dataset.af);
	var byKey = function (key) {
		return $elm$core$List$head(
			A2(
				$elm$core$List$filter,
				function (f) {
					return _Utils_eq(f.ak, key);
				},
				filterableFields));
	};
	var ordered = A2($elm$core$List$filterMap, byKey, dataset.aZ);
	var orderedKeys = A2(
		$elm$core$List$map,
		function ($) {
			return $.ak;
		},
		ordered);
	var remaining = A2(
		$elm$core$List$filter,
		function (f) {
			return !A2($elm$core$List$member, f.ak, orderedKeys);
		},
		filterableFields);
	return _Utils_ap(ordered, remaining);
};
var $author$project$Settings$currentFilterOrder = function (dataset) {
	return A2(
		$elm$core$List$map,
		function ($) {
			return $.ak;
		},
		$author$project$Filter$orderedFilterableFields(dataset));
};
var $author$project$Settings$moveFilterDown = F2(
	function (key, dataset) {
		return _Utils_update(
			dataset,
			{
				aZ: A3(
					$author$project$Settings$moveBy,
					1,
					$elm$core$Basics$eq(key),
					$author$project$Settings$currentFilterOrder(dataset))
			});
	});
var $author$project$Settings$moveFilterUp = F2(
	function (key, dataset) {
		return _Utils_update(
			dataset,
			{
				aZ: A3(
					$author$project$Settings$moveBy,
					-1,
					$elm$core$Basics$eq(key),
					$author$project$Settings$currentFilterOrder(dataset))
			});
	});
var $elm$core$Set$member = F2(
	function (key, _v0) {
		var dict = _v0;
		return A2($elm$core$Dict$member, key, dict);
	});
var $elm$core$Set$remove = F2(
	function (key, _v0) {
		var dict = _v0;
		return A2($elm$core$Dict$remove, key, dict);
	});
var $author$project$Filter$toggleMember = F2(
	function (value, set) {
		return A2($elm$core$Set$member, value, set) ? A2($elm$core$Set$remove, value, set) : A2($elm$core$Set$insert, value, set);
	});
var $author$project$Filter$toggleOption = F2(
	function (optionValue, ui) {
		return _Utils_update(
			ui,
			{
				l: A2($author$project$Filter$toggleMember, optionValue, ui.l)
			});
	});
var $author$project$Update$updateFilterUi = F3(
	function (fieldKey, transform, model) {
		var current = A2($author$project$Filter$filterUiFor, fieldKey, model.a$);
		return _Utils_update(
			model,
			{
				a$: A3(
					$elm$core$Dict$insert,
					fieldKey,
					transform(current),
					model.a$)
			});
	});
var $author$project$Update$updateFilter = F2(
	function (msg, model) {
		switch (msg.$) {
			case 7:
				return $author$project$Update$saveAfter(
					_Utils_update(
						model,
						{
							a$: $author$project$Filter$clearAllFilters(model.a$)
						}));
			case 0:
				var fieldKey = msg.a;
				var optionValue = msg.b;
				return $author$project$Update$saveAfter(
					A3(
						$author$project$Update$updateFilterUi,
						fieldKey,
						$author$project$Filter$toggleOption(optionValue),
						model));
			case 1:
				var fieldKey = msg.a;
				var relation = msg.b;
				return $author$project$Update$saveAfter(
					A3(
						$author$project$Update$updateFilterUi,
						fieldKey,
						function (ui) {
							return _Utils_update(
								ui,
								{S: relation});
						},
						model));
			case 2:
				var fieldKey = msg.a;
				var relation = msg.b;
				return $author$project$Update$saveAfter(
					A3(
						$author$project$Update$updateFilterUi,
						fieldKey,
						function (ui) {
							return _Utils_update(
								ui,
								{aC: relation});
						},
						model));
			case 3:
				var fieldKey = msg.a;
				return $author$project$Update$saveAfter(
					A3(
						$author$project$Update$updateFilterUi,
						fieldKey,
						function (ui) {
							return _Utils_update(
								ui,
								{aM: !ui.aM});
						},
						model));
			case 4:
				var fieldKey = msg.a;
				return _Utils_Tuple2(
					A3(
						$author$project$Update$updateFilterUi,
						fieldKey,
						function (ui) {
							return _Utils_update(
								ui,
								{bl: !ui.bl});
						},
						model),
					$elm$core$Platform$Cmd$none);
			case 5:
				var key = msg.a;
				return A2(
					$author$project$Update$updateCurrentDataset,
					$author$project$Settings$moveFilterUp(key),
					model);
			default:
				var key = msg.a;
				return A2(
					$author$project$Update$updateCurrentDataset,
					$author$project$Settings$moveFilterDown(key),
					model);
		}
	});
var $author$project$Types$SearchFields = function (a) {
	return {$: 1, a: a};
};
var $author$project$Update$toggleSearchField = F2(
	function (fieldKey, state) {
		var _v0 = state.al;
		if (!_v0.$) {
			return state;
		} else {
			var fields = _v0.a;
			return _Utils_update(
				state,
				{
					al: $author$project$Types$SearchFields(
						A2($author$project$Filter$toggleMember, fieldKey, fields))
				});
		}
	});
var $author$project$Update$toggleSearchMode = function (state) {
	var _v0 = state.al;
	if (!_v0.$) {
		return _Utils_update(
			state,
			{
				al: $author$project$Types$SearchFields($elm$core$Set$empty)
			});
	} else {
		return _Utils_update(
			state,
			{al: $author$project$Types$SearchAll});
	}
};
var $author$project$Update$updateSearchQuery = F2(
	function (newQuery, state) {
		return _Utils_update(
			state,
			{bj: newQuery});
	});
var $author$project$Update$updateSearch = F2(
	function (msg, model) {
		switch (msg.$) {
			case 0:
				var newQuery = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							bo: A2($author$project$Update$updateSearchQuery, newQuery, model.bo)
						}),
					$elm$core$Platform$Cmd$none);
			case 1:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							bo: $author$project$Update$toggleSearchMode(model.bo)
						}),
					$elm$core$Platform$Cmd$none);
			default:
				var fieldKey = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							bo: A2($author$project$Update$toggleSearchField, fieldKey, model.bo)
						}),
					$elm$core$Platform$Cmd$none);
		}
	});
var $elm$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			if (dict.$ === -2) {
				return n;
			} else {
				var left = dict.d;
				var right = dict.e;
				var $temp$n = A2($elm$core$Dict$sizeHelp, n + 1, right),
					$temp$dict = left;
				n = $temp$n;
				dict = $temp$dict;
				continue sizeHelp;
			}
		}
	});
var $elm$core$Dict$size = function (dict) {
	return A2($elm$core$Dict$sizeHelp, 0, dict);
};
var $elm$core$Set$size = function (_v0) {
	var dict = _v0;
	return $elm$core$Dict$size(dict);
};
var $author$project$Update$SortModalManager$reorderItems = F2(
	function (orderedIds, dataset) {
		var originalIds = A2(
			$elm$core$List$map,
			function ($) {
				return $.ai;
			},
			dataset.aj);
		var validLength = _Utils_eq(
			$elm$core$List$length(orderedIds),
			$elm$core$List$length(originalIds));
		var originalIdSet = $elm$core$Set$fromList(originalIds);
		var orderedIdSet = $elm$core$Set$fromList(orderedIds);
		var validIds = _Utils_eq(orderedIdSet, originalIdSet);
		var noDuplicateIds = _Utils_eq(
			$elm$core$Set$size(orderedIdSet),
			$elm$core$List$length(orderedIds));
		if (validLength && (validIds && noDuplicateIds)) {
			var byId = function (id) {
				return $elm$core$List$head(
					A2(
						$elm$core$List$filter,
						function (item) {
							return _Utils_eq(item.ai, id);
						},
						dataset.aj));
			};
			var ordered = A2($elm$core$List$filterMap, byId, orderedIds);
			return _Utils_update(
				dataset,
				{aj: ordered});
		} else {
			return dataset;
		}
	});
var $author$project$Update$SortModalManager$updateModelDataset = F2(
	function (transform, model) {
		return _Utils_update(
			model,
			{
				m: transform(model.m)
			});
	});
var $author$project$Update$SortModalManager$applyDatasetReorder = F2(
	function (newOrder, model) {
		return A2(
			$author$project$Update$SortModalManager$updateModelDataset,
			$author$project$Update$SortModalManager$reorderItems(newOrder),
			model);
	});
var $author$project$Update$SortModalManager$closeSortModal = F2(
	function (topCardId, model) {
		return _Utils_update(
			model,
			{bt: false, bw: topCardId});
	});
var $author$project$Update$SortModalManager$recordHistory = F2(
	function (snapshot, model) {
		return _Utils_update(
			model,
			{
				z: A2($author$project$History$push, snapshot, model.z)
			});
	});
var $author$project$Ports$scrollToCard = _Platform_outgoingPort('scrollToCard', $elm$json$Json$Encode$string);
var $author$project$Update$SortModalManager$scrollCommand = function (maybeId) {
	if (!maybeId.$) {
		var id = maybeId.a;
		return $author$project$Ports$scrollToCard(id);
	} else {
		return $elm$core$Platform$Cmd$none;
	}
};
var $author$project$Update$SortModalManager$saveAndScroll = F2(
	function (topCardId, model) {
		return _Utils_Tuple2(
			model,
			$elm$core$Platform$Cmd$batch(
				_List_fromArray(
					[
						$author$project$Storage$save(model),
						$author$project$Update$SortModalManager$scrollCommand(topCardId)
					])));
	});
var $author$project$Update$SortModalManager$applySortAndClose = F3(
	function (newOrder, topCardId, model) {
		return A2(
			$author$project$Update$SortModalManager$saveAndScroll,
			topCardId,
			A2(
				$author$project$Update$SortModalManager$applyDatasetReorder,
				newOrder,
				A2(
					$author$project$Update$SortModalManager$recordHistory,
					model,
					A2($author$project$Update$SortModalManager$closeSortModal, topCardId, model))));
	});
var $author$project$Update$SortModalManager$topCardIdString = function (model) {
	return A2($elm$core$Maybe$withDefault, '', model.bA);
};
var $author$project$Update$SortModalManager$scrollToTopCard = function (model) {
	return $author$project$Ports$scrollToCard(
		$author$project$Update$SortModalManager$topCardIdString(model));
};
var $author$project$Update$SortModalManager$updateOpenSortModalState = function (model) {
	return _Utils_update(
		model,
		{
			bs: 1.0,
			bt: true,
			bw: $elm$core$Maybe$Just(
				$author$project$Update$SortModalManager$topCardIdString(model))
		});
};
var $author$project$Update$SortModalManager$openSortModal = function (model) {
	return _Utils_Tuple2(
		$author$project$Update$SortModalManager$updateOpenSortModalState(model),
		$author$project$Update$SortModalManager$scrollToTopCard(model));
};
var $author$project$Update$updateSortModal = F2(
	function (msg, model) {
		switch (msg.$) {
			case 0:
				return $author$project$Update$SortModalManager$openSortModal(model);
			case 1:
				var topCardId = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							bs: 1.0,
							bt: true,
							bw: $elm$core$Maybe$Just(topCardId)
						}),
					$author$project$Ports$scrollToCard(topCardId));
			case 2:
				var newOrder = msg.a;
				var topCardId = msg.b;
				return A3($author$project$Update$SortModalManager$applySortAndClose, newOrder, topCardId, model);
			default:
				var scale = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{bs: scale}),
					$elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Update$update = F2(
	function (msg, model) {
		switch (msg.$) {
			case 0:
				var size = msg.a;
				return $author$project$Update$saveAfter(
					A2($author$project$Update$setCardSize, size, model));
			case 1:
				var open = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{bp: open}),
					$elm$core$Platform$Cmd$none);
			case 2:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{aG: !model.aG}),
					$elm$core$Platform$Cmd$none);
			case 3:
				var open = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{a_: open}),
					$elm$core$Platform$Cmd$none);
			case 8:
				var sortMsg = msg.a;
				return A2($author$project$Update$updateSortModal, sortMsg, model);
			case 9:
				var datasetMsg = msg.a;
				return A2($author$project$Update$updateDataset, datasetMsg, model);
			case 4:
				return $author$project$Update$saveAfter(
					$author$project$Update$undo(model));
			case 10:
				var fileFlowMsg = msg.a;
				return A2($author$project$Update$updateFileFlow, fileFlowMsg, model);
			case 11:
				var filterMsg = msg.a;
				return A2($author$project$Update$updateFilter, filterMsg, model);
			case 12:
				var fieldSettingsMsg = msg.a;
				return A2($author$project$Update$updateFieldSettings, fieldSettingsMsg, model);
			case 13:
				var editModalMsg = msg.a;
				return A2($author$project$Update$updateEditModalMsg, editModalMsg, model);
			case 5:
				var itemId = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							a3: $elm$core$Maybe$Just(itemId)
						}),
					$elm$core$Platform$Cmd$none);
			case 6:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{a3: $elm$core$Maybe$Nothing}),
					$elm$core$Platform$Cmd$none);
			case 7:
				return _Utils_Tuple2(
					model,
					$author$project$Ports$scrollToTop(0));
			case 16:
				var maybeTopId = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{bA: maybeTopId}),
					$elm$core$Platform$Cmd$none);
			case 18:
				var uuids = msg.a;
				return A2($author$project$Update$fileImport, uuids, model);
			case 17:
				var uuid = msg.a;
				var _v1 = A3($author$project$Update$ItemManager$createNewItemWithUuid, uuid, model.bA, model);
				var newModel = _v1.a;
				var saveCmd = _v1.b;
				return _Utils_Tuple2(newModel, saveCmd);
			case 19:
				var scale = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{bc: scale}),
					$elm$core$Platform$Cmd$none);
			case 14:
				var searchMsg = msg.a;
				return A2($author$project$Update$updateSearch, searchMsg, model);
			default:
				var detailMsg = msg.a;
				return A2($author$project$Update$DetailModalManager$handleDetailModalMsg, detailMsg, model);
		}
	});
var $elm$json$Json$Decode$value = _Json_decodeValue;
var $author$project$Types$CreateNewItem = {$: 12};
var $author$project$Types$EditModalMsg = function (a) {
	return {$: 13, a: a};
};
var $author$project$Types$RequestOpen = {$: 0};
var $author$project$Types$ToggleActionMenu = {$: 2};
var $author$project$View$actionButtonClasses = 'w-full px-3 py-1.5 text-xs border border-neutral-100 rounded bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-center';
var $elm$html$Html$button = _VirtualDom_node('button');
var $elm$html$Html$Attributes$stringProperty = F2(
	function (key, string) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$string(string));
	});
var $elm$html$Html$Attributes$class = $elm$html$Html$Attributes$stringProperty('className');
var $elm$html$Html$Attributes$boolProperty = F2(
	function (key, bool) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$bool(bool));
	});
var $elm$html$Html$Attributes$disabled = $elm$html$Html$Attributes$boolProperty('disabled');
var $elm$html$Html$div = _VirtualDom_node('div');
var $author$project$Filter$isFilterActive = F2(
	function (filterUiDict, dataset) {
		return A2(
			$elm$core$List$any,
			function (field) {
				return !$elm$core$Set$isEmpty(
					A2($author$project$Filter$filterUiFor, field.ak, filterUiDict).l);
			},
			A2(
				$elm$core$List$filter,
				function ($) {
					return $.a0;
				},
				dataset.af));
	});
var $author$project$Types$SetMainCardScale = function (a) {
	return {$: 19, a: a};
};
var $elm$core$String$fromFloat = _String_fromNumber;
var $elm$html$Html$input = _VirtualDom_node('input');
var $elm$html$Html$Attributes$max = $elm$html$Html$Attributes$stringProperty('max');
var $elm$html$Html$Attributes$min = $elm$html$Html$Attributes$stringProperty('min');
var $elm$html$Html$Events$alwaysStop = function (x) {
	return _Utils_Tuple2(x, true);
};
var $elm$virtual_dom$VirtualDom$MayStopPropagation = function (a) {
	return {$: 1, a: a};
};
var $elm$virtual_dom$VirtualDom$on = _VirtualDom_on;
var $elm$html$Html$Events$stopPropagationOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayStopPropagation(decoder));
	});
var $elm$json$Json$Decode$at = F2(
	function (fields, decoder) {
		return A3($elm$core$List$foldr, $elm$json$Json$Decode$field, decoder, fields);
	});
var $elm$html$Html$Events$targetValue = A2(
	$elm$json$Json$Decode$at,
	_List_fromArray(
		['target', 'value']),
	$elm$json$Json$Decode$string);
var $elm$html$Html$Events$onInput = function (tagger) {
	return A2(
		$elm$html$Html$Events$stopPropagationOn,
		'input',
		A2(
			$elm$json$Json$Decode$map,
			$elm$html$Html$Events$alwaysStop,
			A2($elm$json$Json$Decode$map, tagger, $elm$html$Html$Events$targetValue)));
};
var $elm$html$Html$Attributes$step = function (n) {
	return A2($elm$html$Html$Attributes$stringProperty, 'step', n);
};
var $elm$virtual_dom$VirtualDom$text = _VirtualDom_text;
var $elm$html$Html$text = $elm$virtual_dom$VirtualDom$text;
var $elm$core$String$toFloat = _String_toFloat;
var $elm$html$Html$Attributes$type_ = $elm$html$Html$Attributes$stringProperty('type');
var $elm$html$Html$Attributes$value = $elm$html$Html$Attributes$stringProperty('value');
var $author$project$View$mainCardSizeSlider = function (currentScale) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex flex-col items-center gap-1 pt-2 border-t border-neutral-100')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('text-[10px] text-neutral-500 font-bold')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('サイズ')
					])),
				A2(
				$elm$html$Html$input,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$type_('range'),
						$elm$html$Html$Attributes$min('0.5'),
						$elm$html$Html$Attributes$max('2.0'),
						$elm$html$Html$Attributes$step('0.05'),
						$elm$html$Html$Attributes$value(
						$elm$core$String$fromFloat(currentScale)),
						$elm$html$Html$Events$onInput(
						function (val) {
							return $author$project$Types$SetMainCardScale(
								A2(
									$elm$core$Maybe$withDefault,
									1.0,
									$elm$core$String$toFloat(val)));
						}),
						$elm$html$Html$Attributes$class('h-32 [writing-mode:vertical-lr] [direction:rtl] cursor-pointer')
					]),
				_List_Nil)
			]));
};
var $elm$virtual_dom$VirtualDom$Normal = function (a) {
	return {$: 0, a: a};
};
var $elm$html$Html$Events$on = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$Normal(decoder));
	});
var $elm$html$Html$Events$onClick = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'click',
		$elm$json$Json$Decode$succeed(msg));
};
var $elm$html$Html$Attributes$title = $elm$html$Html$Attributes$stringProperty('title');
var $author$project$View$actionButtonGroup = function (model) {
	var isFiltered = A2($author$project$Filter$isFilterActive, model.a$, model.m);
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('fixed top-6 right-6 z-30 flex flex-col items-end gap-2')
			]),
		_List_fromArray(
			[
				model.aG ? A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('fixed inset-0 z-30'),
						$elm$html$Html$Events$onClick($author$project$Types$ToggleActionMenu)
					]),
				_List_Nil) : $elm$html$Html$text(''),
				A2(
				$elm$html$Html$button,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('z-40 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-neutral-200 shadow-md text-neutral-700 hover:bg-neutral-50 cursor-pointer flex items-center gap-1'),
						$elm$html$Html$Events$onClick($author$project$Types$ToggleActionMenu)
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(
						model.aG ? '✕ 閉じる' : '⚙ 操作')
					])),
				model.aG ? A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('z-40 flex flex-col gap-1.5 items-stretch bg-white border border-neutral-200 rounded-lg p-2 shadow-md min-w-[90px]')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class($author$project$View$actionButtonClasses),
								$elm$html$Html$Events$onClick(
								$author$project$Types$EditModalMsg($author$project$Types$CreateNewItem))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('＋ 追加')
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class($author$project$View$actionButtonClasses),
								$elm$html$Html$Events$onClick(
								$author$project$Types$SortModalMsg($author$project$Types$RequestOpen)),
								$elm$html$Html$Attributes$disabled(isFiltered),
								$elm$html$Html$Attributes$title('フィルター使用時は無効')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('入れ替え')
							])),
						$author$project$View$mainCardSizeSlider(model.bc)
					])) : $elm$html$Html$text('')
			]));
};
var $elm$virtual_dom$VirtualDom$Custom = function (a) {
	return {$: 3, a: a};
};
var $elm$html$Html$Events$custom = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$Custom(decoder));
	});
var $author$project$Types$DragEntered = {$: 14};
var $author$project$View$dragEnterDecoder = $elm$json$Json$Decode$succeed(
	{
		O: $author$project$Types$FileFlowMsg($author$project$Types$DragEntered),
		Q: true,
		R: true
	});
var $author$project$Types$DragOver = {$: 16};
var $author$project$View$dragOverDecoder = $elm$json$Json$Decode$succeed(
	{
		O: $author$project$Types$FileFlowMsg($author$project$Types$DragOver),
		Q: true,
		R: true
	});
var $author$project$View$dragLeaveDecoder = $elm$json$Json$Decode$succeed(
	{
		O: $author$project$Types$FileFlowMsg($author$project$Types$DragLeft),
		Q: true,
		R: true
	});
var $author$project$Types$FileDropped = function (a) {
	return {$: 17, a: a};
};
var $elm$file$File$decoder = _File_decoder;
var $author$project$View$dropDecoder = A2(
	$elm$json$Json$Decode$andThen,
	function (files) {
		if (files.b) {
			var file = files.a;
			return $elm$json$Json$Decode$succeed(
				{
					O: $author$project$Types$FileFlowMsg(
						$author$project$Types$FileDropped(file)),
					Q: true,
					R: true
				});
		} else {
			return $elm$json$Json$Decode$fail('No files');
		}
	},
	A2(
		$elm$json$Json$Decode$at,
		_List_fromArray(
			['dataTransfer', 'files']),
		$elm$json$Json$Decode$list($elm$file$File$decoder)));
var $elm$svg$Svg$Attributes$class = _VirtualDom_attribute('class');
var $elm$svg$Svg$Attributes$d = _VirtualDom_attribute('d');
var $elm$svg$Svg$Attributes$fill = _VirtualDom_attribute('fill');
var $elm$svg$Svg$trustedNode = _VirtualDom_nodeNS('http://www.w3.org/2000/svg');
var $elm$svg$Svg$path = $elm$svg$Svg$trustedNode('path');
var $elm$svg$Svg$Attributes$stroke = _VirtualDom_attribute('stroke');
var $elm$svg$Svg$Attributes$strokeLinecap = _VirtualDom_attribute('stroke-linecap');
var $elm$svg$Svg$Attributes$strokeLinejoin = _VirtualDom_attribute('stroke-linejoin');
var $elm$svg$Svg$Attributes$strokeWidth = _VirtualDom_attribute('stroke-width');
var $elm$svg$Svg$svg = $elm$svg$Svg$trustedNode('svg');
var $elm$svg$Svg$Attributes$viewBox = _VirtualDom_attribute('viewBox');
var $author$project$View$dropUploadIcon = A2(
	$elm$svg$Svg$svg,
	_List_fromArray(
		[
			$elm$svg$Svg$Attributes$viewBox('0 0 24 24'),
			$elm$svg$Svg$Attributes$fill('none'),
			$elm$svg$Svg$Attributes$stroke('currentColor'),
			$elm$svg$Svg$Attributes$strokeWidth('2'),
			$elm$svg$Svg$Attributes$strokeLinecap('round'),
			$elm$svg$Svg$Attributes$strokeLinejoin('round'),
			$elm$svg$Svg$Attributes$class('w-10 h-10 text-blue-500')
		]),
	_List_fromArray(
		[
			A2(
			$elm$svg$Svg$path,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$d('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4')
				]),
			_List_Nil),
			A2(
			$elm$svg$Svg$path,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$d('M7 10l5 5 5-5')
				]),
			_List_Nil),
			A2(
			$elm$svg$Svg$path,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$d('M12 15V3')
				]),
			_List_Nil)
		]));
var $author$project$View$dropOverlay = A2(
	$elm$html$Html$div,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$class('absolute inset-0 z-50 bg-blue-500/15 backdrop-blur-xs flex flex-col p-6 transition-all cursor-pointer'),
			A2($elm$html$Html$Events$custom, 'dragover', $author$project$View$dragOverDecoder),
			A2($elm$html$Html$Events$custom, 'dragleave', $author$project$View$dragLeaveDecoder),
			A2($elm$html$Html$Events$custom, 'drop', $author$project$View$dropDecoder),
			$elm$html$Html$Events$onClick(
			$author$project$Types$FileFlowMsg($author$project$Types$DragLeft))
		]),
	_List_fromArray(
		[
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('w-full h-full border-4 border-dashed border-blue-500 rounded-2xl flex flex-col items-center justify-center pointer-events-none select-none bg-blue-50/20')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('bg-white shadow-2xl rounded-2xl p-6 border border-blue-200 flex flex-col items-center gap-3 pointer-events-none select-none')
						]),
					_List_fromArray(
						[
							$author$project$View$dropUploadIcon,
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('text-base font-bold text-neutral-800')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('ファイルをドロップしてカードを追加')
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('text-xs text-neutral-500')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('JSON または CSV ファイルに対応（追加モード）')
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('text-[11px] text-neutral-400 mt-1')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('※ クリックまたは Esc キーでキャンセル')
								]))
						]))
				]))
		]));
var $elm$html$Html$Attributes$id = $elm$html$Html$Attributes$stringProperty('id');
var $author$project$View$mainAreaClasses = 'flex-1 h-full overflow-y-auto p-6 bg-white flex flex-col gap-3';
var $author$project$View$cardGridClasses = function (size) {
	switch (size) {
		case 0:
			return 'flex flex-wrap gap-4';
		case 1:
			return 'flex flex-wrap gap-4';
		default:
			return 'grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4';
	}
};
var $author$project$Types$CardMouseEntered = function (a) {
	return {$: 5, a: a};
};
var $author$project$Types$CardMouseLeft = {$: 6};
var $author$project$View$Card$appendSelectedClass = F2(
	function (isSelected, base) {
		return isSelected ? (base + ' ring-2 ring-neutral-900 ring-offset-2') : base;
	});
var $elm$virtual_dom$VirtualDom$attribute = F2(
	function (key, value) {
		return A2(
			_VirtualDom_attribute,
			_VirtualDom_noOnOrFormAction(key),
			_VirtualDom_noJavaScriptOrHtmlUri(value));
	});
var $elm$html$Html$Attributes$attribute = $elm$virtual_dom$VirtualDom$attribute;
var $elm$html$Html$Events$onMouseEnter = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'mouseenter',
		$elm$json$Json$Decode$succeed(msg));
};
var $elm$html$Html$Events$onMouseLeave = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'mouseleave',
		$elm$json$Json$Decode$succeed(msg));
};
var $author$project$View$Card$buildCardAttributes = F3(
	function (baseClasses, isSelected, itemId) {
		return _List_fromArray(
			[
				A2($elm$html$Html$Attributes$attribute, 'data-id', itemId),
				$elm$html$Html$Attributes$class(
				A2($author$project$View$Card$appendSelectedClass, isSelected, baseClasses)),
				$elm$html$Html$Events$onMouseEnter(
				$author$project$Types$CardMouseEntered(itemId)),
				$elm$html$Html$Events$onMouseLeave($author$project$Types$CardMouseLeft)
			]);
	});
var $author$project$View$Card$largeCardClasses = 'w-full max-w-3xl rounded-md border border-neutral-200 bg-white overflow-hidden flex group';
var $author$project$Types$EditButtonClicked = function (a) {
	return {$: 0, a: a};
};
var $author$project$View$Card$editButtonClasses = 'absolute top-2 right-2 z-10 w-8 h-6 rounded bg-neutral-700 hover:bg-neutral-800 text-white text-sm flex items-center justify-center shadow';
var $author$project$View$Card$editButton = function (itemId) {
	return A2(
		$elm$html$Html$button,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class($author$project$View$Card$editButtonClasses),
				$elm$html$Html$Events$onClick(
				$author$project$Types$EditModalMsg(
					$author$project$Types$EditButtonClicked(itemId))),
				$elm$html$Html$Attributes$title('編集')
			]),
		_List_fromArray(
			[
				$elm$html$Html$text('edit')
			]));
};
var $author$project$View$Card$appendEditButtonIf = F3(
	function (isHovered, itemId, elements) {
		return isHovered ? _Utils_ap(
			elements,
			_List_fromArray(
				[
					$author$project$View$Card$editButton(itemId)
				])) : elements;
	});
var $author$project$ItemAccess$isDetailField = function (field) {
	return field.bq && ((field.aO !== 1) && (field.aO !== 2));
};
var $author$project$ItemAccess$detailFields = function (fields) {
	return A2($elm$core$List$filter, $author$project$ItemAccess$isDetailField, fields);
};
var $author$project$View$Card$emptyDetailPlaceholder = A2(
	$elm$html$Html$div,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$class('text-neutral-800')
		]),
	_List_fromArray(
		[
			$elm$html$Html$text('—')
		]));
var $elm$html$Html$a = _VirtualDom_node('a');
var $elm$html$Html$Attributes$href = function (url) {
	return A2(
		$elm$html$Html$Attributes$stringProperty,
		'href',
		_VirtualDom_noJavaScriptUri(url));
};
var $elm$html$Html$Attributes$target = $elm$html$Html$Attributes$stringProperty('target');
var $author$project$View$Card$formatDetailValue = F2(
	function (role, textValue) {
		if (role === 3) {
			return A2(
				$elm$html$Html$a,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$href(textValue),
						$elm$html$Html$Attributes$target('_blank'),
						$elm$html$Html$Attributes$class('text-neutral-800 hover:underline')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(textValue)
					]));
		} else {
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('text-neutral-800')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(textValue)
					]));
		}
	});
var $author$project$ItemAccess$getValue = F2(
	function (key, item) {
		return A2($elm$core$Dict$get, key, item.aA);
	});
var $author$project$ItemAccess$valueToText = function (value) {
	switch (value.$) {
		case 0:
			var s = value.a;
			return s;
		case 1:
			var xs = value.a;
			return A2($elm$core$String$join, ', ', xs);
		default:
			var b = value.a;
			return b ? 'はい' : 'いいえ';
	}
};
var $author$project$View$Card$detailValueView = F2(
	function (item, field) {
		var _v0 = A2($author$project$ItemAccess$getValue, field.ak, item);
		if (!_v0.$) {
			var val = _v0.a;
			return A2(
				$author$project$View$Card$formatDetailValue,
				field.aO,
				$author$project$ItemAccess$valueToText(val));
		} else {
			return $author$project$View$Card$emptyDetailPlaceholder;
		}
	});
var $author$project$View$Card$wrapDetailRow = F2(
	function (labelText, valueNode) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('text-sm')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('text-neutral-400')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(labelText)
						])),
					valueNode
				]));
	});
var $author$project$View$Card$detailRow = F2(
	function (item, field) {
		return A2(
			$author$project$View$Card$wrapDetailRow,
			field.bb,
			A2($author$project$View$Card$detailValueView, item, field));
	});
var $author$project$View$Card$LinkDetail = {$: 0};
var $author$project$View$Card$LinkUrl = function (a) {
	return {$: 1, a: a};
};
var $author$project$View$Card$NoLink = {$: 2};
var $author$project$ItemAccess$getText = F2(
	function (key, item) {
		var _v0 = A2($author$project$ItemAccess$getValue, key, item);
		if ((!_v0.$) && (!_v0.a.$)) {
			var s = _v0.a.a;
			return $elm$core$Maybe$Just(s);
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $author$project$View$Card$linkUrl = F2(
	function (maybeFieldKey, item) {
		return A2(
			$elm$core$Maybe$andThen,
			function (key) {
				return A2($author$project$ItemAccess$getText, key, item);
			},
			maybeFieldKey);
	});
var $author$project$View$Card$resolveLinkTarget = F2(
	function (maybeFieldKey, item) {
		if (!maybeFieldKey.$) {
			if (maybeFieldKey.a === '__detail__') {
				return $author$project$View$Card$LinkDetail;
			} else {
				var fieldKey = maybeFieldKey.a;
				var _v1 = A2(
					$author$project$View$Card$linkUrl,
					$elm$core$Maybe$Just(fieldKey),
					item);
				if (!_v1.$) {
					var url = _v1.a;
					return $author$project$View$Card$LinkUrl(url);
				} else {
					return $author$project$View$Card$NoLink;
				}
			}
		} else {
			return $author$project$View$Card$NoLink;
		}
	});
var $author$project$View$Card$titleClasses = function (shouldWrap) {
	var overflowClass = shouldWrap ? 'break-words whitespace-normal leading-snug' : 'truncate block';
	return 'text-sm text-neutral-900 font-title font-semibold tracking-wide ' + overflowClass;
};
var $author$project$ItemAccess$findFieldByRole = F2(
	function (role, fields) {
		return $elm$core$List$head(
			A2(
				$elm$core$List$filter,
				function (field) {
					return _Utils_eq(field.aO, role);
				},
				fields));
	});
var $author$project$View$Card$titleText = F2(
	function (dataset, item) {
		return A2(
			$elm$core$Maybe$andThen,
			function (field) {
				return A2($author$project$ItemAccess$getText, field.ak, item);
			},
			A2($author$project$ItemAccess$findFieldByRole, 1, dataset.af));
	});
var $author$project$Types$OpenDetail = function (a) {
	return {$: 0, a: a};
};
var $elm$html$Html$h3 = _VirtualDom_node('h3');
var $author$project$View$Card$wrapTitleWithLink = F4(
	function (linktarget, baseClasses, itemId, content) {
		switch (linktarget.$) {
			case 0:
				return A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class(baseClasses + ' cursor-pointer hover:text-blue-600 hover:underline text-left w-full'),
							$elm$html$Html$Events$onClick(
							$author$project$Types$DetailModalMsg(
								$author$project$Types$OpenDetail(itemId)))
						]),
					_List_fromArray(
						[content]));
			case 1:
				var url = linktarget.a;
				return A2(
					$elm$html$Html$a,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class(baseClasses + ' hover:underline'),
							$elm$html$Html$Attributes$href(url),
							$elm$html$Html$Attributes$target('_blank')
						]),
					_List_fromArray(
						[content]));
			default:
				return A2(
					$elm$html$Html$h3,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class(baseClasses)
						]),
					_List_fromArray(
						[content]));
		}
	});
var $author$project$View$Card$renderTitle = F2(
	function (dataset, item) {
		var target = A2($author$project$View$Card$resolveLinkTarget, dataset.by, item);
		var classes = $author$project$View$Card$titleClasses(dataset.bG);
		return A4(
			$author$project$View$Card$wrapTitleWithLink,
			target,
			classes,
			item.ai,
			$elm$html$Html$text(
				A2(
					$elm$core$Maybe$withDefault,
					'(無題)',
					A2($author$project$View$Card$titleText, dataset, item))));
	});
var $author$project$View$Card$largeCardDetail = F3(
	function (dataset, item, isHovered) {
		var rows = A2(
			$elm$core$List$cons,
			A2($author$project$View$Card$renderTitle, dataset, item),
			A2(
				$elm$core$List$map,
				$author$project$View$Card$detailRow(item),
				$author$project$ItemAccess$detailFields(dataset.af)));
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('flex-1 px-4 py-3 flex flex-col gap-2 relative')
				]),
			A3($author$project$View$Card$appendEditButtonIf, isHovered, item.ai, rows));
	});
var $author$project$View$Card$imageUrl = F2(
	function (dataset, item) {
		return A2(
			$elm$core$Maybe$andThen,
			function (url) {
				return $elm$core$String$isEmpty(
					$elm$core$String$trim(url)) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(url);
			},
			A2(
				$elm$core$Maybe$andThen,
				function (field) {
					return A2($author$project$ItemAccess$getText, field.ak, item);
				},
				A2($author$project$ItemAccess$findFieldByRole, 2, dataset.af)));
	});
var $elm$html$Html$img = _VirtualDom_node('img');
var $elm$html$Html$Attributes$src = function (url) {
	return A2(
		$elm$html$Html$Attributes$stringProperty,
		'src',
		_VirtualDom_noJavaScriptOrHtmlUri(url));
};
var $author$project$View$Card$renderRawImage = F2(
	function (titleString, imgSrc) {
		return A2(
			$elm$html$Html$img,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$src(imgSrc),
					$elm$html$Html$Attributes$class('w-full h-full object-contain'),
					$elm$html$Html$Attributes$title(titleString)
				]),
			_List_Nil);
	});
var $author$project$View$Card$wrapImageWithLink = F4(
	function (linktarget, itemId, titleString, imageNode) {
		switch (linktarget.$) {
			case 0:
				return A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('block w-full h-full cursor-pointer hover:opacity-90 transition p-0 border-0 bg-transparent text-left'),
							$elm$html$Html$Events$onClick(
							$author$project$Types$DetailModalMsg(
								$author$project$Types$OpenDetail(itemId))),
							$elm$html$Html$Attributes$title(titleString)
						]),
					_List_fromArray(
						[imageNode]));
			case 1:
				var url = linktarget.a;
				return A2(
					$elm$html$Html$a,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('block w-full h-full cursor-pointer hover:opacity-90 transition'),
							$elm$html$Html$Attributes$href(url),
							$elm$html$Html$Attributes$target('_blank'),
							$elm$html$Html$Attributes$title(titleString)
						]),
					_List_fromArray(
						[imageNode]));
			default:
				return imageNode;
		}
	});
var $author$project$View$Card$renderLinkedImage = F3(
	function (dataset, item, url) {
		var titleString = A2(
			$elm$core$Maybe$withDefault,
			'',
			A2($author$project$View$Card$titleText, dataset, item));
		var target = A2($author$project$View$Card$resolveLinkTarget, dataset.a4, item);
		var imageNode = A2($author$project$View$Card$renderRawImage, titleString, url);
		return A4($author$project$View$Card$wrapImageWithLink, target, item.ai, titleString, imageNode);
	});
var $author$project$View$Card$largeCardImage = F2(
	function (dataset, item) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('w-48 shrink-0 flex items-center justify-center bg-neutral-50')
				]),
			_List_fromArray(
				[
					function () {
					var _v0 = A2($author$project$View$Card$imageUrl, dataset, item);
					if (!_v0.$) {
						var url = _v0.a;
						return A3($author$project$View$Card$renderLinkedImage, dataset, item, url);
					} else {
						return $elm$html$Html$text('');
					}
				}()
				]));
	});
var $author$project$View$Card$viewLarge = F4(
	function (dataset, isSelected, isHovered, item) {
		return A2(
			$elm$html$Html$div,
			A3($author$project$View$Card$buildCardAttributes, $author$project$View$Card$largeCardClasses, isSelected, item.ai),
			_List_fromArray(
				[
					A2($author$project$View$Card$largeCardImage, dataset, item),
					A3($author$project$View$Card$largeCardDetail, dataset, item, isHovered)
				]));
	});
var $author$project$View$Card$mediumCardClasses = 'w-40 rounded-md border border-neutral-200 bg-white flex flex-col group relative';
var $author$project$View$Card$mediumCardFooter = F3(
	function (dataset, item, isHovered) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('px-2 py-2 flex-1 flex flex-col justify-between')
				]),
			A3(
				$author$project$View$Card$appendEditButtonIf,
				isHovered,
				item.ai,
				_List_fromArray(
					[
						A2($author$project$View$Card$renderTitle, dataset, item)
					])));
	});
var $author$project$View$Card$mediumCardImage = F2(
	function (dataset, item) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('h-56 flex items-center justify-center bg-neutral-50 overflow-hidden')
				]),
			_List_fromArray(
				[
					function () {
					var _v0 = A2($author$project$View$Card$imageUrl, dataset, item);
					if (!_v0.$) {
						var url = _v0.a;
						return A3($author$project$View$Card$renderLinkedImage, dataset, item, url);
					} else {
						return $elm$html$Html$text('');
					}
				}()
				]));
	});
var $author$project$View$Card$viewMedium = F4(
	function (dataset, isSelected, isHovered, item) {
		return A2(
			$elm$html$Html$div,
			A3($author$project$View$Card$buildCardAttributes, $author$project$View$Card$mediumCardClasses, isSelected, item.ai),
			_List_fromArray(
				[
					A2($author$project$View$Card$mediumCardImage, dataset, item),
					A3($author$project$View$Card$mediumCardFooter, dataset, item, isHovered)
				]));
	});
var $author$project$View$Card$renderFallbackTitle = F2(
	function (dataset, item) {
		var titleString = A2(
			$elm$core$Maybe$withDefault,
			'(無題)',
			A2($author$project$View$Card$titleText, dataset, item));
		var targetlink = A2($author$project$View$Card$resolveLinkTarget, dataset.a4, item);
		var baseClasses = 'w-full h-full flex items-center justify-center px-3 text-center text-sm text-neutral-700 font-title font-medium tracking-wide';
		switch (targetlink.$) {
			case 0:
				return A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class(baseClasses + ' cursor-pointer hover:text-blue-600 hover:underline'),
							$elm$html$Html$Events$onClick(
							$author$project$Types$DetailModalMsg(
								$author$project$Types$OpenDetail(item.ai))),
							$elm$html$Html$Attributes$title(titleString)
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(titleString)
						]));
			case 1:
				var url = targetlink.a;
				return A2(
					$elm$html$Html$a,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class(baseClasses + ' hover:text-blue-600 hover:underline'),
							$elm$html$Html$Attributes$href(url),
							$elm$html$Html$Attributes$target('_blank'),
							$elm$html$Html$Attributes$title(titleString)
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(titleString)
						]));
			default:
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class(baseClasses),
							$elm$html$Html$Attributes$title(titleString)
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(titleString)
						]));
		}
	});
var $author$project$View$Card$smallCardBody = F2(
	function (dataset, item) {
		var _v0 = A2($author$project$View$Card$imageUrl, dataset, item);
		if (!_v0.$) {
			var url = _v0.a;
			return A3($author$project$View$Card$renderLinkedImage, dataset, item, url);
		} else {
			return A2($author$project$View$Card$renderFallbackTitle, dataset, item);
		}
	});
var $author$project$View$Card$smallCardClasses = 'w-32 h-48 rounded-md border border-neutral-200 bg-white overflow-hidden flex items-center justify-center relative group';
var $author$project$View$Card$viewSmall = F4(
	function (dataset, isSelected, isHovered, item) {
		return A2(
			$elm$html$Html$div,
			A3($author$project$View$Card$buildCardAttributes, $author$project$View$Card$smallCardClasses, isSelected, item.ai),
			A3(
				$author$project$View$Card$appendEditButtonIf,
				isHovered,
				item.ai,
				_List_fromArray(
					[
						A2($author$project$View$Card$smallCardBody, dataset, item)
					])));
	});
var $author$project$View$Card$view = F5(
	function (dataset, size, isSelected, hoveredItemId, item) {
		var isHovered = _Utils_eq(
			hoveredItemId,
			$elm$core$Maybe$Just(item.ai));
		switch (size) {
			case 0:
				return A4($author$project$View$Card$viewSmall, dataset, isSelected, isHovered, item);
			case 1:
				return A4($author$project$View$Card$viewMedium, dataset, isSelected, isHovered, item);
			default:
				return A4($author$project$View$Card$viewLarge, dataset, isSelected, isHovered, item);
		}
	});
var $author$project$View$cardKeyedEntry = F3(
	function (model, dataset, item) {
		return _Utils_Tuple2(
			item.ai,
			A5($author$project$View$Card$view, dataset, model.aK, false, model.a3, item));
	});
var $author$project$View$noMatchState = A2(
	$elm$html$Html$div,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$class('text-neutral-400 text-sm')
		]),
	_List_fromArray(
		[
			$elm$html$Html$text('条件に一致するカードがありません。')
		]));
var $elm$virtual_dom$VirtualDom$keyedNode = function (tag) {
	return _VirtualDom_keyedNode(
		_VirtualDom_noScript(tag));
};
var $elm$html$Html$Keyed$node = $elm$virtual_dom$VirtualDom$keyedNode;
var $author$project$View$cardGrid = F3(
	function (model, dataset, items) {
		return $elm$core$List$isEmpty(items) ? $author$project$View$noMatchState : A3(
			$elm$html$Html$Keyed$node,
			'div',
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(
					$author$project$View$cardGridClasses(model.aK)),
					$elm$html$Html$Attributes$id('card-grid')
				]),
			A2(
				$elm$core$List$map,
				A2($author$project$View$cardKeyedEntry, model, dataset),
				items));
	});
var $elm$virtual_dom$VirtualDom$style = _VirtualDom_style;
var $elm$html$Html$Attributes$style = $elm$virtual_dom$VirtualDom$style;
var $author$project$View$mainContent = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex flex-col gap-3 pt-12 pb-24 origin-top-left'),
				A2(
				$elm$html$Html$Attributes$style,
				'zoom',
				$elm$core$String$fromFloat(model.bc))
			]),
		_List_fromArray(
			[
				A3(
				$author$project$View$cardGrid,
				model,
				model.m,
				A3($author$project$Filter$visibleItems, model.bo, model.a$, model.m))
			]));
};
var $author$project$View$mainArea = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex-1 h-screen relative overflow-hidden flex flex-col'),
				A2($elm$html$Html$Events$custom, 'dragenter', $author$project$View$dragEnterDecoder),
				A2($elm$html$Html$Events$custom, 'dragover', $author$project$View$dragOverDecoder)
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id('main-area'),
						$elm$html$Html$Attributes$class($author$project$View$mainAreaClasses)
					]),
				_List_fromArray(
					[
						$author$project$View$mainContent(model)
					])),
				model.V ? $author$project$View$dropOverlay : $elm$html$Html$text('')
			]));
};
var $author$project$Types$ScrollToTopClicked = {$: 7};
var $author$project$View$scrollToTopButtonClasses = 'fixed bottom-6 right-6 z-40 px-3 py-1.5 text-xs text-neutral-600 bg-white/70 border border-neutral-300 rounded shadow-sm opacity-50 hover:opacity-100 transition-opacity duration-200';
var $author$project$View$scrollToTopButton = A2(
	$elm$html$Html$button,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$class($author$project$View$scrollToTopButtonClasses),
			$elm$html$Html$Events$onClick($author$project$Types$ScrollToTopClicked)
		]),
	_List_fromArray(
		[
			$elm$html$Html$text('Top')
		]));
var $elm$virtual_dom$VirtualDom$node = function (tag) {
	return _VirtualDom_node(
		_VirtualDom_noScript(tag));
};
var $elm$html$Html$node = $elm$virtual_dom$VirtualDom$node;
var $author$project$View$sortModalCardEntry = F3(
	function (dataset, cardSize, item) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('select-none modal-card-item shrink-0'),
					$elm$html$Html$Attributes$id('sort-item-' + item.ai)
				]),
			_List_fromArray(
				[
					A5($author$project$View$Card$view, dataset, cardSize, false, dataset.by, item)
				]));
	});
var $author$project$Types$SetCardScale = function (a) {
	return {$: 3, a: a};
};
var $author$project$View$cardSizeSlider = function (currentScale) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex flex-col items-center gap-2 h-48')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('text-[10px] text-neutral-500 font-bold')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('サイズ')
					])),
				A2(
				$elm$html$Html$input,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$type_('range'),
						$elm$html$Html$Attributes$min('0.5'),
						$elm$html$Html$Attributes$max('2.0'),
						$elm$html$Html$Attributes$step('0.05'),
						$elm$html$Html$Attributes$value(
						$elm$core$String$fromFloat(currentScale)),
						$elm$html$Html$Events$onInput(
						function (val) {
							return $author$project$Types$SortModalMsg(
								$author$project$Types$SetCardScale(
									A2(
										$elm$core$Maybe$withDefault,
										1.0,
										$elm$core$String$toFloat(val))));
						}),
						$elm$html$Html$Attributes$class('h-32 [writing-mode:vertical-lr] [direction:rtl] cursor-pointer')
					]),
				_List_Nil)
			]));
};
var $author$project$View$sortModalControls = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('w-16 h-full bg-neutral-100 border-l border-neutral-200 flex flex-col items-center justify-start py-6 gap-8 z-10')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$button,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('w-10 h-10 bg-neutral-800 text-white rounded-full flex items-center justify-center text-xs hover:bg-neutral-700 shadow'),
						$elm$html$Html$Attributes$id('sort-modal-close-btn')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('完了')
					])),
				$author$project$View$cardSizeSlider(model.bs)
			]));
};
var $author$project$View$sortModal = function (model) {
	if (!model.bt) {
		return $elm$html$Html$text('');
	} else {
		var scaleStr = $elm$core$String$fromFloat(model.bs);
		var dataset = model.m;
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('fixed inset-0 z-50 bg-black/50 flex')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('flex-1 h-full overflow-y-auto p-6 bg-white pointer-events-auto'),
							$elm$html$Html$Attributes$id('sort-modal-scroll-area')
						]),
					_List_fromArray(
						[
							A3(
							$elm$html$Html$node,
							'sortable-card-grid',
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('flex flex-wrap gap-4 origin-top-left'),
									$elm$html$Html$Attributes$id('sortable-card-grid'),
									A2($elm$html$Html$Attributes$style, 'zoom', scaleStr)
								]),
							A2(
								$elm$core$List$map,
								A2($author$project$View$sortModalCardEntry, dataset, model.aK),
								dataset.aj))
						])),
					$author$project$View$sortModalControls(model)
				]));
	}
};
var $author$project$View$DetailModal$findItemIndex = F2(
	function (targetId, list) {
		return A2(
			$elm$core$Maybe$map,
			$elm$core$Tuple$first,
			$elm$core$List$head(
				A2(
					$elm$core$List$filter,
					function (_v0) {
						var it = _v0.b;
						return _Utils_eq(it.ai, targetId);
					},
					A2($elm$core$List$indexedMap, $elm$core$Tuple$pair, list))));
	});
var $author$project$Types$CloseDetail = {$: 1};
var $author$project$Types$NextCard = {$: 2};
var $author$project$Types$PrevCard = {$: 3};
var $elm$svg$Svg$Attributes$height = _VirtualDom_attribute('height');
var $elm$svg$Svg$Attributes$width = _VirtualDom_attribute('width');
var $author$project$View$DetailModal$chevronLeftIcon = A2(
	$elm$svg$Svg$svg,
	_List_fromArray(
		[
			$elm$svg$Svg$Attributes$width('24'),
			$elm$svg$Svg$Attributes$height('24'),
			$elm$svg$Svg$Attributes$viewBox('0 0 24 24'),
			$elm$svg$Svg$Attributes$fill('none'),
			$elm$svg$Svg$Attributes$stroke('currentColor'),
			$elm$svg$Svg$Attributes$strokeWidth('2.5'),
			$elm$svg$Svg$Attributes$strokeLinecap('round'),
			$elm$svg$Svg$Attributes$strokeLinejoin('round'),
			$elm$svg$Svg$Attributes$class('shrink-0 -translate-x-0.5 pointer-events-none')
		]),
	_List_fromArray(
		[
			A2(
			$elm$svg$Svg$path,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$d('M15 19l-7-7 7-7')
				]),
			_List_Nil)
		]));
var $author$project$View$DetailModal$chevronRightIcon = A2(
	$elm$svg$Svg$svg,
	_List_fromArray(
		[
			$elm$svg$Svg$Attributes$width('24'),
			$elm$svg$Svg$Attributes$height('24'),
			$elm$svg$Svg$Attributes$viewBox('0 0 24 24'),
			$elm$svg$Svg$Attributes$fill('none'),
			$elm$svg$Svg$Attributes$stroke('currentColor'),
			$elm$svg$Svg$Attributes$strokeWidth('2.5'),
			$elm$svg$Svg$Attributes$strokeLinecap('round'),
			$elm$svg$Svg$Attributes$strokeLinejoin('round'),
			$elm$svg$Svg$Attributes$class('shrink-0 translate-x-0.5 pointer-events-none')
		]),
	_List_fromArray(
		[
			A2(
			$elm$svg$Svg$path,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$d('M9 5l7 7-7 7')
				]),
			_List_Nil)
		]));
var $elm$html$Html$span = _VirtualDom_node('span');
var $author$project$View$DetailModal$detailPropertyView = F2(
	function (item, field) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('border-b border-neutral-100 pb-2 flex flex-col gap-0.5')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('text-xs font-medium text-neutral-400')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(field.bb)
						])),
					function () {
					var _v0 = A2($author$project$ItemAccess$getValue, field.ak, item);
					if (!_v0.$) {
						var value = _v0.a;
						var valText = $author$project$ItemAccess$valueToText(value);
						var _v1 = field.aO;
						if (_v1 === 3) {
							return A2(
								$elm$html$Html$a,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$href(valText),
										$elm$html$Html$Attributes$target('_blank'),
										$elm$html$Html$Attributes$class('text-sm text-blue-600 hover:underline break-all')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(valText)
									]));
						} else {
							return A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('text-sm text-neutral-800 whitespace-pre-wrap break-words')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(valText)
									]));
						}
					} else {
						return A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('text-sm text-neutral-300 italic')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('—')
								]));
					}
				}()
				]));
	});
var $elm$html$Html$h2 = _VirtualDom_node('h2');
var $author$project$View$DetailModal$modalContent = F4(
	function (dataset, item, currentNumber, totalCount) {
		var title = A2(
			$elm$core$Maybe$withDefault,
			'(無題)',
			A2(
				$elm$core$Maybe$andThen,
				function (field) {
					return A2($author$project$ItemAccess$getText, field.ak, item);
				},
				A2($author$project$ItemAccess$findFieldByRole, 1, dataset.af)));
		var maybeImg = A2(
			$elm$core$Maybe$andThen,
			function (url) {
				return $elm$core$String$isEmpty(
					$elm$core$String$trim(url)) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(url);
			},
			A2(
				$elm$core$Maybe$andThen,
				function (field) {
					return A2($author$project$ItemAccess$getText, field.ak, item);
				},
				A2($author$project$ItemAccess$findFieldByRole, 2, dataset.af)));
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('relative z-20 bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-neutral-200')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('flex items-center gap-3')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-200 text-neutral-700')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(
											$elm$core$String$fromInt(currentNumber) + (' / ' + $elm$core$String$fromInt(totalCount)))
										])),
									A2(
									$elm$html$Html$h2,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('text-lg font-title font-bold text-neutral-800 truncate max-w-lg')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(title)
										]))
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('flex items-center gap-2')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$button,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition'),
											$elm$html$Html$Events$onClick(
											$author$project$Types$EditModalMsg(
												$author$project$Types$EditButtonClicked(item.ai)))
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('編集')
										])),
									A2(
									$elm$html$Html$button,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('text-neutral-400 hover:text-neutral-700 p-1 text-lg rounded-md transition leading-none ml-2'),
											$elm$html$Html$Events$onClick(
											$author$project$Types$DetailModalMsg($author$project$Types$CloseDetail))
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('✕')
										]))
								]))
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-6')
						]),
					_List_fromArray(
						[
							function () {
							if (!maybeImg.$) {
								var url = maybeImg.a;
								return A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('md:w-1/2 flex items-center justify-center bg-neutral-50 rounded-lg p-2 border border-neutral-100 shrink-0 min-h-[250px]')
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$img,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$src(url),
													$elm$html$Html$Attributes$class('max-w-full max-h-[50vh] object-contain rounded')
												]),
											_List_Nil)
										]));
							} else {
								return $elm$html$Html$text('');
							}
						}(),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('flex-1 flex flex-col gap-4')
								]),
							A2(
								$elm$core$List$map,
								$author$project$View$DetailModal$detailPropertyView(item),
								$author$project$ItemAccess$detailFields(dataset.af)))
						]))
				]));
	});
var $author$project$View$DetailModal$navButton = F5(
	function (enabled, action, positionClasses, iconNode, tip) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(
					'fixed top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full p-0 border-0 leading-none flex items-center justify-center transition shadow-lg outline-none select-none ' + (positionClasses + (enabled ? ' bg-white/95 text-neutral-700 hover:text-neutral-950 hover:bg-white hover:scale-110 cursor-pointer border border-neutral-200/60' : ' bg-white/30 text-neutral-400 opacity-40 cursor-not-allowed border border-transparent'))),
					$elm$html$Html$Events$onClick(
					$author$project$Types$DetailModalMsg(action)),
					$elm$html$Html$Attributes$disabled(!enabled),
					$elm$html$Html$Attributes$title(tip)
				]),
			_List_fromArray(
				[iconNode]));
	});
var $author$project$View$DetailModal$overlay = F6(
	function (dataset, item, hasPrev, hasNext, currentNumber, totalCount) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('absolute inset-0 bg-black/60 backdrop-blur-sm'),
							$elm$html$Html$Events$onClick(
							$author$project$Types$DetailModalMsg($author$project$Types$CloseDetail))
						]),
					_List_Nil),
					A5($author$project$View$DetailModal$navButton, hasPrev, $author$project$Types$PrevCard, 'left-4 md:left-8', $author$project$View$DetailModal$chevronLeftIcon, '前のカード (←)'),
					A4($author$project$View$DetailModal$modalContent, dataset, item, currentNumber, totalCount),
					A5($author$project$View$DetailModal$navButton, hasNext, $author$project$Types$NextCard, 'right-4 md:right-8', $author$project$View$DetailModal$chevronRightIcon, '次のカード (→)')
				]));
	});
var $author$project$View$DetailModal$view = function (model) {
	var _v0 = model.U;
	if (_v0.$ === 1) {
		return $elm$html$Html$text('');
	} else {
		var currentId = _v0.a;
		var visibleItems = A3($author$project$Filter$visibleItems, model.bo, model.a$, model.m);
		var totalCount = $elm$core$List$length(visibleItems);
		var maybeCurrentItem = $elm$core$List$head(
			A2(
				$elm$core$List$filter,
				function (it) {
					return _Utils_eq(it.ai, currentId);
				},
				model.m.aj));
		var currentIndex = A2($author$project$View$DetailModal$findItemIndex, currentId, visibleItems);
		var hasNext = A2(
			$elm$core$Maybe$withDefault,
			false,
			A2(
				$elm$core$Maybe$map,
				function (idx) {
					return _Utils_cmp(idx, totalCount - 1) < 0;
				},
				currentIndex));
		var hasPrev = A2(
			$elm$core$Maybe$withDefault,
			false,
			A2(
				$elm$core$Maybe$map,
				function (idx) {
					return idx > 0;
				},
				currentIndex));
		if (!maybeCurrentItem.$) {
			var item = maybeCurrentItem.a;
			return A6(
				$author$project$View$DetailModal$overlay,
				model.m,
				item,
				hasPrev,
				hasNext,
				A2(
					$elm$core$Maybe$withDefault,
					0,
					A2(
						$elm$core$Maybe$map,
						function (i) {
							return i + 1;
						},
						currentIndex)),
				totalCount);
		} else {
			return $elm$html$Html$text('');
		}
	}
};
var $author$project$Types$Confirm = {$: 9};
var $author$project$Types$Cancel = {$: 10};
var $author$project$Types$DeleteItem = {$: 11};
var $author$project$View$EditModal$cancelButtonClasses = 'px-3.5 py-1.5 text-xs font-medium rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition cursor-pointer';
var $author$project$View$EditModal$deleteButtonClasses = 'px-2.5 py-1.5 text-xs font-medium text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer';
var $author$project$View$EditModal$saveButtonClasses = 'px-4 py-1.5 text-xs font-medium rounded-md bg-neutral-900 text-white hover:bg-neutral-800 shadow-xs transition cursor-pointer';
var $author$project$View$EditModal$footer = function (isNewItem) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('px-6 py-4 border-t border-neutral-100 flex items-center justify-between shrink-0 bg-neutral-50/30')
			]),
		_List_fromArray(
			[
				isNewItem ? A2($elm$html$Html$div, _List_Nil, _List_Nil) : A2(
				$elm$html$Html$button,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class($author$project$View$EditModal$deleteButtonClasses),
						$elm$html$Html$Events$onClick(
						$author$project$Types$EditModalMsg($author$project$Types$DeleteItem))
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('このカードを削除')
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('flex items-center gap-2 ml-auto')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class($author$project$View$EditModal$cancelButtonClasses),
								$elm$html$Html$Events$onClick(
								$author$project$Types$EditModalMsg($author$project$Types$Cancel))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('キャンセル')
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class($author$project$View$EditModal$saveButtonClasses),
								$elm$html$Html$Events$onClick(
								$author$project$Types$EditModalMsg($author$project$Types$Confirm))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('保存')
							]))
					]))
			]));
};
var $author$project$Types$AddField = {$: 18};
var $author$project$View$EditModal$addFieldActions = function (canAdd) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex justify-end pt-1')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$button,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class(
						canAdd ? 'px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-900 text-white hover:bg-neutral-800 transition cursor-pointer' : 'px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-200 text-neutral-400 cursor-not-allowed'),
						$elm$html$Html$Attributes$disabled(!canAdd),
						$elm$html$Html$Events$onClick(
						$author$project$Types$EditModalMsg($author$project$Types$AddField))
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('この項目を追加')
					]))
			]));
};
var $author$project$Types$ToggleAddFieldForm = {$: 13};
var $author$project$View$EditModal$addFieldHeader = A2(
	$elm$html$Html$div,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$class('flex items-center justify-between')
		]),
	_List_fromArray(
		[
			A2(
			$elm$html$Html$span,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('text-xs font-bold text-neutral-800')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('新しいフィールドを追加')
				])),
			A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('text-xs text-neutral-400 hover:text-neutral-600 cursor-pointer'),
					$elm$html$Html$Events$onClick(
					$author$project$Types$EditModalMsg($author$project$Types$ToggleAddFieldForm))
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('✕ 閉じる')
				]))
		]));
var $author$project$Types$NewFieldNameChanged = function (a) {
	return {$: 14, a: a};
};
var $elm$html$Html$label = _VirtualDom_node('label');
var $elm$html$Html$Attributes$placeholder = $elm$html$Html$Attributes$stringProperty('placeholder');
var $author$project$View$EditModal$nameInputSection = F2(
	function (currentName, isDuplicate) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('flex flex-col gap-1')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$label,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('text-[11px] font-semibold text-neutral-500')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('フィールド名')
						])),
					A2(
					$elm$html$Html$input,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('w-full border border-neutral-200 rounded-md px-2.5 py-1.5 text-xs bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-400'),
							$elm$html$Html$Attributes$placeholder('項目名（例: 評価、発売日）'),
							$elm$html$Html$Attributes$value(currentName),
							$elm$html$Html$Events$onInput(
							A2($elm$core$Basics$composeL, $author$project$Types$EditModalMsg, $author$project$Types$NewFieldNameChanged))
						]),
					_List_Nil),
					isDuplicate ? A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('text-[11px] text-red-500')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('すでに同じ名前の項目が存在します')
						])) : $elm$html$Html$text('')
				]));
	});
var $author$project$Types$NewFieldTypeChanged = function (a) {
	return {$: 15, a: a};
};
var $author$project$View$EditModal$typeOptionButton = F3(
	function (isSelected, msg, labelText) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(
					isSelected ? 'flex-1 py-1 px-2 text-xs font-semibold rounded bg-neutral-900 text-white' : 'flex-1 py-1 px-2 text-xs rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 cursor-pointer'),
					$elm$html$Html$Events$onClick(msg)
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(labelText)
				]));
	});
var $author$project$View$EditModal$typeSelectSection = function (currentType) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex flex-col gap-1')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$label,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('text-[11px] font-semibold text-neutral-500')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('値の型')
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('flex gap-2')
					]),
				_List_fromArray(
					[
						A3(
						$author$project$View$EditModal$typeOptionButton,
						!currentType,
						$author$project$Types$EditModalMsg(
							$author$project$Types$NewFieldTypeChanged(0)),
						'String（テキスト）'),
						A3(
						$author$project$View$EditModal$typeOptionButton,
						currentType === 1,
						$author$project$Types$EditModalMsg(
							$author$project$Types$NewFieldTypeChanged(1)),
						'Boolean（真偽値）')
					]))
			]));
};
var $author$project$Types$NewFieldBoolChanged = function (a) {
	return {$: 17, a: a};
};
var $elm$html$Html$Attributes$checked = $elm$html$Html$Attributes$boolProperty('checked');
var $author$project$View$EditModal$boolValueInput = function (isChecked) {
	return A2(
		$elm$html$Html$label,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex items-center gap-2 text-xs cursor-pointer select-none py-1')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$input,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$type_('checkbox'),
						$elm$html$Html$Attributes$class('w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400'),
						$elm$html$Html$Attributes$checked(isChecked),
						$elm$html$Html$Events$onClick(
						$author$project$Types$EditModalMsg(
							$author$project$Types$NewFieldBoolChanged(!isChecked)))
					]),
				_List_Nil),
				A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('text-neutral-700 font-medium')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(
						isChecked ? 'はい (True)' : 'いいえ (False)')
					]))
			]));
};
var $author$project$Types$NewFieldValueChanged = function (a) {
	return {$: 16, a: a};
};
var $author$project$View$EditModal$textValueInput = function (currentVal) {
	return A2(
		$elm$html$Html$input,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('w-full border border-neutral-200 rounded-md px-2.5 py-1.5 text-xs bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-400'),
				$elm$html$Html$Attributes$placeholder('初期値'),
				$elm$html$Html$Attributes$value(currentVal),
				$elm$html$Html$Events$onInput(
				A2($elm$core$Basics$composeL, $author$project$Types$EditModalMsg, $author$project$Types$NewFieldValueChanged))
			]),
		_List_Nil);
};
var $author$project$View$EditModal$valueInputSection = function (form) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex flex-col gap-1')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$label,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('text-[11px] font-semibold text-neutral-500')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('値')
					])),
				function () {
				var _v0 = form.aY;
				if (!_v0) {
					return $author$project$View$EditModal$textValueInput(form.bu);
				} else {
					return $author$project$View$EditModal$boolValueInput(form.aJ);
				}
			}()
			]));
};
var $author$project$View$EditModal$addFieldPanel = function (editState) {
	var trimmedName = $elm$core$String$trim(editState.be.bd);
	var alreadyExists = A2(
		$elm$core$List$any,
		function (f) {
			return _Utils_eq(f.ak, trimmedName);
		},
		editState.af);
	var canAdd = (!$elm$core$String$isEmpty(trimmedName)) && (!alreadyExists);
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('bg-neutral-50/80 border border-neutral-200 rounded-lg p-3.5 flex flex-col gap-3')
			]),
		_List_fromArray(
			[
				$author$project$View$EditModal$addFieldHeader,
				A2($author$project$View$EditModal$nameInputSection, editState.be.bd, alreadyExists),
				$author$project$View$EditModal$typeSelectSection(editState.be.aY),
				$author$project$View$EditModal$valueInputSection(editState.be),
				$author$project$View$EditModal$addFieldActions(canAdd)
			]));
};
var $author$project$View$EditModal$addFieldTriggerButton = A2(
	$elm$html$Html$button,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$class('self-start flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-dashed border-neutral-300 text-neutral-600 hover:text-neutral-900 hover:border-neutral-400 hover:bg-neutral-50 transition cursor-pointer'),
			$elm$html$Html$Events$onClick(
			$author$project$Types$EditModalMsg($author$project$Types$ToggleAddFieldForm))
		]),
	_List_fromArray(
		[
			$elm$html$Html$text('+ 新しいフィールドを追加')
		]));
var $author$project$View$EditModal$addFieldSection = function (editState) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('border-t border-neutral-100 pt-4 mt-1 flex flex-col gap-3')
			]),
		_List_fromArray(
			[
				editState.a8 ? $author$project$View$EditModal$addFieldPanel(editState) : $author$project$View$EditModal$addFieldTriggerButton
			]));
};
var $author$project$Types$BooleanFieldChanged = F2(
	function (a, b) {
		return {$: 8, a: a, b: b};
	});
var $author$project$View$EditModal$booleanFieldEditor = F2(
	function (field, isChecked) {
		var label_ = A2($elm$core$Maybe$withDefault, 'はい', field.bB);
		return A2(
			$elm$html$Html$label,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('flex items-center gap-2 text-sm cursor-pointer select-none py-1')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$input,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$type_('checkbox'),
							$elm$html$Html$Attributes$class('w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400'),
							$elm$html$Html$Attributes$checked(isChecked),
							$elm$html$Html$Events$onClick(
							$author$project$Types$EditModalMsg(
								A2($author$project$Types$BooleanFieldChanged, field.ak, !isChecked)))
						]),
					_List_Nil),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('text-neutral-700')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(label_)
						]))
				]));
	});
var $author$project$View$EditModal$findItem = F2(
	function (itemId, model) {
		return $elm$core$List$head(
			A2(
				$elm$core$List$filter,
				function (item) {
					return _Utils_eq(item.ai, itemId);
				},
				model.m.aj));
	});
var $author$project$Types$TextFieldChanged = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $elm$html$Html$Attributes$rows = function (n) {
	return A2(
		_VirtualDom_attribute,
		'rows',
		$elm$core$String$fromInt(n));
};
var $elm$html$Html$textarea = _VirtualDom_node('textarea');
var $author$project$View$EditModal$textareaClasses = 'w-full border border-neutral-200 rounded-md px-3 py-2 text-sm bg-white text-neutral-900 min-h-[38px] transition focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400';
var $author$project$View$EditModal$textFieldEditor = F3(
	function (fieldKey, content, _v0) {
		return A2(
			$elm$html$Html$textarea,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class($author$project$View$EditModal$textareaClasses),
					$elm$html$Html$Attributes$value(content),
					$elm$html$Html$Events$onInput(
					A2(
						$elm$core$Basics$composeL,
						$author$project$Types$EditModalMsg,
						$author$project$Types$TextFieldChanged(fieldKey))),
					$elm$html$Html$Attributes$rows(1)
				]),
			_List_Nil);
	});
var $author$project$Types$TextListFieldChanged = F2(
	function (a, b) {
		return {$: 4, a: a, b: b};
	});
var $author$project$View$EditModal$textListFieldEditor = F2(
	function (fieldKey, state) {
		return A2(
			$elm$html$Html$textarea,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class($author$project$View$EditModal$textareaClasses),
					$elm$html$Html$Attributes$value(state.bk),
					$elm$html$Html$Events$onInput(
					A2(
						$elm$core$Basics$composeL,
						$author$project$Types$EditModalMsg,
						$author$project$Types$TextListFieldChanged(fieldKey))),
					$elm$html$Html$Attributes$rows(1)
				]),
			_List_Nil);
	});
var $author$project$View$EditModal$fieldForm = F3(
	function (editState, model, field) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('flex flex-col gap-1.5')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$label,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('text-xs font-semibold text-neutral-600')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(field.bb)
						])),
					function () {
					var _v0 = A2($elm$core$Dict$get, field.ak, editState.aT);
					if (!_v0.$) {
						switch (_v0.a.$) {
							case 0:
								var _v1 = _v0.a;
								var content = _v1.a;
								var size = _v1.b;
								return A3($author$project$View$EditModal$textFieldEditor, field.ak, content, size);
							case 1:
								var state = _v0.a.a;
								return A2($author$project$View$EditModal$textListFieldEditor, field.ak, state);
							default:
								var checked_ = _v0.a.a;
								return A2($author$project$View$EditModal$booleanFieldEditor, field, checked_);
						}
					} else {
						var maybeItem = A2($author$project$View$EditModal$findItem, editState.aS, model);
						var _v2 = A2(
							$elm$core$Maybe$andThen,
							function (item) {
								return A2($author$project$ItemAccess$getValue, field.ak, item);
							},
							maybeItem);
						if (!_v2.$) {
							switch (_v2.a.$) {
								case 0:
									var content = _v2.a.a;
									if (field.ba) {
										var state = {
											aj: _List_fromArray(
												[
													{
													br: {a1: 0, bE: 0},
													M: content
												}
												]),
											bk: content
										};
										return A2($author$project$View$EditModal$textListFieldEditor, field.ak, state);
									} else {
										return A3(
											$author$project$View$EditModal$textFieldEditor,
											field.ak,
											content,
											{a1: 0, bE: 0});
									}
								case 1:
									var items = _v2.a.a;
									var state = {
										aj: A2(
											$elm$core$List$map,
											function (val) {
												return {
													br: {a1: 0, bE: 0},
													M: val
												};
											},
											items),
										bk: A2($elm$core$String$join, ', ', items)
									};
									return A2($author$project$View$EditModal$textListFieldEditor, field.ak, state);
								default:
									var checked_ = _v2.a.a;
									return A2($author$project$View$EditModal$booleanFieldEditor, field, checked_);
							}
						} else {
							return field.a9 ? A2($author$project$View$EditModal$booleanFieldEditor, field, false) : (field.ba ? A2(
								$author$project$View$EditModal$textListFieldEditor,
								field.ak,
								{aj: _List_Nil, bk: ''}) : A3(
								$author$project$View$EditModal$textFieldEditor,
								field.ak,
								'',
								{a1: 0, bE: 0}));
						}
					}
				}()
				]));
	});
var $author$project$View$EditModal$formContent = F2(
	function (editState, model) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('px-6 py-5 flex-1 overflow-y-auto flex flex-col gap-4')
				]),
			_Utils_ap(
				A2(
					$elm$core$List$map,
					A2($author$project$View$EditModal$fieldForm, editState, model),
					editState.af),
				_List_fromArray(
					[
						$author$project$View$EditModal$addFieldSection(editState)
					])));
	});
var $author$project$Types$Close = {$: 2};
var $author$project$View$EditModal$header = F2(
	function (editState, model) {
		var dataset = model.m;
		var isNewItem = !A2(
			$elm$core$List$any,
			function (item) {
				return _Utils_eq(item.ai, editState.aS);
			},
			dataset.aj);
		var title = isNewItem ? '新規作成' : 'アイテムを編集';
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('px-6 py-4 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-neutral-50/50')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$h2,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('text-base font-bold text-neutral-800')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(title)
						])),
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('text-neutral-400 hover:text-neutral-700 p-1 text-base rounded-md transition leading-none cursor-pointer'),
							$elm$html$Html$Events$onClick(
							$author$project$Types$EditModalMsg($author$project$Types$Close))
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('✕')
						]))
				]));
	});
var $author$project$View$EditModal$overlay = F2(
	function (editState, model) {
		var dataset = model.m;
		var isNewItem = !A2(
			$elm$core$List$any,
			function (item) {
				return _Utils_eq(item.ai, editState.aS);
			},
			dataset.aj);
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('fixed inset-0 flex items-center justify-center z-60 p-4')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity'),
							$elm$html$Html$Events$onClick(
							$author$project$Types$EditModalMsg($author$project$Types$Confirm))
						]),
					_List_Nil),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('relative bg-white rounded-xl shadow-xl border border-neutral-200/80 w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col z-10')
						]),
					_List_fromArray(
						[
							A2($author$project$View$EditModal$header, editState, model),
							A2($author$project$View$EditModal$formContent, editState, model),
							$author$project$View$EditModal$footer(isNewItem)
						]))
				]));
	});
var $author$project$View$EditModal$view = function (model) {
	if (model.aR) {
		var _v0 = model.aQ;
		if (!_v0.$) {
			var editState = _v0.a;
			return A2($author$project$View$EditModal$overlay, editState, model);
		} else {
			return $elm$html$Html$text('');
		}
	} else {
		return $elm$html$Html$text('');
	}
};
var $author$project$Types$ToggleModal = function (a) {
	return {$: 0, a: a};
};
var $author$project$Types$ExportBackupClicked = {$: 13};
var $author$project$Types$RequestOpenBackupFile = {$: 10};
var $elm$html$Html$p = _VirtualDom_node('p');
var $author$project$View$FileModal$sectionHeader = F2(
	function (title_, description_) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('flex flex-col gap-0.5')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$h3,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('text-xs font-bold text-neutral-700')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(title_)
						])),
					A2(
					$elm$html$Html$p,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('text-[11px] text-neutral-400')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(description_)
						]))
				]));
	});
var $author$project$View$FileModal$backupSection = A2(
	$elm$html$Html$div,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$class('flex flex-col gap-3 pt-4 border-t border-neutral-100')
		]),
	_List_fromArray(
		[
			A2($author$project$View$FileModal$sectionHeader, 'バックアップ', '項目の表示名や配置順などの全設定を含めて保存・復元します。'),
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('grid grid-cols-2 gap-3')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('py-2 px-3 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 shadow-sm transition'),
							$elm$html$Html$Events$onClick(
							$author$project$Types$FileFlowMsg($author$project$Types$RequestOpenBackupFile))
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('復元（読み込み）')
						])),
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('py-2 px-3 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 shadow-sm transition'),
							$elm$html$Html$Events$onClick(
							$author$project$Types$FileFlowMsg($author$project$Types$ExportBackupClicked))
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('バックアップ書き出し')
						]))
				]))
		]));
var $author$project$Types$DatasetMsg = function (a) {
	return {$: 9, a: a};
};
var $author$project$Types$OpenRename = {$: 0};
var $author$project$View$FileModal$currentDatasetCard = function (dataset) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('bg-neutral-50 rounded-lg p-4 border border-neutral-200/80 flex items-center justify-between')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('flex flex-col gap-1 min-w-0 pr-3')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('text-[11px] font-semibold text-neutral-400 uppercase tracking-wider')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('現在のデータセット')
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('text-base font-bold text-neutral-800 truncate')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(dataset.bd)
							])),
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('text-xs text-neutral-500')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(
								$elm$core$String$fromInt(
									$elm$core$List$length(dataset.aj)) + ' 件のカード')
							]))
					])),
				A2(
				$elm$html$Html$button,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('shrink-0 px-3 py-1.5 text-xs font-medium rounded-md border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 shadow-sm transition'),
						$elm$html$Html$Events$onClick(
						$author$project$Types$DatasetMsg($author$project$Types$OpenRename))
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('名前を変更')
					]))
			]));
};
var $author$project$View$FileModal$errorMessage = function (model) {
	var _v0 = model.E;
	if (!_v0.$) {
		var message = _v0.a;
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(message)
				]));
	} else {
		return $elm$html$Html$text('');
	}
};
var $author$project$Types$CsvFormat = 1;
var $author$project$Types$ExportClicked = function (a) {
	return {$: 9, a: a};
};
var $author$project$View$FileModal$exportSection = A2(
	$elm$html$Html$div,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$class('flex flex-col gap-3 pt-4 border-t border-neutral-100')
		]),
	_List_fromArray(
		[
			A2($author$project$View$FileModal$sectionHeader, 'データの書き出し', '現在のカードデータをファイルとしてダウンロードします。'),
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('grid grid-cols-2 gap-3')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('py-2 px-3 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 shadow-sm transition'),
							$elm$html$Html$Events$onClick(
							$author$project$Types$FileFlowMsg(
								$author$project$Types$ExportClicked(0)))
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('JSON で書き出す')
						])),
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('py-2 px-3 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 shadow-sm transition'),
							$elm$html$Html$Events$onClick(
							$author$project$Types$FileFlowMsg(
								$author$project$Types$ExportClicked(1)))
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('CSV で書き出す')
						]))
				]))
		]));
var $author$project$View$FileModal$header = A2(
	$elm$html$Html$div,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$class('px-6 py-4 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur z-20')
		]),
	_List_fromArray(
		[
			A2(
			$elm$html$Html$h2,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('text-base font-bold text-neutral-800')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('ファイル・データ管理')
				])),
			A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('text-neutral-400 hover:text-neutral-700 p-1 text-sm rounded-md transition'),
					$elm$html$Html$Events$onClick(
					$author$project$Types$FileFlowMsg(
						$author$project$Types$ToggleModal(false)))
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('✕')
				]))
		]));
var $author$project$Types$RequestOpenFile = {$: 2};
var $author$project$Types$CancelPendingImport = {$: 8};
var $author$project$Types$ConfirmNewDataset = {$: 6};
var $author$project$Types$ImportNameChanged = function (a) {
	return {$: 5, a: a};
};
var $author$project$View$FileModal$primaryButtonClasses = 'px-3.5 py-1.5 text-xs font-medium rounded-md bg-neutral-900 text-white hover:bg-neutral-800 transition shadow-sm';
var $author$project$View$FileModal$secondaryButtonClasses = 'px-3.5 py-1.5 text-xs font-medium rounded-md border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition';
var $author$project$View$FileModal$newDatasetForm = function (pending) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('bg-blue-50/60 border border-blue-200 rounded-lg p-4 flex flex-col gap-3 text-sm')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$p,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('text-blue-900 font-medium')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(
						$elm$core$String$fromInt(
							$elm$core$List$length(pending.G)) + ' 件のデータを新規作成します。新しいデータの名前を入力してください。')
					])),
				A2(
				$elm$html$Html$input,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('w-full border border-neutral-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'),
						$elm$html$Html$Attributes$placeholder('データセットの名前'),
						$elm$html$Html$Attributes$value(pending.P),
						$elm$html$Html$Events$onInput(
						A2($elm$core$Basics$composeR, $author$project$Types$ImportNameChanged, $author$project$Types$FileFlowMsg))
					]),
				_List_Nil),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('flex justify-end gap-2')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class($author$project$View$FileModal$secondaryButtonClasses),
								$elm$html$Html$Events$onClick(
								$author$project$Types$FileFlowMsg($author$project$Types$CancelPendingImport))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('取消')
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class($author$project$View$FileModal$primaryButtonClasses),
								$elm$html$Html$Events$onClick(
								$author$project$Types$FileFlowMsg($author$project$Types$ConfirmNewDataset))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('決定して作成')
							]))
					]))
			]));
};
var $author$project$Types$IgnoreNewFields = 1;
var $author$project$Types$ResolveNewProperties = function (a) {
	return {$: 7, a: a};
};
var $author$project$View$FileModal$newPropertyChoice = function (pending) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col gap-3 text-sm')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$p,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('text-amber-900 font-medium')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(
						'既存データに無いプロパティが見つかりました: ' + A2($elm$core$String$join, ', ', pending.an))
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('flex justify-end gap-2 flex-wrap')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class($author$project$View$FileModal$secondaryButtonClasses),
								$elm$html$Html$Events$onClick(
								$author$project$Types$FileFlowMsg($author$project$Types$CancelPendingImport))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('中止')
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class($author$project$View$FileModal$secondaryButtonClasses),
								$elm$html$Html$Events$onClick(
								$author$project$Types$FileFlowMsg(
									$author$project$Types$ResolveNewProperties(1)))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('無視する')
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class($author$project$View$FileModal$primaryButtonClasses),
								$elm$html$Html$Events$onClick(
								$author$project$Types$FileFlowMsg(
									$author$project$Types$ResolveNewProperties(0)))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('プロパティを追加')
							]))
					]))
			]));
};
var $author$project$View$FileModal$pendingImportView = function (pending) {
	var _v0 = pending.al;
	if (!_v0) {
		return $author$project$View$FileModal$newDatasetForm(pending);
	} else {
		return $author$project$View$FileModal$newPropertyChoice(pending);
	}
};
var $author$project$View$FileModal$importAction = function (model) {
	var _v0 = model.f;
	if (!_v0.$) {
		var pending = _v0.a;
		return $author$project$View$FileModal$pendingImportView(pending);
	} else {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('w-full py-3 px-4 border-2 border-dashed border-neutral-300 hover:border-neutral-400 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition flex flex-col items-center justify-center gap-1 cursor-pointer'),
					$elm$html$Html$Events$onClick(
					$author$project$Types$FileFlowMsg($author$project$Types$RequestOpenFile))
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('font-semibold')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('ファイルを選択')
						])),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('text-xs text-neutral-400')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('対応形式: .json, .csv（自動判別）')
						]))
				]));
	}
};
var $author$project$Types$ReplaceData = 2;
var $author$project$Types$SetReadMode = function (a) {
	return {$: 1, a: a};
};
var $author$project$View$FileModal$modeTab = F4(
	function (current, target, label_, tip) {
		var isActive = _Utils_eq(current, target);
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(
					isActive ? 'py-2 px-3 rounded-md bg-white text-neutral-900 font-semibold shadow-sm transition text-center' : 'py-2 px-3 rounded-md text-neutral-500 hover:text-neutral-900 transition text-center'),
					$elm$html$Html$Events$onClick(
					$author$project$Types$FileFlowMsg(
						$author$project$Types$SetReadMode(target))),
					$elm$html$Html$Attributes$title(tip)
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(label_)
				]));
	});
var $author$project$View$FileModal$readModeSelector = function (current) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('grid grid-cols-3 gap-2 bg-neutral-100 p-1 rounded-lg text-xs font-medium text-neutral-600')
			]),
		_List_fromArray(
			[
				A4($author$project$View$FileModal$modeTab, current, 0, '新規', '現在のデータを破棄して作り直す'),
				A4($author$project$View$FileModal$modeTab, current, 1, '追加', '現在のデータの末尾に付け足す'),
				A4($author$project$View$FileModal$modeTab, current, 2, '置き換え', '設定を保ったままカードのみ入れ替える')
			]));
};
var $author$project$View$FileModal$importSection = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex flex-col gap-3')
			]),
		_List_fromArray(
			[
				A2($author$project$View$FileModal$sectionHeader, 'データの読み込み', 'JSON または CSV ファイルからデータを取り込みます。'),
				$author$project$View$FileModal$readModeSelector(model.Y),
				$author$project$View$FileModal$importAction(model)
			]));
};
var $author$project$Types$CancelRename = {$: 2};
var $author$project$Types$ConfirmRename = {$: 3};
var $author$project$Types$RenameNameChanged = function (a) {
	return {$: 1, a: a};
};
var $author$project$View$FileModal$renameModalView = function (model) {
	var _v0 = model.bm;
	if (_v0.$ === 1) {
		return $elm$html$Html$text('');
	} else {
		var renameState = _v0.a;
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('fixed inset-0 flex items-center justify-center z-[60] p-4')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('absolute inset-0 bg-black/30'),
							$elm$html$Html$Events$onClick(
							$author$project$Types$DatasetMsg($author$project$Types$CancelRename))
						]),
					_List_Nil),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('relative bg-white rounded-xl shadow-xl w-80 p-5 flex flex-col gap-4 z-10 border border-neutral-100')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('flex flex-col gap-1')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$h3,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('text-sm font-bold text-neutral-800')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('データセット名の変更')
										])),
									A2(
									$elm$html$Html$p,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('text-xs text-neutral-400')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('新しい名前を入力してください。')
										]))
								])),
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400'),
									$elm$html$Html$Attributes$value(renameState.bd),
									$elm$html$Html$Events$onInput(
									A2($elm$core$Basics$composeR, $author$project$Types$RenameNameChanged, $author$project$Types$DatasetMsg))
								]),
							_List_Nil),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('flex justify-end gap-2')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$button,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class($author$project$View$FileModal$secondaryButtonClasses),
											$elm$html$Html$Events$onClick(
											$author$project$Types$DatasetMsg($author$project$Types$CancelRename))
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('キャンセル')
										])),
									A2(
									$elm$html$Html$button,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class($author$project$View$FileModal$primaryButtonClasses),
											$elm$html$Html$Events$onClick(
											$author$project$Types$DatasetMsg($author$project$Types$ConfirmRename))
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('決定')
										]))
								]))
						]))
				]));
	}
};
var $author$project$View$FileModal$overlay = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('fixed inset-0 flex items-center justify-center z-50 p-4')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity'),
						$elm$html$Html$Events$onClick(
						$author$project$Types$FileFlowMsg(
							$author$project$Types$ToggleModal(false)))
					]),
				_List_Nil),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto flex flex-col z-10 border border-neutral-100')
					]),
				_List_fromArray(
					[
						$author$project$View$FileModal$header,
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('p-6 flex flex-col gap-6')
							]),
						_List_fromArray(
							[
								$author$project$View$FileModal$currentDatasetCard(model.m),
								$author$project$View$FileModal$importSection(model),
								$author$project$View$FileModal$exportSection,
								$author$project$View$FileModal$backupSection,
								$author$project$View$FileModal$errorMessage(model)
							]))
					])),
				$author$project$View$FileModal$renameModalView(model)
			]));
};
var $author$project$View$FileModal$view = function (model) {
	return model.D ? $author$project$View$FileModal$overlay(model) : $elm$html$Html$text('');
};
var $author$project$Types$ToggleSettingsModal = function (a) {
	return {$: 1, a: a};
};
var $author$project$Types$FieldSettingsMsg = function (a) {
	return {$: 12, a: a};
};
var $author$project$Types$SetWrapTitleOnCard = function (a) {
	return {$: 10, a: a};
};
var $author$project$View$SettingsModal$sectionTitle = function (labelText) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('text-xs font-medium text-neutral-400')
			]),
		_List_fromArray(
			[
				$elm$html$Html$text(labelText)
			]));
};
var $author$project$View$SettingsModal$cardDisplaySection = function (dataset) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex flex-col gap-2 border-t border-neutral-100 pt-4')
			]),
		_List_fromArray(
			[
				$author$project$View$SettingsModal$sectionTitle('カード表示設定'),
				A2(
				$elm$html$Html$label,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('flex items-center gap-2 text-sm text-neutral-700 cursor-pointer select-none')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$input,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$type_('checkbox'),
								$elm$html$Html$Attributes$checked(dataset.bG),
								$elm$html$Html$Events$onClick(
								$author$project$Types$FieldSettingsMsg(
									$author$project$Types$SetWrapTitleOnCard(!dataset.bG))),
								$elm$html$Html$Attributes$class('w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400')
							]),
						_List_Nil),
						A2(
						$elm$html$Html$span,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('タイトルを折り返して表示')
							]))
					]))
			]));
};
var $author$project$View$SettingsModal$boolConfigClasses = 'self-end flex items-center gap-4 bg-neutral-50 p-2 rounded border border-neutral-100 text-xs mt-1';
var $author$project$Types$SetFalseLabel = F2(
	function (a, b) {
		return {$: 5, a: a, b: b};
	});
var $author$project$View$SettingsModal$boolInputClasses = 'w-20 border border-neutral-200 rounded px-2 py-0.5 text-xs bg-white';
var $author$project$View$SettingsModal$falseLabelInput = function (field) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex items-center gap-2')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('text-neutral-500')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('False表記')
					])),
				A2(
				$elm$html$Html$input,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class($author$project$View$SettingsModal$boolInputClasses),
						$elm$html$Html$Attributes$value(
						A2($elm$core$Maybe$withDefault, 'いいえ', field.aX)),
						$elm$html$Html$Attributes$placeholder('いいえ'),
						$elm$html$Html$Events$onInput(
						A2(
							$elm$core$Basics$composeL,
							$author$project$Types$FieldSettingsMsg,
							$author$project$Types$SetFalseLabel(field.ak)))
					]),
				_List_Nil)
			]));
};
var $author$project$View$SettingsModal$isBooleanValue = function (val) {
	if (val.$ === 2) {
		return true;
	} else {
		return false;
	}
};
var $author$project$View$SettingsModal$isBoolField = F2(
	function (dataset, field) {
		return A2(
			$elm$core$List$any,
			$author$project$View$SettingsModal$isBooleanValue,
			A2(
				$elm$core$List$filterMap,
				function (item) {
					return A2($elm$core$Dict$get, field.ak, item.aA);
				},
				dataset.aj));
	});
var $author$project$Types$SetTrueLabel = F2(
	function (a, b) {
		return {$: 4, a: a, b: b};
	});
var $author$project$View$SettingsModal$trueLabelInput = function (field) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex items-center gap-2')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('text-neutral-500')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('True表記')
					])),
				A2(
				$elm$html$Html$input,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class($author$project$View$SettingsModal$boolInputClasses),
						$elm$html$Html$Attributes$value(
						A2($elm$core$Maybe$withDefault, 'はい', field.bB)),
						$elm$html$Html$Attributes$placeholder('はい'),
						$elm$html$Html$Events$onInput(
						A2(
							$elm$core$Basics$composeL,
							$author$project$Types$FieldSettingsMsg,
							$author$project$Types$SetTrueLabel(field.ak)))
					]),
				_List_Nil)
			]));
};
var $author$project$View$SettingsModal$booleanDisplayConfig = F2(
	function (dataset, field) {
		return A2($author$project$View$SettingsModal$isBoolField, dataset, field) ? A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class($author$project$View$SettingsModal$boolConfigClasses)
				]),
			_List_fromArray(
				[
					$author$project$View$SettingsModal$trueLabelInput(field),
					$author$project$View$SettingsModal$falseLabelInput(field)
				])) : $elm$html$Html$text('');
	});
var $author$project$Types$SetDisplayRole = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $author$project$View$SettingsModal$toggleButtonClasses = function (isActive) {
	return isActive ? 'px-2 py-0.5 text-xs rounded bg-neutral-900 text-white' : 'px-2 py-0.5 text-xs rounded border border-neutral-200 text-neutral-500 hover:bg-neutral-100';
};
var $author$project$View$SettingsModal$displayRoleButton = F3(
	function (field, target, label_) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(
					$author$project$View$SettingsModal$toggleButtonClasses(
						_Utils_eq(field.aO, target))),
					$elm$html$Html$Events$onClick(
					$author$project$Types$FieldSettingsMsg(
						A2($author$project$Types$SetDisplayRole, field.ak, target)))
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(label_)
				]));
	});
var $author$project$View$SettingsModal$displayRoleButtons = function (field) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex gap-1')
			]),
		_List_fromArray(
			[
				A3($author$project$View$SettingsModal$displayRoleButton, field, 0, '通常'),
				A3($author$project$View$SettingsModal$displayRoleButton, field, 1, 'タイトル'),
				A3($author$project$View$SettingsModal$displayRoleButton, field, 2, '画像'),
				A3($author$project$View$SettingsModal$displayRoleButton, field, 3, 'リンク')
			]));
};
var $author$project$Types$SetLabel = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $author$project$View$SettingsModal$inputClasses = 'flex-1 border border-neutral-200 rounded px-2 py-1 text-sm';
var $author$project$View$SettingsModal$labelInput = function (field) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex-1 flex items-center gap-2')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('text-xs text-neutral-400 shrink-0')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(field.ak)
					])),
				A2(
				$elm$html$Html$input,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class($author$project$View$SettingsModal$inputClasses),
						$elm$html$Html$Attributes$title('このフィールドの表記名を変更できます'),
						$elm$html$Html$Attributes$value(field.bb),
						$elm$html$Html$Events$onInput(
						A2(
							$elm$core$Basics$composeL,
							$author$project$Types$FieldSettingsMsg,
							$author$project$Types$SetLabel(field.ak)))
					]),
				_List_Nil)
			]));
};
var $author$project$Types$MoveFieldDown = function (a) {
	return {$: 7, a: a};
};
var $author$project$View$SettingsModal$moveButtonClasses = function (enabled) {
	return enabled ? 'px-2 py-0.5 text-xs rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-100' : 'px-2 py-0.5 text-xs rounded border border-neutral-100 text-neutral-300 cursor-not-allowed';
};
var $author$project$View$SettingsModal$moveDownButton = F2(
	function (key, enabled) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(
					$author$project$View$SettingsModal$moveButtonClasses(enabled)),
					$elm$html$Html$Events$onClick(
					$author$project$Types$FieldSettingsMsg(
						$author$project$Types$MoveFieldDown(key))),
					$elm$html$Html$Attributes$disabled(!enabled)
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('↓')
				]));
	});
var $author$project$Types$MoveFieldUp = function (a) {
	return {$: 6, a: a};
};
var $author$project$View$SettingsModal$moveUpButton = F2(
	function (key, enabled) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(
					$author$project$View$SettingsModal$moveButtonClasses(enabled)),
					$elm$html$Html$Events$onClick(
					$author$project$Types$FieldSettingsMsg(
						$author$project$Types$MoveFieldUp(key))),
					$elm$html$Html$Attributes$disabled(!enabled)
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('↑')
				]));
	});
var $author$project$View$SettingsModal$moveButtons = F3(
	function (field, index, total) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('flex gap-1')
				]),
			_List_fromArray(
				[
					A2($author$project$View$SettingsModal$moveUpButton, field.ak, index > 0),
					A2(
					$author$project$View$SettingsModal$moveDownButton,
					field.ak,
					_Utils_cmp(index, total - 1) < 0)
				]));
	});
var $author$project$Types$SetShowOnCard = F2(
	function (a, b) {
		return {$: 2, a: a, b: b};
	});
var $author$project$View$SettingsModal$checkboxField = F4(
	function (_v0, labelText, current, toMsg) {
		return A2(
			$elm$html$Html$label,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('flex items-center gap-1 text-sm text-neutral-600')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$input,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$type_('checkbox'),
							$elm$html$Html$Attributes$checked(current),
							$elm$html$Html$Events$onClick(
							$author$project$Types$FieldSettingsMsg(
								toMsg(!current)))
						]),
					_List_Nil),
					$elm$html$Html$text(labelText)
				]));
	});
var $author$project$View$SettingsModal$showOnCardCheckbox = function (field) {
	return A4(
		$author$project$View$SettingsModal$checkboxField,
		field.ak,
		'カードに表示',
		field.bq,
		$author$project$Types$SetShowOnCard(field.ak));
};
var $author$project$View$SettingsModal$fieldRow = F4(
	function (total, index, dataset, field) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('border border-neutral-200 rounded-md p-2 flex flex-col gap-2')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('flex items-center gap-2')
						]),
					_List_fromArray(
						[
							A3($author$project$View$SettingsModal$moveButtons, field, index, total),
							$author$project$View$SettingsModal$labelInput(field)
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('flex items-center justify-between flex-wrap gap-2')
						]),
					_List_fromArray(
						[
							$author$project$View$SettingsModal$displayRoleButtons(field),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('flex items-center gap-3')
								]),
							_List_fromArray(
								[
									$author$project$View$SettingsModal$showOnCardCheckbox(field)
								]))
						])),
					A2($author$project$View$SettingsModal$booleanDisplayConfig, dataset, field)
				]));
	});
var $author$project$View$SettingsModal$fieldList = function (dataset) {
	var total = $elm$core$List$length(dataset.af);
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex flex-col gap-2')
			]),
		A2(
			$elm$core$List$indexedMap,
			F2(
				function (i, field) {
					return A4($author$project$View$SettingsModal$fieldRow, total, i, dataset, field);
				}),
			dataset.af));
};
var $author$project$View$SettingsModal$header = A2(
	$elm$html$Html$div,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$class('flex items-center justify-between')
		]),
	_List_fromArray(
		[
			A2(
			$elm$html$Html$h2,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('text-base font-semibold text-neutral-900')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('設定')
				])),
			A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('text-sm text-neutral-400 hover:text-neutral-700'),
					$elm$html$Html$Events$onClick(
					$author$project$Types$ToggleSettingsModal(false))
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('閉じる')
				]))
		]));
var $author$project$Types$SetImageLinkField = function (a) {
	return {$: 8, a: a};
};
var $elm$html$Html$option = _VirtualDom_node('option');
var $elm$html$Html$Attributes$selected = $elm$html$Html$Attributes$boolProperty('selected');
var $author$project$View$SettingsModal$fieldOption = F2(
	function (current, field) {
		return A2(
			$elm$html$Html$option,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$value(field.ak),
					$elm$html$Html$Attributes$selected(
					_Utils_eq(
						current,
						$elm$core$Maybe$Just(field.ak)))
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(field.bb)
				]));
	});
var $elm$html$Html$select = _VirtualDom_node('select');
var $author$project$View$SettingsModal$stringToMaybe = function (s) {
	return $elm$core$String$isEmpty(s) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(s);
};
var $author$project$View$SettingsModal$linkFieldSelector = F4(
	function (labelText, fields, current, toMsg) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('flex items-center gap-2 text-sm')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('w-28 shrink-0 text-neutral-600')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(labelText)
						])),
					A2(
					$elm$html$Html$select,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class($author$project$View$SettingsModal$inputClasses),
							$elm$html$Html$Events$onInput(
							function (s) {
								return $author$project$Types$FieldSettingsMsg(
									toMsg(
										$author$project$View$SettingsModal$stringToMaybe(s)));
							})
						]),
					A2(
						$elm$core$List$cons,
						A2(
							$elm$html$Html$option,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$value(''),
									$elm$html$Html$Attributes$selected(
									_Utils_eq(current, $elm$core$Maybe$Nothing))
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('なし')
								])),
						A2(
							$elm$core$List$cons,
							A2(
								$elm$html$Html$option,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$value('__detail__'),
										$elm$html$Html$Attributes$selected(
										_Utils_eq(
											current,
											$elm$core$Maybe$Just('__detail__')))
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('詳細表示')
									])),
							A2(
								$elm$core$List$map,
								$author$project$View$SettingsModal$fieldOption(current),
								fields))))
				]));
	});
var $author$project$View$SettingsModal$imageLinkSelector = function (dataset) {
	return A4($author$project$View$SettingsModal$linkFieldSelector, '画像クリック時', dataset.af, dataset.a4, $author$project$Types$SetImageLinkField);
};
var $author$project$Types$SetTitleLinkField = function (a) {
	return {$: 9, a: a};
};
var $author$project$View$SettingsModal$titleLinkSelector = function (dataset) {
	return A4($author$project$View$SettingsModal$linkFieldSelector, 'タイトルクリック時', dataset.af, dataset.by, $author$project$Types$SetTitleLinkField);
};
var $author$project$View$SettingsModal$linkFieldSection = function (dataset) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex flex-col gap-2 border-t border-neutral-100 pt-4')
			]),
		_List_fromArray(
			[
				$author$project$View$SettingsModal$sectionTitle('リンク先フィールド'),
				$author$project$View$SettingsModal$imageLinkSelector(dataset),
				$author$project$View$SettingsModal$titleLinkSelector(dataset)
			]));
};
var $author$project$View$SettingsModal$overlay = function (dataset) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('fixed inset-0 flex items-center justify-center z-50')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('absolute inset-0 bg-black/30'),
						$elm$html$Html$Events$onClick(
						$author$project$Types$ToggleSettingsModal(false))
					]),
				_List_Nil),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('relative bg-white rounded-md shadow-lg w-[36rem] max-h-[80vh] overflow-y-auto p-5 flex flex-col gap-4 z-10')
					]),
				_List_fromArray(
					[
						$author$project$View$SettingsModal$header,
						$author$project$View$SettingsModal$fieldList(dataset),
						$author$project$View$SettingsModal$linkFieldSection(dataset),
						$author$project$View$SettingsModal$cardDisplaySection(dataset)
					]))
			]));
};
var $author$project$View$SettingsModal$view = function (model) {
	return model.bp ? $author$project$View$SettingsModal$overlay(model.m) : $elm$html$Html$text('');
};
var $author$project$View$Sidebar$fileButtonClasses = 'flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border border-neutral-200 bg-white' + ' text-neutral-700 hover:bg-neutral-100 shadow-xs transition cursor-pointer';
var $author$project$View$Sidebar$folderIcon = A2(
	$elm$svg$Svg$svg,
	_List_fromArray(
		[
			$elm$svg$Svg$Attributes$class('w-3.5 h-3.5 text-neutral-400 shrink-0'),
			$elm$svg$Svg$Attributes$viewBox('0 0 24 24'),
			$elm$svg$Svg$Attributes$fill('none'),
			$elm$svg$Svg$Attributes$stroke('currentColor'),
			$elm$svg$Svg$Attributes$strokeWidth('2'),
			$elm$svg$Svg$Attributes$strokeLinecap('round'),
			$elm$svg$Svg$Attributes$strokeLinejoin('round')
		]),
	_List_fromArray(
		[
			A2(
			$elm$svg$Svg$path,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$d('M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z')
				]),
			_List_Nil)
		]));
var $author$project$View$Sidebar$fileButton = A2(
	$elm$html$Html$button,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$class($author$project$View$Sidebar$fileButtonClasses),
			$elm$html$Html$Events$onClick(
			$author$project$Types$FileFlowMsg(
				$author$project$Types$ToggleModal(true)))
		]),
	_List_fromArray(
		[
			$author$project$View$Sidebar$folderIcon,
			$elm$html$Html$text('ファイル')
		]));
var $author$project$View$Sidebar$cogIcon = A2(
	$elm$svg$Svg$svg,
	_List_fromArray(
		[
			$elm$svg$Svg$Attributes$class('w-3.5 h-3.5 text-neutral-400 shrink-0'),
			$elm$svg$Svg$Attributes$viewBox('0 0 24 24'),
			$elm$svg$Svg$Attributes$fill('none'),
			$elm$svg$Svg$Attributes$stroke('currentColor'),
			$elm$svg$Svg$Attributes$strokeWidth('2'),
			$elm$svg$Svg$Attributes$strokeLinecap('round'),
			$elm$svg$Svg$Attributes$strokeLinejoin('round')
		]),
	_List_fromArray(
		[
			A2(
			$elm$svg$Svg$path,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$d('M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z')
				]),
			_List_Nil),
			A2(
			$elm$svg$Svg$path,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$d('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z')
				]),
			_List_Nil)
		]));
var $author$project$View$Sidebar$settingsButton = A2(
	$elm$html$Html$button,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$class('flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 shadow-xs transition cursor-pointer'),
			$elm$html$Html$Events$onClick(
			$author$project$Types$ToggleSettingsModal(true))
		]),
	_List_fromArray(
		[
			$author$project$View$Sidebar$cogIcon,
			$elm$html$Html$text('項目設定')
		]));
var $author$project$View$Sidebar$actionRow = A2(
	$elm$html$Html$div,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$class('grid grid-cols-2 gap-2')
		]),
	_List_fromArray(
		[$author$project$View$Sidebar$fileButton, $author$project$View$Sidebar$settingsButton]));
var $author$project$Types$SetCardSize = function (a) {
	return {$: 0, a: a};
};
var $author$project$View$Sidebar$sizeTab = F3(
	function (current, target, label) {
		var isActive = _Utils_eq(current, target);
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(
					isActive ? 'py-1.5 rounded-md bg-white text-neutral-900 font-semibold shadow-xs transition text-center cursor-default' : 'py-1.5 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50 transition text-center cursor-pointer'),
					$elm$html$Html$Events$onClick(
					$author$project$Types$SetCardSize(target)),
					$elm$html$Html$Attributes$title('表示サイズ: ' + label)
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(label)
				]));
	});
var $author$project$View$Sidebar$cardSizeSegment = function (current) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('grid grid-cols-3 p-1 bg-neutral-200/70 rounded-lg text-xs font-medium gap-1')
			]),
		_List_fromArray(
			[
				A3($author$project$View$Sidebar$sizeTab, current, 0, '画像'),
				A3($author$project$View$Sidebar$sizeTab, current, 1, 'タイトル'),
				A3($author$project$View$Sidebar$sizeTab, current, 2, '詳細')
			]));
};
var $author$project$Types$FilterMsg = function (a) {
	return {$: 11, a: a};
};
var $author$project$Types$ToggleCollapsed = function (a) {
	return {$: 3, a: a};
};
var $author$project$View$FilterPanel$collapseIndicator = F2(
	function (field, ui) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('text-neutral-400 text-xs px-1'),
					$elm$html$Html$Events$onClick(
					$author$project$Types$FilterMsg(
						$author$project$Types$ToggleCollapsed(field.ak)))
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(
					ui.aM ? '▸' : '▾')
				]));
	});
var $author$project$Types$MoveDown = function (a) {
	return {$: 6, a: a};
};
var $author$project$Types$MoveUp = function (a) {
	return {$: 5, a: a};
};
var $author$project$View$FilterPanel$moveButtonClasses = function (enabled) {
	return enabled ? 'px-1.5 py-0.5 text-xs rounded border border-neutral-200 text-neutral-500 hover:bg-neutral-100' : 'px-1.5 py-0.5 text-xs rounded border border-neutral-100 text-neutral-300 cursor-not-allowed';
};
var $author$project$View$FilterPanel$moveButton = F4(
	function (key, toMsg, enabled, label_) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(
					$author$project$View$FilterPanel$moveButtonClasses(enabled)),
					$elm$html$Html$Events$onClick(
					toMsg(key)),
					$elm$html$Html$Attributes$disabled(!enabled)
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(label_)
				]));
	});
var $author$project$View$FilterPanel$moveFilterButtons = F3(
	function (field, index, total) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('flex gap-0.5')
				]),
			_List_fromArray(
				[
					A4(
					$author$project$View$FilterPanel$moveButton,
					field.ak,
					function (key) {
						return $author$project$Types$FilterMsg(
							$author$project$Types$MoveUp(key));
					},
					index > 0,
					'↑'),
					A4(
					$author$project$View$FilterPanel$moveButton,
					field.ak,
					function (key) {
						return $author$project$Types$FilterMsg(
							$author$project$Types$MoveDown(key));
					},
					_Utils_cmp(index, total - 1) < 0,
					'↓')
				]));
	});
var $author$project$Types$ToggleRelationPopup = function (a) {
	return {$: 4, a: a};
};
var $author$project$View$FilterPanel$betweenRelationLabel = function (relation) {
	switch (relation) {
		case 0:
			return 'AND';
		case 1:
			return 'OR';
		default:
			return 'NOT';
	}
};
var $author$project$View$FilterPanel$relationBadgeClasses = 'shrink-0 px-2 py-0.5 text-xs rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-100';
var $author$project$Types$SetBetweenRelation = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $author$project$Types$SetWithinRelation = F2(
	function (a, b) {
		return {$: 2, a: a, b: b};
	});
var $author$project$View$FilterPanel$popupClasses = 'absolute z-50 top-full right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-md flex flex-col p-1 gap-0.5 min-w-[8rem]';
var $author$project$View$FilterPanel$popupOptionClasses = function (isActive) {
	return isActive ? 'flex-1 px-2 py-1 text-xs rounded bg-neutral-900 text-white' : 'flex-1 px-2 py-1 text-xs rounded text-neutral-600 hover:bg-neutral-100';
};
var $author$project$View$FilterPanel$popupOption = F3(
	function (isActive, msg, label_) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(
					$author$project$View$FilterPanel$popupOptionClasses(isActive)),
					$elm$html$Html$Events$onClick(msg)
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(label_)
				]));
	});
var $author$project$View$FilterPanel$popupOptionRowClasses = 'flex gap-0.5 px-1 pb-1';
var $author$project$View$FilterPanel$popupSectionLabel = function (labelText) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('text-[11px] text-neutral-400 px-1 pt-1')
			]),
		_List_fromArray(
			[
				$elm$html$Html$text(labelText)
			]));
};
var $author$project$View$FilterPanel$relationPopup = F2(
	function (field, ui) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class($author$project$View$FilterPanel$popupClasses)
				]),
			_List_fromArray(
				[
					$author$project$View$FilterPanel$popupSectionLabel('他のフィルターとの関係'),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class($author$project$View$FilterPanel$popupOptionRowClasses)
						]),
					_List_fromArray(
						[
							A3(
							$author$project$View$FilterPanel$popupOption,
							!ui.S,
							$author$project$Types$FilterMsg(
								A2($author$project$Types$SetBetweenRelation, field.ak, 0)),
							'AND'),
							A3(
							$author$project$View$FilterPanel$popupOption,
							ui.S === 1,
							$author$project$Types$FilterMsg(
								A2($author$project$Types$SetBetweenRelation, field.ak, 1)),
							'OR'),
							A3(
							$author$project$View$FilterPanel$popupOption,
							ui.S === 2,
							$author$project$Types$FilterMsg(
								A2($author$project$Types$SetBetweenRelation, field.ak, 2)),
							'NOT')
						])),
					$author$project$View$FilterPanel$popupSectionLabel('選択肢同士の関係'),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class($author$project$View$FilterPanel$popupOptionRowClasses)
						]),
					_List_fromArray(
						[
							A3(
							$author$project$View$FilterPanel$popupOption,
							!ui.aC,
							$author$project$Types$FilterMsg(
								A2($author$project$Types$SetWithinRelation, field.ak, 0)),
							'AND'),
							A3(
							$author$project$View$FilterPanel$popupOption,
							ui.aC === 1,
							$author$project$Types$FilterMsg(
								A2($author$project$Types$SetWithinRelation, field.ak, 1)),
							'OR')
						]))
				]));
	});
var $author$project$View$FilterPanel$relationPopupTrigger = F2(
	function (field, ui) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('relative')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class($author$project$View$FilterPanel$relationBadgeClasses),
							$elm$html$Html$Events$onClick(
							$author$project$Types$FilterMsg(
								$author$project$Types$ToggleRelationPopup(field.ak)))
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							$author$project$View$FilterPanel$betweenRelationLabel(ui.S))
						])),
					ui.bl ? A2(
					$elm$html$Html$div,
					_List_Nil,
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('fixed inset-0 bg-black/15 z-40'),
									$elm$html$Html$Events$onClick(
									$author$project$Types$FilterMsg(
										$author$project$Types$ToggleRelationPopup(field.ak)))
								]),
							_List_Nil),
							A2($author$project$View$FilterPanel$relationPopup, field, ui)
						])) : $elm$html$Html$text('')
				]));
	});
var $author$project$View$FilterPanel$filterHeader = F4(
	function (field, ui, index, total) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('relative flex items-center gap-1 px-2 py-1.5')
				]),
			_List_fromArray(
				[
					A3($author$project$View$FilterPanel$moveFilterButtons, field, index, total),
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('flex-1 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded px-1'),
							$elm$html$Html$Events$onClick(
							$author$project$Types$FilterMsg(
								$author$project$Types$ToggleCollapsed(field.ak)))
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(field.bb)
						])),
					A2($author$project$View$FilterPanel$relationPopupTrigger, field, ui),
					A2($author$project$View$FilterPanel$collapseIndicator, field, ui)
				]));
	});
var $author$project$View$FilterPanel$formatBoolOption = F2(
	function (field, option) {
		return (option.M === 'true') ? _Utils_update(
			option,
			{
				bb: A2($elm$core$Maybe$withDefault, 'はい', field.bB)
			}) : ((option.M === 'false') ? _Utils_update(
			option,
			{
				bb: A2($elm$core$Maybe$withDefault, 'いいえ', field.aX)
			}) : option);
	});
var $author$project$Filter$increment = function (maybeCount) {
	return $elm$core$Maybe$Just(
		A2($elm$core$Maybe$withDefault, 0, maybeCount) + 1);
};
var $author$project$Filter$countBy = F2(
	function (toKey, list) {
		return A3(
			$elm$core$List$foldl,
			F2(
				function (x, acc) {
					return A3(
						$elm$core$Dict$update,
						toKey(x),
						$author$project$Filter$increment,
						acc);
				}),
			$elm$core$Dict$empty,
			list);
	});
var $author$project$Filter$isBooleanValue = function (value) {
	if (value.$ === 2) {
		return true;
	} else {
		return false;
	}
};
var $author$project$Filter$fieldIsBoolean = F2(
	function (items, key) {
		return A2(
			$elm$core$List$any,
			$author$project$Filter$isBooleanValue,
			A2(
				$elm$core$List$filterMap,
				function (item) {
					return A2($elm$core$Dict$get, key, item.aA);
				},
				items));
	});
var $author$project$Filter$optionLabel = F3(
	function (field, isBoolean, value) {
		return isBoolean ? ((value === 'true') ? A2($elm$core$Maybe$withDefault, 'はい', field.bB) : ((value === 'false') ? A2($elm$core$Maybe$withDefault, 'いいえ', field.aX) : value)) : value;
	});
var $author$project$Filter$passesFiltersExcept = F4(
	function (filterUiDict, dataset, exceptFieldKey, item) {
		var matches = function (_v2) {
			var field = _v2.a;
			var ui = _v2.b;
			return A3($author$project$Filter$itemMatchesFilter, field, ui, item);
		};
		var active = A2(
			$elm$core$List$filter,
			function (_v1) {
				var ui = _v1.b;
				return !$elm$core$Set$isEmpty(ui.l);
			},
			A2(
				$elm$core$List$map,
				function (field) {
					return _Utils_Tuple2(
						field,
						A2($author$project$Filter$filterUiFor, field.ak, filterUiDict));
				},
				A2(
					$elm$core$List$filter,
					function (field) {
						return !_Utils_eq(field.ak, exceptFieldKey);
					},
					A2(
						$elm$core$List$filter,
						function ($) {
							return $.a0;
						},
						dataset.af))));
		var inGroup = function (relation) {
			return A2(
				$elm$core$List$filter,
				function (_v0) {
					var ui = _v0.b;
					return _Utils_eq(ui.S, relation);
				},
				active);
		};
		return A2(
			$elm$core$List$all,
			matches,
			inGroup(0)) && (($elm$core$List$isEmpty(
			inGroup(1)) || A2(
			$elm$core$List$any,
			matches,
			inGroup(1))) && A2(
			$elm$core$List$all,
			A2($elm$core$Basics$composeR, matches, $elm$core$Basics$not),
			inGroup(2)));
	});
var $elm$core$List$sortBy = _List_sortBy;
var $elm$core$List$sortWith = _List_sortWith;
var $author$project$Filter$sortFilterOptions = F2(
	function (isBoolean, options) {
		return isBoolean ? A2(
			$elm$core$List$sortWith,
			F2(
				function (a, b) {
					var _v0 = _Utils_Tuple2(a.M, b.M);
					_v0$2:
					while (true) {
						switch (_v0.a) {
							case 'true':
								if (_v0.b === 'false') {
									return 0;
								} else {
									break _v0$2;
								}
							case 'false':
								if (_v0.b === 'true') {
									return 2;
								} else {
									break _v0$2;
								}
							default:
								break _v0$2;
						}
					}
					return 1;
				}),
			options) : A2(
			$elm$core$List$sortBy,
			function (opt) {
				return -opt.N;
			},
			options);
	});
var $author$project$Filter$optionsForWithActiveFilters = F4(
	function (searchState, filterUiDict, dataset, field) {
		var searchedItems = A2($author$project$Search$searchResults, searchState, dataset);
		var isBoolean = A2($author$project$Filter$fieldIsBoolean, searchedItems, field.ak) || field.a9;
		var filteredItems = A2(
			$elm$core$List$filter,
			A3($author$project$Filter$passesFiltersExcept, filterUiDict, dataset, field.ak),
			searchedItems);
		var filteredCounts = A2(
			$author$project$Filter$countBy,
			$elm$core$Basics$identity,
			A2(
				$elm$core$List$concatMap,
				$author$project$Filter$optionKeysOfItem(field.ak),
				filteredItems));
		var allOptionsDict = $elm$core$Dict$fromList(
			A2(
				$elm$core$List$map,
				function (val) {
					return _Utils_Tuple2(val, 0);
				},
				A2(
					$elm$core$List$concatMap,
					$author$project$Filter$optionKeysOfItem(field.ak),
					searchedItems)));
		var mergedCounts = A6(
			$elm$core$Dict$merge,
			F3(
				function (k, v, acc) {
					return A3($elm$core$Dict$insert, k, v, acc);
				}),
			F4(
				function (k, _v1, vFiltered, acc) {
					return A3($elm$core$Dict$insert, k, vFiltered, acc);
				}),
			F3(
				function (k, vFiltered, acc) {
					return A3($elm$core$Dict$insert, k, vFiltered, acc);
				}),
			allOptionsDict,
			filteredCounts,
			$elm$core$Dict$empty);
		return A2(
			$author$project$Filter$sortFilterOptions,
			isBoolean,
			A2(
				$elm$core$List$map,
				function (_v0) {
					var value = _v0.a;
					var count = _v0.b;
					return {
						N: count,
						bb: A3($author$project$Filter$optionLabel, field, isBoolean, value),
						M: value
					};
				},
				$elm$core$Dict$toList(mergedCounts)));
	});
var $author$project$View$FilterPanel$sortBoolOptions = function (options) {
	return A2(
		$elm$core$List$sortWith,
		F2(
			function (a, b) {
				var _v0 = _Utils_Tuple2(a.M, b.M);
				_v0$2:
				while (true) {
					switch (_v0.a) {
						case 'true':
							if (_v0.b === 'false') {
								return 0;
							} else {
								break _v0$2;
							}
						case 'false':
							if (_v0.b === 'true') {
								return 2;
							} else {
								break _v0$2;
							}
						default:
							break _v0$2;
					}
				}
				return 1;
			}),
		options);
};
var $author$project$View$FilterPanel$getFormattedOptions = F3(
	function (model, dataset, field) {
		var rawOptions = A4($author$project$Filter$optionsForWithActiveFilters, model.bo, model.a$, dataset, field);
		return field.a9 ? $author$project$View$FilterPanel$sortBoolOptions(
			A2(
				$elm$core$List$map,
				$author$project$View$FilterPanel$formatBoolOption(field),
				rawOptions)) : rawOptions;
	});
var $author$project$Types$ToggleOption = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $author$project$View$FilterPanel$optionRow = F3(
	function (field, ui, option) {
		return A2(
			$elm$html$Html$label,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('flex items-center gap-2 text-sm text-neutral-700')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$input,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$type_('checkbox'),
							$elm$html$Html$Attributes$checked(
							A2($elm$core$Set$member, option.M, ui.l)),
							$elm$html$Html$Events$onClick(
							$author$project$Types$FilterMsg(
								A2($author$project$Types$ToggleOption, field.ak, option.M)))
						]),
					_List_Nil),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('flex-1')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(option.bb)
						])),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('text-neutral-400 text-xs')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							'(' + ($elm$core$String$fromInt(option.N) + ')'))
						]))
				]));
	});
var $author$project$View$FilterPanel$optionListWithActiveFilters = F4(
	function (model, dataset, field, ui) {
		var allOptions = A3($author$project$View$FilterPanel$getFormattedOptions, model, dataset, field);
		var displayedOptions = ui.aM ? A2(
			$elm$core$List$filter,
			function (opt) {
				return A2($elm$core$Set$member, opt.M, ui.l);
			},
			allOptions) : allOptions;
		return $elm$core$List$isEmpty(displayedOptions) ? $elm$html$Html$text('') : A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(
					ui.aM ? 'px-2 pb-2 flex flex-col gap-1 border-t border-neutral-100 pt-2 bg-neutral-50/60' : 'px-2 pb-2 flex flex-col gap-1 border-t border-neutral-100 pt-2')
				]),
			A2(
				$elm$core$List$map,
				A2($author$project$View$FilterPanel$optionRow, field, ui),
				displayedOptions));
	});
var $author$project$View$FilterPanel$filterBlock = F5(
	function (model, dataset, index, total, field) {
		var ui = A2($author$project$Filter$filterUiFor, field.ak, model.a$);
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('border border-neutral-200 rounded-md bg-white')
				]),
			_List_fromArray(
				[
					A4($author$project$View$FilterPanel$filterHeader, field, ui, index, total),
					A4($author$project$View$FilterPanel$optionListWithActiveFilters, model, dataset, field, ui)
				]));
	});
var $author$project$View$FilterPanel$view = F2(
	function (model, dataset) {
		var orderedFields = $author$project$Filter$orderedFilterableFields(dataset);
		var total = $elm$core$List$length(orderedFields);
		return $elm$core$List$isEmpty(orderedFields) ? A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('text-sm text-neutral-400')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('')
				])) : A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('flex flex-col gap-2')
				]),
			A2(
				$elm$core$List$indexedMap,
				F2(
					function (i, field) {
						return A5($author$project$View$FilterPanel$filterBlock, model, dataset, i, total, field);
					}),
				orderedFields));
	});
var $author$project$View$Sidebar$filterArea = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex-1 overflow-y-auto flex flex-col gap-2 min-h-0')
			]),
		_List_fromArray(
			[
				A2($author$project$View$FilterPanel$view, model, model.m)
			]));
};
var $author$project$Types$ClearAllFilters = {$: 7};
var $author$project$Types$ToggleFilterSelectDropdown = function (a) {
	return {$: 3, a: a};
};
var $author$project$Types$SetFilterable = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $author$project$View$Sidebar$filterFieldCheckbox = function (field) {
	return A2(
		$elm$html$Html$label,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex items-center gap-2 px-2 py-1 hover:bg-neutral-50 rounded cursor-pointer text-xs text-neutral-700')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$input,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$type_('checkbox'),
						$elm$html$Html$Attributes$class('w-3.5 h-3.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400'),
						$elm$html$Html$Attributes$checked(field.a0),
						$elm$html$Html$Events$onClick(
						$author$project$Types$FieldSettingsMsg(
							A2($author$project$Types$SetFilterable, field.ak, !field.a0)))
					]),
				_List_Nil),
				A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('truncate')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(field.bb)
					]))
			]));
};
var $author$project$View$Sidebar$filterSelectDropdown = function (model) {
	return (!model.a_) ? $elm$html$Html$text('') : A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex flex-col')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('fixed inset-0 z-30'),
						$elm$html$Html$Events$onClick(
						$author$project$Types$ToggleFilterSelectDropdown(false))
					]),
				_List_Nil),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('relative z-40 bg-white border border-neutral-300 rounded-lg shadow-md p-2 flex flex-col gap-1 max-h-56 overflow-y-auto')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('text-[11px] font-semibold text-neutral-400 px-2 py-0.5 border-b border-neutral-100 mb-1')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('表示するフィルターを選択')
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('flex flex-col gap-0.5')
							]),
						A2($elm$core$List$map, $author$project$View$Sidebar$filterFieldCheckbox, model.m.af))
					]))
			]));
};
var $author$project$View$Sidebar$filterSectionHeader = function (model) {
	var hasActiveFilters = A2($author$project$Filter$isFilterActive, model.a$, model.m);
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex flex-col gap-2 border-t border-neutral-200 pt-3 -mx-4 px-4 relative')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('flex items-center justify-between')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('text-xs font-semibold text-neutral-500 uppercase tracking-wider')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('フィルター')
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('flex items-center gap-1.5')
							]),
						_List_fromArray(
							[
								hasActiveFilters ? A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('px-1.5 py-0.5 text-xs text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer'),
										$elm$html$Html$Events$onClick(
										$author$project$Types$FilterMsg($author$project$Types$ClearAllFilters)),
										$elm$html$Html$Attributes$title('選択中のフィルターをすべて解除')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('すべて解除')
									])) : $elm$html$Html$text(''),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class(
										model.a_ ? 'px-2 py-0.5 text-xs rounded border border-neutral-300 bg-neutral-200 text-neutral-800 font-medium shadow-sm transition' : 'px-2 py-0.5 text-xs rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 shadow-sm transition'),
										$elm$html$Html$Events$onClick(
										$author$project$Types$ToggleFilterSelectDropdown(!model.a_))
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(
										model.a_ ? '✕ 閉じる' : '+ 項目選択')
									]))
							]))
					])),
				$author$project$View$Sidebar$filterSelectDropdown(model)
			]));
};
var $elm$html$Html$h1 = _VirtualDom_node('h1');
var $author$project$View$Sidebar$appTitle = function (model) {
	return A2(
		$elm$html$Html$h1,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('text-lg font-title font-semibold text-neutral-900 truncate text-center px-8 w-full')
			]),
		_List_fromArray(
			[
				$elm$html$Html$text(model.m.bd)
			]));
};
var $author$project$Types$UndoRequested = {$: 4};
var $author$project$History$canUndo = function (model) {
	return !$elm$core$List$isEmpty(model.z);
};
var $author$project$View$Sidebar$undoButtonClasses = function (enabled) {
	return enabled ? 'p-1.5 rounded border border-neutral-200 text-neutral-700 hover:bg-neutral-100 shrink-0 flex items-center justify-center' : 'p-1.5 rounded border border-neutral-200 text-neutral-300 cursor-not-allowed shrink-0 flex items-center justify-center';
};
var $author$project$View$Sidebar$undoIcon = A2(
	$elm$svg$Svg$svg,
	_List_fromArray(
		[
			$elm$svg$Svg$Attributes$class('w-4 h-4 mx-auto fill-current'),
			$elm$svg$Svg$Attributes$viewBox('0 0 24 24')
		]),
	_List_fromArray(
		[
			A2(
			$elm$svg$Svg$path,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$d('M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z')
				]),
			_List_Nil)
		]));
var $author$project$View$Sidebar$undoButton = function (model) {
	return A2(
		$elm$html$Html$button,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class(
				$author$project$View$Sidebar$undoButtonClasses(
					$author$project$History$canUndo(model))),
				$elm$html$Html$Events$onClick($author$project$Types$UndoRequested),
				$elm$html$Html$Attributes$disabled(
				!$author$project$History$canUndo(model)),
				$elm$html$Html$Attributes$title('Undo')
			]),
		_List_fromArray(
			[$author$project$View$Sidebar$undoIcon]));
};
var $author$project$View$Sidebar$headerRow = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('relative flex items-center justify-center min-h-[32px]')
			]),
		_List_fromArray(
			[
				$author$project$View$Sidebar$appTitle(model),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('absolute right-0')
					]),
				_List_fromArray(
					[
						$author$project$View$Sidebar$undoButton(model)
					]))
			]));
};
var $author$project$Types$SearchMsg = function (a) {
	return {$: 14, a: a};
};
var $author$project$Types$ToggleSearchField = function (a) {
	return {$: 2, a: a};
};
var $author$project$View$Sidebar$searchFieldCheckbox = F2(
	function (field, selectedFields) {
		var labelClasses = 'text-sm text-neutral-700';
		var isChecked = A2($elm$core$Set$member, field.ak, selectedFields);
		return A2(
			$elm$html$Html$label,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('flex items-center gap-2 cursor-pointer')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$input,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400'),
							$elm$html$Html$Attributes$type_('checkbox'),
							$elm$html$Html$Attributes$checked(isChecked),
							$elm$html$Html$Events$onInput(
							function (_v0) {
								return $author$project$Types$SearchMsg(
									$author$project$Types$ToggleSearchField(field.ak));
							})
						]),
					_List_Nil),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class(labelClasses)
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(field.bb)
						]))
				]));
	});
var $author$project$Search$searchableFields = function (dataset) {
	return dataset.af;
};
var $author$project$View$Sidebar$searchFieldCheckboxes = F2(
	function (searchState, dataset) {
		var _v0 = searchState.al;
		if (!_v0.$) {
			return A2($elm$html$Html$div, _List_Nil, _List_Nil);
		} else {
			var selectedFields = _v0.a;
			var searchableFields = $author$project$Search$searchableFields(dataset);
			return $elm$core$List$isEmpty(searchableFields) ? A2($elm$html$Html$div, _List_Nil, _List_Nil) : A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('space-y-1 bg-white rounded border border-neutral-200 p-2')
					]),
				A2(
					$elm$core$List$map,
					function (field) {
						return A2($author$project$View$Sidebar$searchFieldCheckbox, field, selectedFields);
					},
					searchableFields));
		}
	});
var $author$project$Types$SetQuery = function (a) {
	return {$: 0, a: a};
};
var $author$project$View$Sidebar$searchInput = function (searchState) {
	var inputClasses = 'w-full px-2 py-1 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-2 focus:ring-neutral-400';
	return A2(
		$elm$html$Html$input,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class(inputClasses),
				$elm$html$Html$Attributes$type_('text'),
				$elm$html$Html$Attributes$placeholder('検索ワード'),
				$elm$html$Html$Attributes$value(searchState.bj),
				$elm$html$Html$Events$onInput(
				function (q) {
					return $author$project$Types$SearchMsg(
						$author$project$Types$SetQuery(q));
				})
			]),
		_List_Nil);
};
var $author$project$Types$ToggleSearchMode = {$: 1};
var $author$project$View$Sidebar$searchModeButtons = function (searchState) {
	var isSearchAll = function () {
		var _v0 = searchState.al;
		if (!_v0.$) {
			return true;
		} else {
			return false;
		}
	}();
	var buttonClasses = function (isActive) {
		return isActive ? 'flex-1 px-2 py-1 text-xs rounded bg-neutral-900 text-white' : 'flex-1 px-2 py-1 text-xs rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-100';
	};
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex gap-1')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$button,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class(
						buttonClasses(isSearchAll)),
						$elm$html$Html$Events$onClick(
						$author$project$Types$SearchMsg($author$project$Types$ToggleSearchMode))
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('すべて')
					])),
				A2(
				$elm$html$Html$button,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class(
						buttonClasses(!isSearchAll)),
						$elm$html$Html$Events$onClick(
						$author$project$Types$SearchMsg($author$project$Types$ToggleSearchMode))
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('フィールド指定')
					]))
			]));
};
var $author$project$View$Sidebar$searchArea = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('border-t border-neutral-200 pt-2 -mx-4 px-4 space-y-2')
			]),
		_List_fromArray(
			[
				$author$project$View$Sidebar$searchInput(model.bo),
				$author$project$View$Sidebar$searchModeButtons(model.bo),
				A2($author$project$View$Sidebar$searchFieldCheckboxes, model.bo, model.m)
			]));
};
var $author$project$View$Sidebar$sidebarClasses = 'w-72 shrink-0 h-screen overflow-y-auto border-r border-neutral-200 bg-neutral-50 px-4 py-5 flex flex-col gap-3.5';
var $author$project$View$Sidebar$view = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class($author$project$View$Sidebar$sidebarClasses)
			]),
		_List_fromArray(
			[
				$author$project$View$Sidebar$headerRow(model),
				$author$project$View$Sidebar$cardSizeSegment(model.aK),
				$author$project$View$Sidebar$actionRow,
				$author$project$View$Sidebar$searchArea(model),
				$author$project$View$Sidebar$filterSectionHeader(model),
				$author$project$View$Sidebar$filterArea(model)
			]));
};
var $author$project$View$view = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex')
			]),
		_List_fromArray(
			[
				$author$project$View$Sidebar$view(model),
				$author$project$View$mainArea(model),
				$author$project$View$FileModal$view(model),
				$author$project$View$SettingsModal$view(model),
				$author$project$View$EditModal$view(model),
				$author$project$View$DetailModal$view(model),
				$author$project$View$sortModal(model),
				$author$project$View$actionButtonGroup(model),
				$author$project$View$scrollToTopButton
			]));
};
var $author$project$Main$main = $elm$browser$Browser$element(
	{a7: $author$project$Main$init, bv: $author$project$Main$subscriptions, bC: $author$project$Update$update, bD: $author$project$View$view});
_Platform_export({'Main':{'init':$author$project$Main$main($elm$json$Json$Decode$value)(0)}});}(this));