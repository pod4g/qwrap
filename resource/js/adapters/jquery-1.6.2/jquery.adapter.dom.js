/**
 * 这是QWrap专门为JQ写的适配。大约能兼容80%左右的功能
 * 只要写组件的时候不是用到了太BT的方法，一般就木有问题了
 * 砍掉方法里面了一些太BT的功能，JQ经常用一大堆代码实现一个很复杂而强大的功能，但是实际开发中很少需要用到
 * 按照QWrap的价值观，如果一个方法有80%以上的复杂度，只有20%的使用而且并不是不可替代的，一般砍掉这个功能
 *
 * @author akira.cn@gmail.com
 * @copyright (c) 2011 WED Team
 * @lisense http://www.qwrap.com - http://tangram.baidu.com/docs/bsd.html
 */

(function(){

/**
 * 简化版jQuery.css，省略了个extra参数
 * 话说，JQ的这个静态方法，最后一个参数木有详细说明，看不懂 =.=
 */
jQuery.css = function(elem, name){
	return QW.NodeW.css(elem, name);
};
jQuery.curCSS = jQuery.css;

//神奇的Dom特性探测，不过好复杂，不会改。。。
jQuery.support = (function() {

	var div = document.createElement( "div" ),
		documentElement = document.documentElement,
		all,
		a,
		select,
		opt,
		input,
		marginDiv,
		support,
		fragment,
		body,
		testElementParent,
		testElement,
		testElementStyle,
		tds,
		events,
		eventName,
		i,
		isSupported;

	// Preliminary tests
	div.setAttribute("className", "t");
	div.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

	all = div.getElementsByTagName( "*" );
	a = div.getElementsByTagName( "a" )[ 0 ];

	// Can't get basic test support
	if ( !all || !all.length || !a ) {
		return {};
	}

	// First batch of supports tests
	select = document.createElement( "select" );
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName( "input" )[ 0 ];

	support = {
		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: ( div.firstChild.nodeType === 3 ),

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName( "tbody" ).length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName( "link" ).length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: ( a.getAttribute( "href" ) === "/a" ),

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.55$/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Make sure that if no value is specified for a checkbox
		// that it defaults to "on".
		// (WebKit defaults to "" instead)
		checkOn: ( input.value === "on" ),

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// Will be defined later
		submitBubbles: true,
		changeBubbles: true,
		focusinBubbles: false,
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Test to see if it's possible to delete an expando from an element
	// Fails in Internet Explorer
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
		div.attachEvent( "onclick", function() {
			// Cloning a node shouldn't copy over any
			// bound event handlers (IE does this)
			support.noCloneEvent = false;
		});
		div.cloneNode( true ).fireEvent( "onclick" );
	}

	// Check if a radio maintains it's value
	// after being appended to the DOM
	input = document.createElement("input");
	input.value = "t";
	input.setAttribute("type", "radio");
	support.radioValue = input.value === "t";

	input.setAttribute("checked", "checked");
	div.appendChild( input );
	fragment = document.createDocumentFragment();
	fragment.appendChild( div.firstChild );

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	div.innerHTML = "";

	// Figure out if the W3C box model works as expected
	div.style.width = div.style.paddingLeft = "1px";

	body = document.getElementsByTagName( "body" )[ 0 ];
	// We use our own, invisible, body unless the body is already present
	// in which case we use a div (#9239)
	testElement = document.createElement( body ? "div" : "body" );
	testElementStyle = {
		visibility: "hidden",
		width: 0,
		height: 0,
		border: 0,
		margin: 0
	};
	if ( body ) {
		jQuery.extend( testElementStyle, {
			position: "absolute",
			left: -1000,
			top: -1000
		});
	}
	for ( i in testElementStyle ) {
		testElement.style[ i ] = testElementStyle[ i ];
	}
	testElement.appendChild( div );
	testElementParent = body || documentElement;
	testElementParent.insertBefore( testElement, testElementParent.firstChild );

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	support.boxModel = div.offsetWidth === 2;

	if ( "zoom" in div.style ) {
		// Check if natively block-level elements act like inline-block
		// elements when setting their display to 'inline' and giving
		// them layout
		// (IE < 8 does this)
		div.style.display = "inline";
		div.style.zoom = 1;
		support.inlineBlockNeedsLayout = ( div.offsetWidth === 2 );

		// Check if elements with layout shrink-wrap their children
		// (IE 6 does this)
		div.style.display = "";
		div.innerHTML = "<div style='width:4px;'></div>";
		support.shrinkWrapBlocks = ( div.offsetWidth !== 2 );
	}

	div.innerHTML = "<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";
	tds = div.getElementsByTagName( "td" );

	// Check if table cells still have offsetWidth/Height when they are set
	// to display:none and there are still other visible table cells in a
	// table row; if so, offsetWidth/Height are not reliable for use when
	// determining if an element has been hidden directly using
	// display:none (it is still safe to use offsets if a parent element is
	// hidden; don safety goggles and see bug #4512 for more information).
	// (only IE 8 fails this test)
	isSupported = ( tds[ 0 ].offsetHeight === 0 );

	tds[ 0 ].style.display = "";
	tds[ 1 ].style.display = "none";

	// Check if empty table cells still have offsetWidth/Height
	// (IE < 8 fail this test)
	support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );
	div.innerHTML = "";

	// Check if div with explicit width and no margin-right incorrectly
	// gets computed margin-right based on width of container. For more
	// info see bug #3333
	// Fails in WebKit before Feb 2011 nightlies
	// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
	if ( document.defaultView && document.defaultView.getComputedStyle ) {
		marginDiv = document.createElement( "div" );
		marginDiv.style.width = "0";
		marginDiv.style.marginRight = "0";
		div.appendChild( marginDiv );
		support.reliableMarginRight =
			( parseInt( ( document.defaultView.getComputedStyle( marginDiv, null ) || { marginRight: 0 } ).marginRight, 10 ) || 0 ) === 0;
	}

	// Remove the body element we added
	testElement.innerHTML = "";
	testElementParent.removeChild( testElement );

	// Technique from Juriy Zaytsev
	// http://thinkweb2.com/projects/prototype/detecting-event-support-without-browser-sniffing/
	// We only care about the case where non-standard event systems
	// are used, namely in IE. Short-circuiting here helps us to
	// avoid an eval call (in setAttribute) which can cause CSP
	// to go haywire. See: https://developer.mozilla.org/en/Security/CSP
	if ( div.attachEvent ) {
		for( i in {
			submit: 1,
			change: 1,
			focusin: 1
		} ) {
			eventName = "on" + i;
			isSupported = ( eventName in div );
			if ( !isSupported ) {
				div.setAttribute( eventName, "return;" );
				isSupported = ( typeof div[ eventName ] === "function" );
			}
			support[ i + "Bubbles" ] = isSupported;
		}
	}

	// Null connected elements to avoid leaks in IE
	testElement = fragment = select = opt = body = marginDiv = div = input = null;

	return support;
})();

jQueryNodeH = {
	insert : function(el, sWhere, newEl){
		var newEl = $(newEl).core;
		if(jQuery.isArray(newEl)){
			for(var i = 0, len = newEl.length; i<len; i++){
				jQueryNodeH.insert(el, sWhere, newEl[i]);
			}
		}
		else{
			QW.NodeH.insert(el, sWhere, newEl);
		}
	},
	append : function(el, newEl){
		return jQueryNodeH.insert(el, "beforeend", newEl);
	},
	prepend : function(el, newEl){
		return jQueryNodeH.insert(el, "afterbegin", newEl);
	}, 
	before : function(el, newEl){
		return jQueryNodeH.insert(el, "beforebegin", newEl);
	},
	after : function(el, newEl){
		return jQueryNodeH.insert(el, "afterend", newEl);
	},
	/*
		JQ的DOM操作和QWrap的有个很大的区别就是JQ有copy元素的规则
		例如： $(el).appendTo(els);
		如果els是多个元素而el只有一个，JQ真的会把el给copy成多个
		append、prepend那些也会
		总之JQ有潜规则，这些潜规则做了很多事情，能带来方便，不过也可能产生麻烦
	 */
	appendTo : function(el, newEl){
		var newElW = $(newEl);
		if(newElW.length > 1){
			for(var i = 0; i < newElW.length; i++){
				$(newElW[i]).append(el.cloneNode(true));
			}
			return true;
		}
		return newElW.append(el);
	},
	prependTo : function(el, newEl){
		var newElW = $(newEl);
		if(newElW.length > 1){
			for(var i = 0; i < newElW.length; i++){
				$(newElW[i]).prepend(el.cloneNode(true));
			}
			return true;
		}
		return newElW.prepend(el);
	},
	insertBefore : function(el, newEl){
		var newElW = $(newEl);
		if(newElW.length > 1){
			for(var i = 0; i < newElW.length; i++){
				$(newElW[i]).before(el.cloneNode(true));
			}
			return true;
		}
		return newElW.before(el);
	},
	insertAfter : function(el, newEl){
		var newElW = $(newEl);
		if(newElW.length > 1){
			for(var i = 0; i < newElW.length; i++){
				$(newElW[i]).after(el.cloneNode(true));
			}
			return true;
		}
		return newElW.after(el);
	},
	offset : function(el){
		var xy = QW.NodeH.getXY(el);
		return {left:xy[0], top:xy[1]};
	},
	next : function(el, selector){	//下一个elem邻居
		do{
			el = QW.NodeH.nextSibling(el, selector);
		}while(el && !jQuery.isElement(el));
		
		return el;
	},
	prev : function(el, selector){	//下一个elem邻居
		do{
			el = QW.NodeH.previousSibling(el, selector);
		}while(el && !jQuery.isElement(el));
		
		return el;
	},
	//一级parentNode
	parent: QW.NodeH.parentNode,
	/**
	 * closest查找最近的祖先节点
	 * 由于QWrap的parentNode是只支持简版的selector
	 * 因此对于一些复合+组合的情况，QWrap的parentNode无法处理，只好按下面的方法来进行
	 */
	closest: function(el, selector){ 
		//这样查找效率可能不高，但是这是最方便的实现
		if(/[, >+~]/.test(QW.StringH.trim(selector))){
			var ret = [];
			//先找出所有符合条件的节点
			var nodes = $(selector).core;
			//再找出节点的全部祖先（按照从远到近排序）
			var parents = $(el).parents().core;
			
			for(var i = 0, len = parents.length; i < len; i++){
				if(QW.ArrayH.contains(nodes, parents[i]))
					return parents[i];		//找到了，返回
			}
			return [];
		}else{
			//如果是简单查询，直接用QWrap原生的
			return QW.NodeH.parentNode(el, selector) || [];
		}
		return []; //找不到
	},
	/**
	 * 找到当前el到某一级selector的全部祖先们
	 * 不支持复杂的selector
	 */
	parents:function(el, selector) {
		//如果没有selector，默认到body
		var fcheck = QW.Selector.selector2Filter(selector || 'body');
		el = QW.Dom.g(el);
		var els = [], hit = false;
		//否则查找parents直到发现匹配元素
		do {
			els.push(el.parentNode);
			el = el.parentNode;
		} while (el && !(hit = fcheck(el)));
		if(hit){
			return els;
		}
		else{ 
			return []; //如果都不匹配，返回空
		}
	},
	find : function(el, selector){
		selector = selector || "";
		return QW.NodeH.query(el, selector);  	
	},
	children : function(el, selector){
		selector = selector || "*";		//children()与find()差别是children()只返回元素节点
		return QW.NodeH.query(el, ">"+selector);  
	},
	index : function(el, selector){
		if(!selector){
			var elems = $(el).parent().children();
		}else{
			var elems = $(selector);
		}
		return jQuery.inArray(el, elems);
	},
	//JQ的addClass和removeClass支持空格分隔的classes
	addClass : function(el, className){
		var classes = className.split(/\s+/g);
		jQuery.each(classes, function(i, o){
			QW.NodeH.addClass(el, o);
		});
	},
	removeClass: function(el, className){
		var classes = className.split(/\s+/g);
		jQuery.each(classes, function(i, o){
			QW.NodeH.removeClass(el, o);
		});	
	},
	//JQ有innerText的gsetter
	text : function(el, text){
		if(text != null){
			QW.NodeH.setHtml(el, '');
			QW.NodeH.appendChild(el, document.createTextNode(text));
		}else{
			var ret = '';
			if ( el.nodeType === 3 || el.nodeType === 4 ) {
				ret += el.nodeValue;
			}else if ( el.nodeType !== 8 ) {
				for(var i = 0; i < el.childNodes.length; i++){
					ret += jQueryNodeH.text( el.childNodes[i] );
				}
			}
			return ret;
		}
	},
	remove: function(el){
		var cacheIndex = jQuery.expando + "_xdata";
		el[cacheIndex] = null;
		el.__custListeners && (el.__custListeners.length = 0);
		p = $(el).parentNode().removeChild(el);
	}
};

var jQueryNodeC = {
	insert		:   "operator",
	append		:   "operator",
	prepend		:	"operator",
	before		:	"operator",	
	after		:	"operator",
	
	appendTo		:   "operator",
	prependTo		:	"operator",
	insertBefore	:	"operator",
	insertAfter		:	"operator",
	addClass		:	"operator",
	removeClass		:	"operator",

	find		:	"queryer",
	children	:	"queryer",
	next		:	"queryer",
	prev		:	"queryer",
	parent		:	"queryer",
	closest		:	"queryer",
	parents		:	"queryer",

	offset		:	"getter_first_all",
	index		:	"getter_first",
	text		:	"getter"
};

jQuery.pluginHelper(jQueryNodeH, jQueryNodeC);

//要实现坑爹的end()方法。。。
var AllNodeC = jQuery.extend({}, jQueryNodeC, QW.NodeC.wrapMethods); //取出所有NodeC
var QueryNodeC = QW.ObjectH.filter(AllNodeC, function(o, key){ //取出所有queryer的NodeC
	return o == "queryer";
});
//注意：each不是queryer
var fns = jQuery.hook(jQuery.dump(jQuery.fn,jQuery.keys(QueryNodeC).concat(["map","not", "first", "last", "item", "filter"])), "after", function(returnValue){
	returnValue.prevObject = this;	//让所有queryer方法返回的Wrap保存当前Wrap，这样就实现了一个堆栈
	return returnValue;
});
jQuery.fn.extend(fns);

/**
 * 添加一些和QWrap不一样的Node节点方法
 */
jQuery.fn.extend({
	//JQ的end很好很强大，但是QWrap的机制很难实现之，而且虽然这个特性很强大，但也不是必须的
	//从上面的做法可以得到让QWrap也支持end的retouch办法
	//但为这个浪费代码是否值得呢？
	end: function() {
		return this.prevObject || this.constructor(null);
	},
	attr: (function(attr){
		return function(key, value){
			if(!(jQuery.isString(key))){
				for(var each in key){
					attr.call(this, each, key[each]);
				}
				return this;
			}else{
				if(value == null){
					return attr.call(this, key); //act as setter
				}else{
					return attr.call(this, key, value);
				}
			}
		}
	})(jQuery.fn.attr),
	css : (function(css){
		return function(key, value){
			if(!(jQuery.isString(key))){	//批量操作
				for(var each in key){
					css.call(this, each, key[each]);
				}
				return this;
			}else{
				if(value == null){
					return css.call(this, key);
				}
				return css.call(this, key, value);
			}
		}
	})(jQuery.fn.css),
	is : function(selector){
		return QW.Selector.filter($.g(this),selector).length > 0;
	},
	add: function(selector){
		var toAdd = $(selector);
		this.core = QW.ArrayH.union(this.core, toAdd.core);
		return this;
	}
});

// 这个是从JQ的方法改的
// Create width, height, innerHeight, innerWidth, outerHeight and outerWidth methods
jQuery.each([ "Height", "Width" ], function( i, name ) {

	var type = name.toLowerCase();

	// innerHeight and innerWidth
	// 不知道对不对，JQ原来的看不懂 =.=
	jQuery.fn[ "inner" + name ] = function() {
		var elem = this[0];
		return QW.NodeH.getStyle(elem, type);
	};

	// outerHeight and outerWidth
	// 也不知道对不对，JQ的很复杂 =.=
	jQuery.fn[ "outer" + name ] = function( margin ) {
		var elem = this[0];
		return QW.NodeH.getSize(elem)[type];
	};
	
	//用JQ原来的
	jQuery.fn[ type ] = function( size ) {
		// Get window width or height
		var elem = this[0];

		if ( jQuery.isWindow( elem ) ) {
			// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
			// 3rd condition allows Nokia support, as it supports the docElem prop but not CSS1Compat
			var docElemProp = elem.document.documentElement[ "client" + name ];
			return elem.document.compatMode === "CSS1Compat" && docElemProp ||
				elem.document.body[ "client" + name ] || docElemProp;

		// Get document width or height
		} else if ( elem.nodeType === 9 ) {
			// Either scroll[Width/Height] or offset[Width/Height], whichever is greater
			return Math.max(
				elem.documentElement["client" + name],
				elem.body["scroll" + name], elem.documentElement["scroll" + name],
				elem.body["offset" + name], elem.documentElement["offset" + name]
			);

		// Get or set width or height on the element
		} else if ( size === undefined ) {
			//JQ的智能判断visibility和overflow以及display让开发者都养成坏习惯了 =.=
			if(!this.isVisible()){
				this.show();	//如果display:none的话，先show再hide
				var orig = jQuery.css( elem, type ),
					ret = parseFloat( orig );
				this.hide();
			}else{
				var orig = jQuery.css( elem, type ),
					ret = parseFloat( orig );
			}
			return isNaN( ret ) ? orig : ret;

		// Set the width or height on the element (default to pixels if value is unitless)
		} else {
			return this.css( type, typeof size === "string" ? size : size + "px" );
		}
	};

});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}

// 这个用JQ原来的，因为看不懂。。。
// Create scrollLeft and scrollTop methods
jQuery.each( ["Left", "Top"], function( i, name ) {
	var method = "scroll" + name;

	jQuery.fn[ method ] = function( val ) {
		var elem, win;

		if ( val === undefined ) {
			elem = this[ 0 ];

			if ( !elem ) {
				return null;
			}

			win = getWindow( elem );

			// Return the scroll offset
			return win ? ("pageXOffset" in win) ? win[ i ? "pageYOffset" : "pageXOffset" ] :
				jQuery.support.boxModel && win.document.documentElement[ method ] ||
					win.document.body[ method ] :
				elem[ method ];
		}

		// Set the scroll offset
		return this.each(function() {
			win = getWindow( this );

			if ( win ) {
				win.scrollTo(
					!i ? val : jQuery( win ).scrollLeft(),
					 i ? val : jQuery( win ).scrollTop()
				);

			} else {
				this[ method ] = val;
			}
		});
	};
});

})();
