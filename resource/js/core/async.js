/**
 * 使用非阻塞消息机制，实现异步响应队列
 */
(function(){

var isString = QW.ObjectH.isString;

var seed = 0, 
	sequences = [],
	propId = "__QWASYNCH_sequence_id";

/**
 * 将异步消息和一个target的事件绑定
 * 例如： 绑定动画的end事件，或者Ajax对象的succeed事件等等
 */
var AsyncH = {
	/**
	 * 等待一个自定义事件（信号），当这个事件处理完成之后，继续处理某个动作
	 * W(el).fadeIn().wait(dosth);
	 */
	wait: function(owner, type, fn){
		if(!isString(type)){
			fn = type;
			type = "_default";
		}
		fn = fn || function(){};

		seq = AsyncH.getSequence(owner, type);
		args = [].slice.call(arguments, 2);
		
		seq.push(fn);	//把需要执行的动作加入队列

		if(seq.length <= 1){ //如果之前序列是空的，说明可以立即执行
			if(type != "_default"){	//如果type不是默认的
				fn = function(){};	//多unshift进一个空的function
				seq.unshift(fn);
			}
			fn.apply(owner, args);	//队列空，立即执行当前处理器
		}
	},
	signal: function(owner, type){
		type = type || "_default";
		var seq = AsyncH.getSequence(owner, type);
		var fn = seq.shift();
		if(fn && seq[0]){		//如果队列顶部有新的，可以继续执行
			(function(handler){
				handler.call(owner, function(){
					AsyncH.signal(owner);
				});
			})(seq[0]);
		}
	},
	getSequence: function(owner, type){
		type = type || "_default";
		var id = propId in owner ? owner[propId] : seed++;
		sequences[id] = sequences[id] || [];
		owner[propId] = id;
		sequences[id][type] = sequences[id][type] || [];
		return sequences[id][type];
	},
	clearSequence: function(owner, type){
		type = type || "_default";
		owner[propId] = owner[propId] || [];
		owner[propId][type] = [];
		return true;
	}
}

QW.provide("AsyncH", AsyncH);
})();