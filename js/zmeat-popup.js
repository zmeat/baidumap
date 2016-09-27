/**
 * zmeat-popup.js
 * @author zmeat
 * @params window

 * @params items[]
 * 自定数据源 items必须是是一个object[]  
 * object 必须包含name字段， 其他的字端可自定义
 * 点击每个标签时触发回调函数，返回object对象

 */

 (function(window){
 	'use strict';

 	zmeatPopup.prototype.styles = {
 		width: '80%',
 		height: '179px',
 		position: 'fixed',
 		top: '30%',
 		zIndex: 9999999,
 		left: '10%',
 		borderRadius: '8px',
 		background: '#ccc',
 		overflow: 'scroll'
 	}

 	zmeatPopup.prototype.itemStyles = {
 		width: "100%",
 		height: '45px',
 		background: '#fff',
 		textAlign: 'center',
 		fontSize: '17px',
 		lineHeight: 2.6,
 		fontFamily: '微软雅黑',
 		color: '#33475f',
 		letterSpacing: '1px',
 		borderBottom: '1px solid rgba(0,0,0,0.1)'
 	}

 	/*
	* 初始化的点击回调地址
 	*/
 	zmeatPopup.prototype._click = function(element){
 		element.style.background = 'rgba(255,255,255,0.7)';
 		setTimeout(function(){
 			element.style.background = '#fff';
 		}, 80);
 		var item_data = element.getAttribute('data-popup');

 		self.cb(JSON.parse(item_data));
 	}


 	zmeatPopup.prototype.open = function(cb){
 		//此处延时200毫秒是为了防止误触
 		setTimeout(function(){
	 		document.body.appendChild(self.mask);
	 		document.body.appendChild(self.container);

	 		//return clicked htmlnode
	 		if(typeof(cb) === 'function'){
	 			self.cb = cb;
	 		} 			
 		}, 200);
 	}


 	zmeatPopup.prototype.close = function(){
 		document.body.removeChild(self.mask);
 		document.body.removeChild(self.container);
 	}

 	zmeatPopup.prototype.hide = function(){
 		self.mask.setAttribute('hidden', 'hidden');
 		self.container.setAttribute('hidden', 'hidden');
 	}


 	zmeatPopup.prototype.show = function(){
 		self.mask.removeAttribute('hidden');
 		self.container.removeAttribute('hidden');
 	}


 	zmeatPopup.prototype._init = function(items){

 		//creater container
 		self.container = document.createElement('div');
 		self.container.id = "popup";
	 	for(var key in self.styles){
			self.container.style[key] = self.styles[key];
		}

 		//create container items
 		items.forEach(function(val, key){
 			var item = document.createElement('div');

 			item.className = 'popup-item';
 			item.innerHTML = val.name;
 			item.setAttribute('data-popup', JSON.stringify(val));
 			item.setAttribute('onclick', 'self._click(this)')

 			for(var key in self.itemStyles){
 				item.style[key] = self.itemStyles[key];
 			}

 			self.container.appendChild(item);
 		});



 		//create mask
 		self.mask = document.createElement('div');
 		self.mask.style.width = '100%';
 		self.mask.style.height = '100%';
 		self.mask.style.position = 'fixed';
 		self.mask.style.zIndex = 9999998;
 		self.mask.style.top = 0;
 		self.mask.style.left = 0;
 		self.mask.setAttribute('onclick', 'self.close()');
 		self.mask.style.background = 'rgba(0,0,0,0.5)';
 	}

 	/*
	* @params items[]
	* 自定数据源 items必须是是一个object[]  
	* object 必须包含name字段， 其他的字端可自定义
	* 点击每个标签时触犯回调函数，返回object对象
 	*/
 	function zmeatPopup(items, styles, itemStyles){
 		self = this;

 		if(typeof(styles) === 'object'){
	 		for(var key in styles){
	 			if((self.styles).hasOwnProperty(key)){
	 				self.styles[key] = styles[key];
	 			}
	 		} 			
 		}

 		if(typeof(itemStyles) === 'object'){
	 		for(var key in itemStyles){
	 			if((self.itemStyles).hasOwnProperty(key)){
	 				self.itemStyles[key] = itemStyles[key];
	 			}
	 		} 			
 		}

 		self._init(items);
 	}

 	window.zmeatPopup = zmeatPopup;
})(window);