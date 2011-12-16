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
 * event相关的适配，在JQ中标准的Dom Event也可以传自定义的属性过去
 * 在QWrap看来这么做很麻烦实现起来很绕，而且大多数情况下用不着，因此QWrap对标准的Dom Event不支持自定义属性
 * 不过QWrap提供的CustEvent其实是很强大的~
 * 
 * 适配器支持bind和trigger的DOM自定义事件参数，用到jQueryH.data
 */
jQueryEventH = {
	bind: function(el, type, data, handler){
		if(jQuery.isFunction(data)){
			var tmp = handler;
			handler = data;
			data = tmp;
		}
		if(handler && data){
			handler.__realHandler = function(evt){
				var fireEventArgs = jQueryH.data(el, '__custEventData');
				jQueryH.data(el, '__custEventData', null); //用过以后及时清除
				if(data){
					QW.ObjectH.mix(evt, data);
				}
				if(fireEventArgs){
					QW.ObjectH.mix(evt, fireEventArgs);
				}
				return handler.call(el, evt);
			}
			handler = handler.__realHandler;
		}
		if((QW.Dom.isElement(el) || el.nodeType == 9 /*is document*/) && el['on' + type] !== undefined 
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
		var realHandler = function(evt){
			handler.call(el, evt);
			jQuery.EventH.unbind(realHandler);
		}
		return jQueryEventH.bind(el, type, data, realHandler);
	},
	//事件代理
	delegate: function(el, selector, types, data, handler) {

		if(jQuery.isFunction(data)){
			var tmp = handler;
			handler = data;
			data = tmp;
		}
		if(handler && data){
			handler.__realHandler = function(evt){
				var fireEventArgs = jQueryH.data(el, '__custEventData');
				jQueryH.data(el, '__custEventData', null); //用过以后及时清除
				if(data){
					QW.ObjectH.mix(evt, data);
				}
				if(fireEventArgs){
					QW.ObjectH.mix(evt, fireEventArgs);
				}
				return handler.call(el, evt);
			}
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
		if(el.__custListeners && el.__custListeners[type]){
			//如果是自定义的
			return QW.CustEventTargetH.fire(el, type, data);
		}
		else{
			if(data){
				jQueryH.data(el, '__custEventData', data);
			}
			return QW.EventTargetH.fire(el, type);
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
			if(o == "focusin") o = "focus";
			if(o == "focusout") o = "blur";
			
			//这个更无语，把on和fire混为一谈。。。
			if(handler){
				this.bind(o, handler);
			}
			else{ 
				this.trigger(o);
			}
			return this;
		}
	}
);

})();