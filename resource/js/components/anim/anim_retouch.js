/*
 *	Copyright (c) QWrap
 *	version: $version$ $release$ released
 *	author:Jerry(屈光宇)、JK（加宽）
 *  description: Anim推荐retouch....
*/

(function() {
	var NodeH = QW.NodeH,
		g = NodeH.g,
		isVisible = NodeH.isVisible,
		mix = QW.ObjectH.mix;

	function newAnim(el, attrs, callback, dur, easing) {
		el = g(el);
		var preAnim = el.__preAnim;
		preAnim && preAnim.isPlaying() && preAnim.pause();

		var anim = new QW.ElAnim(el, attrs, dur || 400, easing);
		if (callback) {
			anim.on("end", function() {
				callback.call(el, null);
			});
		}

		anim.play();

		el.__preAnim = anim;
		return anim;
	}

	var AnimElH = {
		/**
		 * [animate 通用的动画函数]
		 * @param  {[Element]}   el    动画作用的元素
		 * @param  {[Object]}   attrs  动画改变的属性
		 * @param  {[Int]}   dur       动画时长，毫秒
		 * @param  {Function} callback 动画运行完回调
		 * @param  {Function}   easing 动画算子
		 * @return ElAnim
		 */
		animate: function(el, attrs, dur, callback, easing, sequence) {
			//参数如果是boolean，看作sequence
			for (var i = arguments.length - 1; i > 0; i--){
				if(arguments[i] === !!arguments[i]){
					var _sequence = arguments[i];
					arguments[i] = null;
					sequence = _sequence;
					break;
				}
			}

			if(QW.Async && (sequence || QW.ElAnim.Sequence)){
				W(el).wait(function(){
					var anim = newAnim(el, attrs, callback, dur, easing);
					anim.on("end", function(){
						W(el).signal();
					});
					return anim;
				});
			}else{
				return newAnim(el, attrs, callback, dur, easing);
			}
		},

		/**
		 * [fadeIn 淡入]
		 * @param  {[Element]}   el    动画作用的元素
		 * @param  {[Int]}   dur       动画时长，毫秒
		 * @param  {Function} callback 动画运行完回调
		 * @param  {Function}   easing 动画算子
		 * @return ElAnim
		 */
		fadeIn: function(el, dur, callback, easing, sequence) {
			var attrs = {
				"opacity": "show"
			};

			return AnimElH.animate(el, attrs, dur, callback, easing, sequence);
		},

		/**
		 * [fadeOut 淡出]
		 * @param  {[Element]}   el    动画作用的元素
		 * @param  {[Int]}   dur       动画时长，毫秒
		 * @param  {Function} callback 动画运行完回调
		 * @param  {Function}   easing 动画算子
		 * @return ElAnim
		 */
		fadeOut: function(el, dur, callback, easing, sequence) {
			var attrs = {
				"opacity": "hide"
			};

			return AnimElH.animate(el, attrs, dur, callback, easing, sequence);
		},

		/**
		 * [fadeToggle 淡入/淡出切换]
		 * @param  {[Element]}   el    动画作用的元素
		 * @param  {[Int]}   dur       动画时长，毫秒
		 * @param  {Function} callback 动画运行完回调
		 * @param  {Function}   easing 动画算子
		 * @return ElAnim
		 */
		fadeToggle: function(el, dur, callback, easing, sequence) {
			return AnimElH[isVisible(el) ? 'fadeOut' : 'fadeIn'](el, dur, callback, easing, sequence);
		},

		/**
		 * [slideUp 收起]
		 * @param  {[Element]}   el    动画作用的元素
		 * @param  {[Int]}   dur       动画时长，毫秒
		 * @param  {Function} callback 动画运行完回调
		 * @param  {Function}   easing 动画算子
		 * @return ElAnim
		 */
		slideUp: function(el, dur, callback, easing, sequence) {

			var attrs = {
				"height": "hide"
			};

			return AnimElH.animate(el, attrs, dur, callback, easing, sequence);
		},

		/**
		 * [slideDown 展开]
		 * @param  {[Element]}   el    动画作用的元素
		 * @param  {[Int]}   dur       动画时长，毫秒
		 * @param  {Function} callback 动画运行完回调
		 * @param  {Function}   easing 动画算子
		 * @return ElAnim
		 */
		slideDown: function(el, dur, callback, easing, sequence) {

			var attrs = {
				"height": "show"
			};

			return AnimElH.animate(el, attrs, dur, callback, easing, sequence); 
		},

		/**
		 * [slideToggle 收起/展开切换]
		 * @param  {[Element]}   el    动画作用的元素
		 * @param  {[Int]}   dur       动画时长，毫秒
		 * @param  {Function} callback 动画运行完回调
		 * @param  {Function}   easing 动画算子
		 * @return ElAnim
		 */
		slideToggle: function(el, dur, callback, easing, sequence) {
			return AnimElH[isVisible(el) ? 'slideUp' : 'slideDown'](el, dur, callback, easing, sequence);
		},

		/**
		 * [shine4Error 颜色渐变，用于表单提示]
		 * @param  {[Element]}   el    动画作用的元素
		 * @param  {[Int]}   dur       动画时长，毫秒
		 * @param  {Function} callback 动画运行完回调
		 * @param  {Function}   easing 动画算子
		 * @return ElAnim
		 */
		shine4Error: function(el, dur, callback, easing, sequence) {
			var attrs = {
				"backgroundColor": {
					from: "#f33",
					to: "#fff",
					end: ""
				}
			};
			return AnimElH.animate(el, attrs, dur, callback, easing, sequence); 
		},

		/**
		 * [pause 暂停动画，可恢复]
		 * @param  {[Element]}   el    动画作用的元素
		 **/
		pause : function(el) {
			var preAnim = el.__preAnim;
			preAnim && preAnim.isPlaying() && preAnim.pause();
		},

		/**
		 * [resume 恢复动画]
		 * @param  {[Element]}   el    动画作用的元素
		 **/
		resume : function(el) {
			var preAnim = el.__preAnim;
			preAnim && !preAnim.isPlaying() && preAnim.resume();
		},

		/**
		 * [end 结束动画]
		 * @param  {[Element]}   el    动画作用的元素
		 **/
		end : function(el) {
			var preAnim = el.__preAnim;
			if(!preAnim) {
				return;
			}

			preAnim.end();
			el.__preAnim = null;
		}
	};

	//如果支持异步，增加一个sleep动画，什么也不做，只是等待
	if(QW.Async){
		mix(AnimElH, {
			sleep: function(el, dur, callback){
				return AnimElH.animate(el, {}, dur, callback, null, true);
			}
		});
	}

	QW.NodeW.pluginHelper(AnimElH, 'operator');
	if (QW.Dom) {
		mix(QW.Dom, AnimElH);
	}
}());