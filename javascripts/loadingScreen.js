(function() {
	window.PAL_DrawLoadingScreen = function(canvas, percent, opacity) {
		canvas.width = canvas.width;
		var context = canvas.getContext('2d');
		var startR = -Math.PI / 2;
		var endR = Math.PI * 2 * percent - Math.PI / 2;
		var width = canvas.width;
		var height = canvas.height;
		var r1 = 20;
		var r2 = 2;
		context.fillStyle = '#fff';
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.beginPath();
		context.moveTo((r1 - r2) * Math.cos(startR) + width / 2, (r1 - r2) * Math.sin(startR) + height / 2);
		context.arc(width / 2, height / 2, r1, startR, endR);
		context.arc(width / 2, height / 2, r1 - r2, endR, startR, true);
		context.closePath();
		context.fillStyle = 'rgba(0,0,0,' + opacity + ')';
		context.fill();
	}
})();