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
 * 为神马JQ的一个方法都有N种用途，$既能作为Wrap又能作为Dom.ready。。。
 * 其实还有别的用途，省略之
 */
jQuery = $ = function(selector, context){
	if(selector instanceof Function){	//如果selector是一个function, domReady
		return QW.Dom.ready(function(){
			return selector.call(jQuery, jQuery);
		});
	}else{
		return new QW.NodeW(selector, context); //否则是Wrap
	}
};

jQuery.browser = QW.Browser;

jQuery.fn = QW.NodeW.prototype;

jQuery.pluginHelper = function(helper, wrapConfig, gsetterConfig, override){
	jQuery.extend(helper);
	if(override !== false) override = true;
	QW.NodeW.pluginHelper(helper, wrapConfig, gsetterConfig, override);
}

/**
 * 简化版的extend，mix不支持deepcopy
 * JQ的extend居然可以省略des，反正他框架里面这么用的，具体实现我看得不是很明白 =.=
 * 真不明白JQ绕啊绕啊有什么好，肿么不会将作者们自己绕晕掉。。。
 */
jQuery.extend = function(des, src){
	//jQuery.extend(deep, des, src); JQ还支持这种，没办法，只好实现一下，因为组件可能用到了
	//这种思路其实不大好，js明明是弱类型的，框架里到处是依赖类型检查。。。
	var deep = false;
	if(src == null){
		src = des;
		des = jQuery;
	}else if(!!des === des /*is Boolean*/){
		deep = !!des;
		des = src;
		src = [].slice.call(arguments, 2);
	}else{
		src = [].slice.call(arguments, 1); //支持多个src的情况
	}

	if(!deep){
		return QW.ObjectH.mix(des, src, true);
	}else{
		for(var i = 0; i < src.length; i++){
			var _src = src[i];
			for(var prop in _src){
				var source = _src[prop], target = des[prop];
				
				if(prop in des && target != source && 
					(jQuery.isArray(target) && jQuery.isArray(source) 
					|| jQuery.isPlainObject(target) && jQuery.isPlainObject(source))){ 
					//只有des[prop]存在并且类型和_src[prop]相同，并且des[prop] != _src[prop]
					//而且_src[prop]和des[prop]都为Array或PlainObject的时候
					//才deepCopy
					des[prop] = jQuery.extend(true, target, source); 
				}else{
					if(prop in _src){
						des[prop] = _src[prop];
					}
				}
			}
		}
		return des;
	}
};
jQuery.fn.extend = QW.FunctionH.methodize(jQuery.extend);

//将ObjectH的静态方法给jQuery空间
jQuery.extend(QW.ObjectH);
//将HelperH的静态方法给jQuery空间
jQuery.extend(QW.HelperH);
//将DomU的静态方法（包括NodeH、EventTargetH、JssTargetH）给jQuery空间
jQuery.extend(QW.Dom);

jQuery.fn.extend({
	// The current version of jQuery being used
	jquery: "1.6.2"
});

//其他静态属性和方法
jQuery.extend(
	{
		expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),
		now: function(){
			return (new Date()).getTime();
		},
		makeArray: function(obj){
			if(jQuery.isArray(obj)){
				return obj;
			}else if(jQuery.isArrayLike(obj)){
				QW.ArrayH.toArray(obj);
			}else{
				return [obj];
			}
		},
		inArray: QW.ArrayH.indexOf
	}
);

var jQueryArrayH = {
	/**
	 * each的实现
	 * QWrap是严格按照js新版本原生的api实现的forEach、map、filter等等
	 * 和JQ的参数是反过来的，并且JQ的callback里面可以return false，表示停止后续执行
	 */
	each : function(arr, callback){
		var signal = true;
		var iterator = jQuery.isArray(arr) || jQuery.isArrayLike(arr) ? QW.ArrayH.forEach : QW.ObjectH.map;

		iterator(arr,
			function(o, i, arr){
				if(!signal) return; //noop 这样简单实现，但是效率上未免略受影响
				var ret = callback.call(o, i, o);
				if(false === ret){
					signal = false;
				}
				return ret;
			});

		return arr;
	},
	/**
	 * map的参数又和each相反，真是晕。。
	 */
	map : function(arr, callback){	//jQuery脑残。。参数顺序换来换去
		return QW.ArrayH.map(arr,
			function(o, i, arr){
				return callback.call(o, o, i)[0];	
			});
	},
	/**
	 * 这个not是个过滤器，能够过滤selector和数组
	 * 其实就是求两个集合的差集
	 */
	not : function(arr, filter){
		if(jQuery.isString(filter)){ //selector 过滤
			filter = $(filter, arr);
		}
		if(jQuery.isWrap(arr)){
			arr = arr.core;
			if(!jQuery.isArray(arr)){
				arr = [arr];
			}
		}

		if(jQuery.isWrap(filter)){
			filter = filter.core;
			if(!jQuery.isArray(filter)){
				filter = [filter];
			}
		}
		return $(QW.HashsetH.minus(arr, filter));
	}
}

//集合操作的方法
jQuery.extend(jQueryArrayH);
jQuery.fn.extend(jQuery.methodize(jQueryArrayH));

var jQueryH = {
	/**
	 * 简化版的jQuery.data
	 * jQuery的data是用来缓存数据的
	 * 理论上这个属性名应该不会和别人的冲突，有时候没必要考虑太多，又是uuid又是cache啥的 =.=
	 * 考虑多了也挺累的，实用最重要，简单可依赖~
	 * 这个版本中，data存在闭包里，cache的索引存在el上
	 */
	data : (function(){
		var id = 0, cache = [];
		var cacheIndex = jQuery.expando + "_xdata";
		return function(el, key, value){
			var _id = el[cacheIndex];
			if(jQuery.isPlainObject(key)){
				for(each in key){
					this.data(each, key[each]);
				}
				return $(el);
			}
			else if(arguments.length >= 3){ //act as setter
				if(_id == null){
					cache[_id = id++] = {};
					el[cacheIndex] = _id;
				}
				var src = {};
				src[key] = value;
				jQuery.extend(cache[_id], src);
				return $(el);
			}else{ //act as getter
				return cache[_id] ? cache[_id][key] : null;
			}
		};
	})(),
	//jQuery的两个方法都设计得很复杂，果断脑残。。。
	removeData: function(el, key){
		return jQueryH.data(el, key, undefined);
	},
	//JQ的data的最后一个pvt参数看不同，果断忽略之。。。
	//gsetter，获得和设置指定的队列
	queue: QW.AsyncH.wait,
	dequeue: QW.AsyncH.signal
};

jQuery.pluginHelper(jQueryH, {
	queue : "operator",
	dequeue : "operator"
});
})();