/*
	Copyright (c) Baidu Youa Wed QWrap
	author: 好奇、JK
*/

(function() {
	var mix = QW.ObjectH.mix,
		dump = QW.ObjectH.dump,
		isString = QW.ObjectH.isString,
		isArray = QW.ObjectH.isArray,
		ArrayH = QW.ArrayH,
		methodize = QW.HelperH.methodize,
		rwrap = QW.HelperH.rwrap,
		hook = QW.HelperH.hook,
		NodeC = QW.NodeC,
		NodeH = QW.NodeH,
		EventTargetH = QW.EventTargetH,
		JssTargetH = QW.JssTargetH,
		DomU = QW.DomU,
		NodeW = QW.NodeW,
		AsyncH = QW.AsyncH;

	/*
	 * 用NodeH、EventTargetH、JssTargetH、ArrayH渲染NodeW
	*/

	NodeW.pluginHelper(NodeH, NodeC.wrapMethods, NodeC.gsetterMethods);
	NodeW.pluginHelper(EventTargetH, 'operator');
	NodeW.pluginHelper(JssTargetH, NodeC.wrapMethods, {
		jss: ['', 'getJss', 'setJss']
	});
	
	//filter、map、forEach
	var ah = dump(ArrayH, NodeC.arrayMethods);
	/*
		修正this，修正Wrap
	    这样和别的NodeW方法一致，否则之前那样很奇怪的
	*/
	ah = hook(ah, "before", function(args, func){
		//args[0] - array, args[1] - callback
		var core = args[0] || [], _callback = args[1];
		
		if(func == ArrayH.filter && isString(_callback)){	//让filter支持selector的伪类
			//function(el, i){return __SltPsds(el, "somevalue", i)} etc.
			_callback = QW.Selector.selector2Filter(_callback);
		}
		args[0] = core;
		args[1] = function(){
			return _callback.apply(arguments[0], arguments);
		}
	});
	ah = methodize(ah);
	ah = rwrap(ah, NodeW, NodeC.wrapMethods);
	mix(NodeW.prototype, ah); //ArrayH的某些方法
	
	//异步方法
	NodeW.pluginHelper(AsyncH, 'operator');
	NodeW.pluginHelper({
		setTimeout : function(el, delay, fn){
			setTimeout(function(){
				fn.call(el);
			}, delay);
		},
		setInterval: function(el, interval, fn){
			var id = setInterval(function(){
				fn.call(el, id);
			}, interval);
		}
	});

	/**
	 * @class Dom 将QW.DomU与QW.NodeH合并到QW.Dom里，以跟旧的代码保持一致
	 * @singleton 
	 * @namespace QW
	 */
	var Dom = QW.Dom = {};
	mix(Dom, [DomU, NodeH, EventTargetH, JssTargetH]);
}());