//为了写JQ的Adapter而做的必要的retouch
(function(){

QW.ObjectH.mix(
	QW.ObjectH,
	{
		/** 
		 * 判断一个变量是否是Number对象
		 * @method isArray
		 * @static
		 * @param {mixed} obj 目标变量
		 * @returns {boolean} 
		 */
		isNumber: function(obj) {
			return getConstructorName(obj) == 'Number';
		},
		/** 
		 * 判断一个变量是否是Html的Document元素
		 * @method isElement
		 * @static
		 * @param {mixed} obj 目标变量
		 * @returns {boolean} 
		 */
		isDocument: function(obj) {
			return !!obj && obj.nodeType == 9;
		},
		/** 
		 * 判断一个变量是否是Window对象
		 * @method isElement
		 * @static
		 * @param {mixed} obj 目标变量
		 * @returns {boolean} 
		 */
		isWindow: function(obj){
			return !!obj && "setInterval" in obj;
		},
		/**
		 * 在对象中的每个属性项上运行一个函数，用该函数的返回值决定是否复制该属性到返回对象。
		 * @method map
		 * @static
		 * @param {Object} obj 被操作的对象
		 * @param {function} fn 迭代计算每个属性的算子，该算子迭代中有三个参数value-属性值，key-属性名，obj，当前对象
		 * @param {Object} thisObj (Optional)迭代计算时的this
		 * @return {Object} 返回包含这个对象中所有属性计算结果的对象
		 */
		filter: function(obj, fn, thisObj){
			var ret = {};
			for (var key in obj) {
				if(fn.call(thisObj, obj[key], key, obj)){
					ret[key] = obj[key];
				}
			}
			return ret;		
		}	
	},
	true
);

//给HelperH添加一个hook方法
QW.HelperH.hook = function(helper, where, handler){
	var ret = {};

	for (var i  in helper){
		var fn = helper[i];

		if(fn instanceof Function){
			ret[i] = FunctionH.hook(fn, where, handler);
		}else{
			ret[i] = fn; //非Function属性会原样保留
		}
	}

	return ret; 
};

})();