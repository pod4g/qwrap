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

//标准化DOM Event对象
jQuery.Event = function(evt, props){
	//evt = QW.EventH.standardize(evt);
	
	evt = new CustEvent(null, evt, props);

	// Events bubbling up the document may have been marked as prevented
	// by a handler lower down the tree; reflect the correct value.
	evt.isDefaultPrevented = (evt.defaultPrevented || evt.returnValue === false ||
		evt.getPreventDefault && evt.getPreventDefault()) ? function(){return true} : function(){return false};

	if(props){
		jQuery.extend(evt, props);
	}

	return evt;
}

/**
 * event相关的适配，在JQ中标准的Dom Event也可以传自定义的属性过去
 * 在QWrap看来这么做很麻烦实现起来很绕，而且大多数情况下用不着，因此QWrap对标准的Dom Event不支持自定义属性
 * 不过QWrap提供的CustEvent其实是很强大的~
 * 
 * 适配器支持bind和trigger的DOM自定义事件参数，用到jQueryH.data
 */
var jQEVT_NAMESPACE = ".__JQEVT_NAMESPACE";
jQueryEventH = {
	bind: function(el, type, data, handler){
		if(jQuery.isFunction(data)){ //handler和data顺序可以调换
			var tmp = handler;
			handler = data;
			data = tmp;
		}

		namespace = type + jQEVT_NAMESPACE;
		type = namespace.split('.')[0]; //JQ有事件命名空间的设计
		
		if(handler && namespace){
			el[namespace] = el[namespace] || [];
			el[namespace].push(handler);
		}
		
		if(handler && data){
			handler.__realHandler = (function(handler){
				return function(evt){
					var fireEventArgs = jQuery.data(el, '__custEventData');
					jQuery.data(el, '__custEventData', null); //用过以后及时清除
					if(data){
						QW.ObjectH.mix(evt, data);
					}
					if(fireEventArgs){
						QW.ObjectH.mix(evt, fireEventArgs);
					}
					return handler.call(el, evt);
				}
			})(handler);
			handler = handler.__realHandler;
		}

		if((QW.Dom.isElement(el) || el.nodeType == 9 /*is document*/) 
			&& (el['on' + type] !== undefined )
			&& (!el.__custListeners || !el.__custListeners[type])){ //事件存在并且不是自定义的
			//是dom原生事件，不支持data
			return QW.EventTargetH.on(el, type, handler);			
		}else if(handler){
			//否则是自定义事件，支持data
			QW.CustEvent.createEvents(el, type);
			return QW.CustEventTargetH.on(el, type, handler);
		}
	},
	/**
	 * JQ有实现这种只执行一次的事件
	 */
	one: function(el, type, data, handler){
		if(jQuery.isFunction(data)){ //handler和data顺序可以调换
			var tmp = handler;
			handler = data;
			data = tmp;
		}

		var realHandler = function(evt){
			handler.call(el, evt);
			jQueryEventH.unbind(el, type, realHandler);
		}
		jQueryEventH.bind(el, type, data, realHandler);
	},
	//事件代理
	delegate: function(el, selector, types, data, handler) {

		if(jQuery.isFunction(data)){
			var tmp = handler;
			handler = data;
			data = tmp;
		}
		if(handler && data){
			handler.__realHandler = (function(handler){
				return function(evt){
					var fireEventArgs = jQuery.data(el, '__custEventData');
					jQuery.data(el, '__custEventData', null); //用过以后及时清除
					if(data){
						QW.ObjectH.mix(evt, data);
					}
					if(fireEventArgs){
						QW.ObjectH.mix(evt, fireEventArgs);
					}
					return handler.call(el, evt);
				}
			})(handler);
			handler = handler.__realHandler;
		}

		types = types.split(',');
		jQuery.each(types, function(i, type){
			return QW.EventTargetH.delegate(o, selector, type, handler);
		});
		return el;
	},
	undelegate: function(el, selector, types, handler){
		types = types.split(',');
		jQuery.each(types, function(i, type){
			if(handler && handler.__realHandler){
				handler = handler.__realHandler;
			}
			return QW.EventTargetH.undelegate(o, selector, type, handler);
		});
		return el;
	},
	unbind: function(el, type, handler){
		var elNamespace = el[type + jQEVT_NAMESPACE];
		if(!handler && elNamespace){	//unbind整个名字空间
			for(var i = 0; i < elNamespace.length; i++){
				jQueryEventH.unbind(el, type, elNamespace[i]);
			}
		}
		if(handler && handler.__realHandler){
			handler = handler.__realHandler;
		}
		if(el.__custListeners && el.__custListeners[type]){
			//如果是自定义的
			return QW.CustEventTargetH.un(el, type, handler);
		}
		else{
			return QW.EventTargetH.un(el, type, handler);
		}
	},
	trigger: function(el, type, data){
		if((QW.Dom.isElement(el) || el.nodeType == 9 /*is document*/)
			&& (el['on' + type] !== undefined )
			&& (!el.__custListeners || !el.__custListeners[type])){ //事件存在并且不是自定义的
			if(data){
				jQuery.data(el, '__custEventData', data);
			}

			return QW.EventTargetH.fire(el, type);
		}
		else{
			//如果是自定义的
			if(type){
				if('target' in type && type['target'] == null){
					type['target'] = el;
				}
				type = type.type || type;
				QW.CustEvent.createEvents(el, type);
			}
			return QW.CustEventTargetH.fire(el, type, data);
		}
	}
};

jQuery.pluginHelper(jQueryEventH, 'operator');

/**
 * 很讨厌JQ有这一堆奇怪的方法 =.=
 */
QW.ArrayH.forEach(("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error").split(" "),
	function(o, i, arr){
		jQuery.fn[o] = function(handler){ 
			//focusin、focusout等价于focus和blur
			//也不知道对不对，先试试看，看看有没有坑
			//JQ蛋疼
			var data = {};

			if(o == "focusin") o = "focus";
			if(o == "focusout") o = "blur";

			if(o == "mouseenter"){
				data.withinElement = this;
				o = "mouseover";
			}
			if(o == "mouseleave"){
				data.withinElement = this;
				o = "mouseout";
			}

			//这个更无语，把on和fire混为一谈。。。
			if(handler){
				this.bind(o, data, handler);
			}
			else{ 
				this.trigger(o);
			}
			return this;
		}
	}
);

})();