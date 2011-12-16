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
jQuery.pluginHelper(
	{
		//一级parentNode
		parent: QW.NodeW.parentNode,
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
			}else{
				//如果是简单查询，直接用QWrap原生的
				return $(el).parent(selector);
			}
			return null; //找不到
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
		}
	}
	,"queryer"
);

//jQuery的命名实在是。。。很奇怪。。。
jQuery.expr = QW.Selector;
jQuery.expr[":"] = jQuery.expr.filters = jQuery.expr._pseudos;

//补充selector里的 :hidden， :visible
if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		var width = elem.offsetWidth,
			height = elem.offsetHeight;

		return (width === 0 && height === 0) || (!jQuery.support.reliableHiddenOffsets && (elem.style.display || jQuery.css( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}

})();