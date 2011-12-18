/*
	Copyright (c) Baidu Youa Wed QWrap
	author: 好奇、JK
*/

(function() {
	var mix = QW.ObjectH.mix,
		methodize = QW.HelperH.methodize,
		rwrap = QW.HelperH.rwrap,
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

	var ah = QW.ObjectH.dump(QW.ArrayH, NodeC.arrayMethods);
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