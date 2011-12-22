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
 * jQuery的selector上的一些QWrap的selector没有的方法
 */

//jQuery的命名实在是。。。很奇怪。。。
jQuery.expr = QW.Selector;
jQuery.expr[":"] = jQuery.expr.filters = jQuery.expr._pseudos;

//补充selector里的 :hidden， :visible
if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.extend(jQuery.expr.filters, {
		hidden: function( elem ) {
			var width = elem.offsetWidth,
				height = elem.offsetHeight;

			return (width === 0 && height === 0) || (!jQuery.support.reliableHiddenOffsets && (elem.style.display || jQuery.css( elem, "display" )) === "none");
		},
		visible : function( elem ) {
			return !jQuery.expr.filters.hidden( elem );
		},
		/*
			这里还不能用nth-child(even)，因为根据JQ的文档：
			The index-related selectors (:eq(), :lt(), :gt(), :even, :odd) 
			filter the set of elements that have matched the expressions that precede them.
			也就意味着：
			<div>
				<h3>1</h3><div>1</div><h3>2</h3><div>2</div><h3>3</h3><div>3</div>
			</div>
			$("div h3:even") 为第二个h3
			$("div h3:nth-child(even)") 为空（因为h3分别是第1、3、5、7号儿子）
			而事实上确实是这样的
		*/
		even : function(elem, match, i){
			//奇怪的是因为i从0开始，所以even的意思并不是偶数行，而是偶数下标，即奇数行
			return i%2 === 0;
		},
		
		odd : function(elem, match, i){
			return i%2 === 1;
		},
		
		eq : function(elem, match, i){
			return parseInt(match) == i;
		},

		first: function( elem, match, i) {
			return i === 0;
		},

		last: function( elem, match, i, array ) {
			return i === array.length - 1;
		},

		lt: function( elem, match, i ) {
			return i < match - 0;
		},

		gt: function( elem, match, i ) {
			return i > match - 0;
		},

		nth: function( elem, match, i ) {
			return match - 0 === i;
		}
	},{
		enabled: function( elem ) {
			return elem.disabled === false && elem.type !== "hidden";
		},

		disabled: function( elem ) {
			return elem.disabled === true;
		},

		checked: function( elem ) {
			return elem.checked === true;
		},
		
		selected: function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}
			
			return elem.selected === true;
		},

		parent: function( elem ) {
			return !!elem.firstChild;
		},

		empty: function( elem ) {
			return !elem.firstChild;
		},

		has: function( elem, match, i ) {
			//QW的match和JQ的不同，JQ的是伪类匹配正则结果的数组，而QW的只是match伪类括号里面的内容
			return !!$( match, elem ).length;
		},

		header: function( elem ) {
			return (/h\d/i).test( elem.nodeName );
		},

		text: function( elem ) {
			var attr = elem.getAttribute( "type" ), type = elem.type;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc) 
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
		},

		radio: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
		},

		checkbox: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
		},

		file: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
		},

		password: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
		},

		submit: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "submit" === elem.type;
		},

		image: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
		},

		reset: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "reset" === elem.type;
		},

		button: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && "button" === elem.type || name === "button";
		},

		input: function( elem ) {
			return (/input|select|textarea|button/i).test( elem.nodeName );
		},

		focus: function( elem ) {
			return elem === elem.ownerDocument.activeElement;
		}
	});
}
})();