(function() {
	var els = document.getElementsByTagName('script'),
		srcPath = '';
	for (var i = 0; i < els.length; i++) {
		var src = els[i].src.split(/[\\\/]adapters[\\\/]/g);
		if (src[1]) {
			srcPath = src[0] + '/';
			break;
		}
	}
	document.write(
		  '<script type="text/javascript" src="'+srcPath+'adapters/jquery-1.6.2/jquery_retouch.js"></script>'
		, '<script type="text/javascript" src="'+srcPath+'adapters/jquery-1.6.2/jquery.adapter.core.js"></script>'
		, '<script type="text/javascript" src="'+srcPath+'adapters/jquery-1.6.2/jquery.adapter.dom.js"></script>'
		, '<script type="text/javascript" src="'+srcPath+'adapters/jquery-1.6.2/jquery.adapter.event.js"></script>'
		, '<script type="text/javascript" src="'+srcPath+'adapters/jquery-1.6.2/jquery.adapter.selector.js"></script>'
		, '<script type="text/javascript" src="'+srcPath+'adapters/jquery-1.6.2/jquery.adapter.fx.js"></script>'
	);
}());