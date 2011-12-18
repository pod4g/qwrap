(function() {
	var QW = window.QW, 
		mix = QW.ObjectH.mix,
		isArray = QW.ObjectH.isArray,
		HH = QW.HelperH, 
		W = QW.NodeW,
		Dom = QW.Dom,
		Anim = QW.ElAnim;

	var AnimElH = (function(){
		return {
			fadeIn : function(el, dur, complete, easing) {
				var params = {
					"opacity" : "show"
				};
				var options = {
					duration : dur,
					complete : complete,
					easing	 : easing
				};
				AnimElH.animate(el, params, options);
			},
			fadeOut : function(el, dur, complete, easing) {
				var params = {
					"opacity" : "hide"
				};
				var options = {
					duration : dur,
					complete : complete,
					easing	 : easing
				};

				AnimElH.animate(el, params, options);
			},
			/* 淡入/淡出切换 */
			/*fadeToggle: function(el, dur, complete) {
				AnimElH[el.offsetHeight ? 'fadeOut' : 'fadeIn'](el, dur, complete);
			},*/
			slideUp : function(el, dur, complete, easing) {
				var params = {
					"height" : "hide"
				};

				var options = {
					duration : dur,
					complete : complete,
					easing	 : easing
				};

				var anim = AnimElH.animate(el, params, options);
			},
			slideDown : function(el, dur, complete, easing) {
				
				var params = {
					"height" : "show"
				};

				var options = {
					duration : dur,
					complete : complete,
					easing	 : easing
				};

				var anim = AnimElH.animate(el, params, options);
			},
			/*slideToggle: function(el, dur, complete) {
				AnimElH[el.offsetHeight ? 'slideUp' : 'slideDown'](el, dur, complete);
			},*/
			shine4Error : function(el, dur, complete, easing) {			
				var anim = new Anim(el, {
					"backgroundColor" : {
						from : "#f33",
						to	 : "#fff"
					}
				}, dur, easing);

				anim.on("end", function(){
					W(el).setStyle("backgroundColor", "");
				});
				if(complete) anim.on("end", complete);
				anim.start();
			},
			/**
			 * Animate a HTML element or SVG element wrapper
			 * @param {Object} el
			 * @param {Object} params
			 * @param {Object} options jQuery-like animation options: duration, easing, step, complete
			 */
			animate : function (el, params, options) {
				options = options || {};

				var dur = options.duration;
				var easing = options.easing;
				var complete = options.complete;
				var step = options.step;
				var anim = new Anim(el, params, dur, easing);

				anim.on("end", function(){
					W(el).signal();			//发送一个signal告诉NodeW动画结束
				});

				if(complete) anim.on("end", complete); //执行oncomplete

				if(step) anim.on("enterframe", step);
					
				function animate(){
					anim.start();
				}
				if(options.sequence !== false){	//如果异步序列执行，wait
					W(el).wait(function(){
						setTimeout(animate);
					});
				}else{							//否则立即执行
					setTimeout(animate);
				}
				return anim;
			}
		};
	})();

	//过程抽象，比数据抽象更严谨，也有不好的地方，是只能从slideUp/fadeOut开始
	mix(AnimElH, {
		slideToggle: QW.FunctionH.toggle(AnimElH.slideUp, AnimElH.slideDown), 
		fadeToggle: QW.FunctionH.toggle(AnimElH.fadeOut, AnimElH.fadeIn)
	});

	QW.NodeW.pluginHelper(AnimElH, 'operator');
	if (QW.Dom) {
		mix(QW.Dom, AnimElH);
	}

	QW.provide("AnimElH", AnimElH); 
})();