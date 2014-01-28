(function() {
	window.PAL_DrawLoadingScreen = function(canvas, percent, opacity) {
		canvas.width = canvas.width;
		var context = canvas.getContext('2d');
		var startR = -Math.PI / 2;
		var endR = Math.PI * 2 * percent - Math.PI / 2;
		var width = canvas.width;
		var height = canvas.height;
		var r1 = 60 * (opacity - 0.7);
		r1 = r1 < 0 ? 0 : r1;
		var r2 = r1 < 2 ? r1 : 2;
		var backColor = Math.floor(opacity * 255);
		context.fillStyle = 'rgb(' + backColor + ',' + backColor + ',' + backColor + ')';
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.beginPath();
		context.moveTo((r1 - r2) * Math.cos(startR) + width / 2, (r1 - r2) * Math.sin(startR) + height / 2);
		context.arc(width / 2, height / 2, r1, startR, endR);
		context.arc(width / 2, height / 2, r1 - r2, endR, startR, true);
		context.closePath();
		context.fillStyle = 'rgba(90,90,90,' + opacity + ')';
		context.fill();
	}

	window.PAL_DrawErrorScreen = function(canvas, msg) {
		canvas.width = canvas.width;
		var context = canvas.getContext('2d');
		context.fillStyle = '#fff';
		context.fillRect(0, 0, canvas.width, canvas.height);

		context.font = "60px Verdana bold";
		context.textAlign = "center";
		context.fillStyle = "rgba(0,0,0,.7)";
		context.fillText('ERROR', canvas.width / 2, canvas.height / 2 - 20);

		context.font = "20px 'Microsoft YaHei'";
		context.fillStyle = "rgba(0,0,0,.5)";
		context.fillText(msg, canvas.width / 2, canvas.height / 2 + 20);
	}
})();