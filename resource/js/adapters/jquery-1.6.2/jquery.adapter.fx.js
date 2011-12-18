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
//动画及其他相关的适配

/**
 * 因为jQuery动画能传'fast'、'slow'这种字符串作为时间参数，所以这里做一个变换
 *
 */
var aeh = jQuery.hook(jQuery.dump(QW.AnimElH,["fadeIn","fadeOut","slideUp","slideDown","shine4Error"]), "before", function(args){
	var dur = args[1];
	if(typeof dur == "string")
		args[1] = jQuery.fx.speeds[dur];
});

jQuery.extend({
	easing: {
		/*
		  JQ的easing好多参数，QWrap中只有两个，p和diff
		  p - per，当前归一化的值百分比
		  n - 当前时间 = p*duration?
		  firstNum - 开始属性
		  diff - 总共变化的属性
		  duration - 动画总时间
		 */
		linear: function( p, n, firstNum, diff, duration ) {
			return firstNum + diff * p;
		},
		swing: function( p, n, firstNum, diff, duration ) {
			return ((-Math.cos(p*Math.PI)/2) + 0.5) * diff + firstNum;
		}		
	},
	//这个貌似是用来设置动画基本参数的
	fx: function( elem, options, prop ) {
		this.options = options;
		this.elem = elem;
		this.prop = prop;
		
		//JQ貌似用这个保持属性的初始状态，因为QWrap的动画能reset，所以理论上不需要这个
		//options.orig = options.orig || {};
	}
});

jQuery.extend(jQuery.fx, {
	//这个应该是JQ的默认的step，其作用类似于QWrap动画的Agent.action
	//只不过QWrap用正则匹配Agent，而JQ用名字来匹配，匹配不到的默认到_default
	//JQ的脑残之处在于，有两个step，参数不一样，一个是传给动画的，一个是这个
	step: {
		opacity: function( fx ) {
			jQuery.setStyle( fx.elem, "opacity", fx.now );
		},

		_default: function( fx ) {
			if ( fx.elem.style && fx.elem.style[ fx.prop ] != null ) {
				fx.elem.style[ fx.prop ] = (fx.prop === "width" || fx.prop === "height" ? Math.max(0, fx.now) : fx.now) + fx.unit;
			} else {
				fx.elem[ fx.prop ] = fx.now;
			}
		}	
	},
	speeds: {
		slow: 600,
		fast: 200,
		// Default speed
		_default: 400
	}
});

var _animate = QW.AnimElH.animate;
jQuery.extend(aeh, {
	animate: function(el, params, options /*or duration, [easing,] complete*/){
		//JQ喜欢这种多态，很晕。。。
		if(!jQuery.isPlainObject(options)){
			options = {
				duration: options!=null ? options : jQuery.fx.speeds._default
			};
			if(jQuery.isFunction(arguments[3])){ //complete or easing
				options.complete = arguments[3];
			}else if(arguments[3]){
				options.easing = arguments[3];
			}
			if(jQuery.isFunction(arguments[4])){ //complete
				options.complete = arguments[4];
			}
		}
		options.easing = options.easing || jQuery.easing.swing;
		if(jQuery.isString(options.easing)){
			options.easing = jQuery.easing[options.easing];
		}

		for(var attr in params){
			var param = params[attr];
			//支持缩写，如: {opacity:0}
			//QW的动画也支持缩写，不过QW动画的缩写是数组不是空格分割的字符串
			if(!jQuery.isPlainObject(param)){ 
				var parts = param.toString().split(' ');
				if(parts[1] != null)
					param = {from: parts[0], to: parts[1]}; 
				else param = {to: parts[0]};
			}
			params[attr] = param;
		}

		var fxs = {}; //存放当前动画所有的fx实例，一个属性动画hold一个实例 
		function makeStep(handler){
			return function(evt){ 
				/*
					JQ和QWrap动画最大的不同在于对step的理解
					对于QWrap来说，一桢是一个step
					而对于JQ来说，一次属性改变是一个step
					所以对于同时改变一个以上属性的动画来说
					一个step要分解成多个step才能适配

					另外，如果有inline元素做宽高变化的动画
					JQ会智能滴将它转为inline-block元素
					QWrap适配的时候忽略这个
				*/

				//首先阻止掉QWrap的默认动画，用下面的JQ动画替代
				evt.preventDefault();
				
				var target = evt.target,
					agents = target.agents;

				for(var i = 0; i < agents.length; i++){
					var agent = agents[i];
					var attr = agent.attr;
						//JQ和QWrap的easing算法不一样
						//QWrap的很简单，只有 from + easing(per, diff)
						//当然JQ的复杂，不过灵活一些
						//var from = agent.from;
						var cur = agent.easing(target.per, target.per * target.dur, agent.from, agent.by, target.dur); //当前绝对的值
						var pos = agent.easing(target.per, target.per * target.dur, 0, 1, target.dur);
					
					fx = fxs[attr] = fxs[attr] || {
						elem	:	agent.el,		//动画元素
						prop	:	agent.attr,		//动画改变的属性
						start	:	agent.from,		//动画开始的属性
						end		:	agent.to,		//动画结束的属性
						unit	:	agent.unit,		//动画属性的单位
						options	:	agent			//这个里面的不做适配了
					};

					//这里为什么这样写（分成初始化fx和jQuery.extend添加其他属性到fx）是因为避免每次step生成一个新的fx实例
					//因为动画过程中可以改写fx的某些属性
					//事实上jQuery ui在处理颜色动画的时候就是那样做的
					jQuery.extend(fx,{
						pos		:	pos,				//动画进行的阶段 0-1
						now		:	cur,				//动画当前的属性值
						state	:	target.per,			//动画当前的桢时（好混乱，又是pos又是state）。
					});

					handler.call(this, cur, fx);
					defaultStep = jQuery.fx.step[agent.attr] || jQuery.fx.step._default;
					defaultStep.call(this, fx);
				}
			}
		}

		var handler = options.step || function(){};
		options.step = makeStep(handler);

		options.sequence = options.queue;

		var anim = _animate(el, params, options);
		
		return anim;
	}
});
QW.AnimElH.animate = aeh.animate;

jQuery.pluginHelper(aeh, 'operator');

jQuery.fn.extend({
	/**
	 * 这里用fadeIn替代了JQ的show默认的动画，可能会和原生的JQ效果产生差异，但是应该问题不大
	 */
	show: function(speed, complete, easing){
		if(speed != null){
			return this.fadeIn(speed, complete, easing);
		}else{
			QW.NodeH.show(QW.Dom.g(this));
			return this;
		}
	},
	/**
	 * hide也是用fadeOut替代了默认的hide
	 */
	hide: function(speed, complete, easing){
		if(speed != null){
			return this.fadeOut(speed, complete, easing);
		}else{
			QW.NodeH.hide(QW.Dom.g(this));
			return this;
		}		
	},
	/**
	 * JQ的toggle和QW的toggle作用不一样，QW的就简单控制当前元素的显示隐藏
	 * JQ的toggle的不是寂寞，是toggle两个function，控制他们的执行
	 */
	toggle: (function(){
		var id = 0;
		return function(fn1, fn2){
			var args = [].slice.call(arguments); 
			$(this).on('click', function(){
				return args[id++ % args.length].call(this);
			});
		}
	})()
});

})();

