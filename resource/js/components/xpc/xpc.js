/*
 * @fileoverview 跨域解决方案
 * @author ququ，主要代码来源于欢欢（huanghuan@360.cn）同学的xdomain。致谢
 * @version 0.1
 * @create-date : 2012-06-19
 * @last-modified : 2012-06-19
*/

(function() {
	var mix = QW.ObjectH.mix,
		on = QW.EventTargetH.on,
		stringify = QW.ObjectH.stringify,
		parse = QW.StringH.evalExp,
		CustEvent = QW.CustEvent;

	var usePM = (typeof window.postMessage !== 'undefined');

	function XPC(options) {
		var defaultOpts = {
			isParent : parent == window,
			iframeName : 'XPC_IFRAME'
		};
		this.options = mix(options || {}, defaultOpts, false);
		this._initialize();
	};

	mix(XPC.prototype, {
		_initialize : function() {
			var me = this;
			CustEvent.createEvents(this);

			function callback(msg) {
				var data = {};
				try {
					data = parse(msg);
				} catch(e) {}

				me.fire('message', data);
			};

	        if(usePM){
	        	on(window, 'message', function(e) {
	        		callback(e.data);
	        	});
	        }else{
	            var lastName = window.name;
	            setInterval(function(){
	                if(window.name != lastName && window.name != ''){
	                    lastName = window.name;
	                    callback(lastName);
	                }
	            },50);
	        }
		},
		send : function(data) {
			var opts = this.options,
				win = opts.win || (opts.isParent ? window.frames[opts.iframeName] : parent);

			if(!win) throw new Error('XPC', "can not find window!");

			var newData = {
				data : data,
				ts : (+(new Date)).toString(36)
			}

			newData = stringify(newData);

	        if(usePM){
	            win.postMessage(newData, '*');
	        } else {
	            win.name = newData;
	        }
	    }
	}, true);

	QW.provide('XPC', XPC);
})();