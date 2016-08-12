// created by zmeat


//初始化全局变量
var map,
	city = "宁夏",
	mlat,
	mlng,
	markerArr = [],
	iconsrc = "./images/jingqu.png",
	PAGECOUNT = 50;

function initMap(){
	map = new BMap.Map("container");
	var point = new BMap.Point(106.26667, 38.46667);
	map.centerAndZoom(point, 13);
	map.enableScrollWheelZoom();
	map.setCurrentCity(city);

	//添加控件
	//缩放控件
	map.addControl(new BMap.NavigationControl({
		type: BMAP_NAVIGATION_CONTROL_ZOOM,
		offset: new BMap.Size(8, 20),
		anchor: BMAP_ANCHOR_BOTTOM_RIGHT 
	}));
	//定位控件
	map.addControl(new BMap.GeolocationControl({
		offset: new BMap.Size(8, 40),
		anchor: BMAP_ANCHOR_BOTTOM_LEFT 
	}));
}
function showMenuBox(){
	$(".alert_box").removeClass("F_hide");
}
function hideMenuBox(){
	$(".alert_box").addClass("F_hide");
}
function showMask(){
	$(".mask").removeClass("F_hide");
}
function hideMask(){
	$(".mask").addClass("F_hide");
}
function Search(el, src){
	map.clearOverlays();
	iconsrc = src;//全局替换图标
	markerArr = []; //清空数组

	var options = {      
	      onSearchComplete: function(results){    
          	if (local.getStatus() == BMAP_STATUS_SUCCESS){      
                // 判断状态是否正确      
                var s = results.wr;

             	markerArr = markerArr.concat(s); //保存本次的搜索结果

             	s.forEach(function(val){
					addMarker(val.point, val);
				});

				addAreaPolyLine(city);
          	}      
	      }      
	 };  

	var local = new BMap.LocalSearch(map, options);

	local.setPageCapacity(PAGECOUNT);//设置每页返回的数量

	if(city === "宁夏"){
		var needSearchs = [
			"银川",
			"吴忠",
			"石嘴山",
			"固原",
			"中卫"
		];

		needSearchs.forEach(function(val){
			(function(_val){
				local.searchNearby(el, _val);
			})(val)
		});
	}else{
		local.setLocation(city);
		local.search(el, {forceLocal:true});		
	}
	
}

function addMarker(point, data){  // 创建图标对象
	var myIcon = new BMap.Icon(iconsrc, new BMap.Size(17, 17), {
		size: new BMap.Size(23, 23), 
		imageSize : new BMap.Size(24, 23),
	    imageOffset: new BMap.Size(-4, -2.7)   // 设置图片偏移 
	});      
	// 创建标注对象并添加到地图   
	var marker = new BMap.Marker(point, {icon: myIcon, title: data.title});

	map.addOverlay(marker);
	(function(_marker){
		_marker.addEventListener("click", function(e){    
			var tar = e.point || e.target.point;

			console.log("当前位置"+tar.lng+","+tar.lat);
            for (var j = 0; j < markerArr.length; j++) {
                if (markerArr[j].point.lng == _marker.getPosition().lng && markerArr[j].point.lat == _marker.getPosition().lat) {

                	showMask();

                	var mpoint = new BMap.Point(mlng, mlat);
                	var thpoint = new BMap.Point(markerArr[j].point.lng, markerArr[j].point.lat);
                	var distance = ((map.getDistance(mpoint, thpoint))/1000).toFixed(2);

                    $("#udist").html("<i class=\"dist-icon\"></i>" + distance + "km");
                    $("#ulevel").html("<i class=\"location-icon\"></i>" + markerArr[j].address);
                    $("#utitle").text(markerArr[j].title);
                    $("#hidareacode").val(markerArr[j].city);
                    $("#hidlat").val(_marker.getPosition().lat);
		 			$("#hidlng").val(_marker.getPosition().lng);	
		 			$("#alertNote").attr("onClick", "showDetail('"+markerArr[j].detailUrl+"')");
		 			$("#divalert").removeClass("F_hide");

                }
            }
		});	

	})(marker)
}
function addAreaPolyLine(name){
	var points = [],prepoints = [];

	getBoundary(name, function(data){
		if(data && data.boundaries){
			var prepoints = data.boundaries;	
			var pointArray = [];

			prepoints.forEach(function(val){
				var polygon = new BMap.Polygon(
					val,    
					{strokeColor:"#ff0000", strokeWeight:2, strokeOpacity:1, fillOpacity:0, fillColor: ""}    
				);

				map.addOverlay(polygon);
				pointArray = pointArray.concat(polygon.getPath());

			});

            map.setViewport(pointArray);    //调整视野
		}
	});
}
//获取区域坐标的方法
function getBoundary(name, cb){
	var boundary = new BMap.Boundary();

	boundary.get(name, cb);
}
function showDetail(url){
	window.location.href = url;
}
function Navigation() {
    var hr = "http://api.map.baidu.com/direction?origin=latlng:" + $("#hidlat").val() + "," + $("#hidlng").val()
        + "|name:我的位置&destination=latlng:" + mlat + "," + mlng
        + "|name:" + encodeURI($("#utitle").text()) + "&mode=driving&origin_region=" + $("#hidareacode").val()
        + "&destination_region=" + $("#hidareacode").val()
        + "&output=html&src=景区";

    window.location.href = hr;
}
function Geolocation(){
	var geolocation = new BMap.Geolocation();

	geolocation.getCurrentPosition(function(r){
		if(this.getStatus() == BMAP_STATUS_SUCCESS){
			console.log('您的位置：'+r.point.lng+','+r.point.lat);
			mlat = r.point.lat;
			mlng = r.point.lng;
		}
		else {
			alert('failed'+this.getStatus());
		}        
	},{enableHighAccuracy: true})
}

function ipGeolocation(){
	var myCity = new BMap.LocalCity();

	myCity.get(function(result){
		if(result){
			mlat = result.center && result.center.lat;
			mlng = result.center && result.center.lng;
		}
	})
}
function changeCity(el){
	city = el;
	$("#current_city").html(city);

	Search(el, iconsrc);
}
//===============================================================================
$(function(){
	initMap();//初始化地图对象
	Geolocation();//定位
	if(!mlng || !mlat){//如果定位失败，换ip定位重试
		ipGeolocation();
	}
	Search("景区", iconsrc);


	//注册mask的点击事件
	$(".mask").on('click', function(){
		hideMask();
		hideMenuBox();
		$("#divalert").addClass("F_hide");
	});

	//注册memu菜单的点击事件
	$(".icon_menu").on('click', function(){
		showMask();
		showMenuBox();
	});

	//注册alert_box的每个搜索条件的点击事件
	$(".alert_box a").on("click", function(){
		var text = $(this).find('p').text();
		var imgsrc = $(this).find('img').attr('src');

		$(this).parent().find("a").removeClass('active');
		$(this).addClass('active');

		Search(text, imgsrc);
		hideMenuBox();
		hideMask();
	});

	$("#city_box span").on("click", function(e){
		var this_city = $(this).data("city");

		$(this).parent().find("span").removeClass('active');
		$(this).addClass('active');

		changeCity(this_city);
		hideMenuBox();
		hideMask();
	});

});
