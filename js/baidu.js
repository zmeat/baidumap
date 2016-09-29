// created by zmeat

//初始化全局变量
var map,
    city,
	sortID,
    sortAddressID,
	iconsrc,
    type,
    level,
    level_str,
	mlat,
	mlng,
	markerArr = [],
    activeMarker,
	PAGECOUNT = 10,
    CONFIG_URL = "http://wx.nxzhly.com/TravelMapBefore/GetCitysAndTypes?mid=21",
    SEARCH_URL = "http://wx.nxzhly.com/TravelMapBefore/GetContent",
    GLOBAL_CONFIG,
    typeMap = {
        "1"  : 'scene',
        "2" : 'gas',
        "8" : 'park',
        "5"   : 'hotel',
        "4"   : 'wc'
    },
    levelMap = {
            "1"  : {
                "0" : '全部',
                "1" : '3A级景区',
                "2" : '4A级景区',
                "3" : '5A级景区'
            },
            "2" : {
                "0" : '全部',
                "1" : '中国石化',
                "2" : '中国石油 '
            },
            "8" : {
                "0" : '全部',
                "1" : '地下停车场',
                "2" : '地上停车场',
                "3" : '其他停车场'               
            },
            "5"   : {
                "0" : '全部',
                "1" : '3星酒店',
                "2" : '4星酒店',
                "3" : '5星酒店'
            },
            "4"   : {
                "0" : '全部',
                "1" : '离我最近'
            }
        };

//创建弹出式选择框	
function createAlertBox (data){
    if(!data) return console.log("err: data not found");

    sortByIndex(data);//排序

    var u = navigator.userAgent; 
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
    var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端

    if(isiOS){
        data.citys.items.reverse();
        data.types.items.reverse();
    }

	var originRate = {
		"2" : "50",
		"3" : "33.3",
		"4" : "25",
		"5" : "20",
		"6" : "16.6"
	};
	var html = $("#interpolationtmpl").html();
	var city_rate = originRate[data.citys.percolumn || 4] || 25;
	var type_rate = originRate[data.types.percolumn || 4] || 25;

	$("#alert_menu_box").html(doT.template(html)(data));

	$(".F_cell").css({"width": type_rate+"%"});
	$(".city_box span").css({"width": city_rate+"%"});
    $(".city_box span:nth-child("+data.citys.percolumn+")").css({"border-right": 'none'});

    //初始化全局变量
    GLOBAL_CONFIG = data;
    city = data.citys.items[0].name;
    sortID = data.citys.items[0].sortID;
    type = data.types.items[0].name;
    iconsrc = data.types.items[0].icon;
    sortAddressID = data.types.items[0].sortAddressID;
    
    $("#current").html(city+' | '+type+(level ? ' | '+level_str : ''));
	initMap();//初始化地图对象
}

function sortByIndex(data){
   if(!data || !data.citys || !data.types) return console.log("数据格式错误");

   (data.citys.items).sort(function(val){
        return -(val.index);
   });

   (data.types.items).sort(function(val){
        return -(val.index);
   });

}
//初始化地图的方法
function initMap(){
	map = new BMap.Map("container", {mapType: BMAP_NORMAL_MAP, enableHighResolution: true});

	var point = new BMap.Point(106.26667, 38.46667);

	map.centerAndZoom(point, 13);
	map.enableScrollWheelZoom();

    map.setMapStyle({features: ["road", "point", "water", "land", "building"], style: "normal"});

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

    Search();
}

function _ajax(url, type, data){
    if(!$) console.log("jquery is not avilable");

    return $.ajax({
        url: url,
        type: type,
        data: data,
        dataType: 'json',
        timeout: 2000,
        cache: false
    });
}
function showMenuBox(){
	$(".alert_box").removeClass("F_hide").animate({"top":"10%"}, 400);
}
function hideMenuBox(){
	$(".alert_box").animate({"top":"-20%"}, 200).addClass("F_hide");
}
function showMask(){
	$(".mask").removeClass("F_hide");
}
function hideMask(){
	$(".mask").addClass("F_hide").fadeIn();
}
function Search(){
	map.clearOverlays();
	markerArr = []; //清空数组

    this._search = function(level){
        var _thisurl = SEARCH_URL + '?mid=21&sortID=' + sortID + '&sortAddressID=' + sortAddressID 
            + (mlat ? "&beginLat= " + mlat + "&beginLng=" + mlng : '')
            + ( level ? "&level="+level : '' );

        _ajax(_thisurl, 'GET', {})
            .done(function(data){
                if(!data ||!data.items) return console.log("data type error");

                var html = $("#interpolationtmpl2").html();
                $("#page_content").html(doT.template(html)(data));//渲染列表页
                $("#province_scene").html(city+' | '+type+(level ? ' | '+level_str : ''));//替换标题
                $("#current").html(city+' | '+type+(level ? ' | '+level_str : ''));

                data.items.forEach(function(val){
                    var thispoint = new BMap.Point(+val.point.lng, +val.point.lat);
                    var thisval = val;
                            
                    thisval.point = thispoint;

                    markerArr.push(thisval); //保存本次的搜索结果
                });


                addMarkerBefore(markerArr);//通过统一的方法添加点 
            })
            .error(function(err){
                console.log(err);
            });
    }

    _search(level);
}
function addMarkerBefore(markerArr){
    var _pointArray = [];

    markerArr.forEach(function(val, key){
        if(key <= 9){//最多十个点
            addMarker(val.point, val, key);
            _pointArray.push(val.point);
        }

    });

    //添加区域折线
    setTimeout(function(){
        addAreaPolyLine(city, _pointArray);//,添加区域折线
    }, 200);


}
// 创建图标对象
function createIcon(url){
    return new BMap.Icon(url, new BMap.Size(28, 28), {
//      size: new BMap.Size(23, 23), 
        imageSize : new BMap.Size(28, 28),
//      imageOffset: new BMap.Size(-4, -2.7)   // 设置图片偏移 
    });  
}
// 添加marker的方法
function addMarker(point, data, index){  
	// 创建标注对象并添加到地图   
	var marker = new BMap.Marker(point, {icon: createIcon("./images/red"+ (index+1) +".png"), title: data.title});

    if(index == 0){
        activeMarker = marker;
        activeMarker.self_index = index;
        marker.setIcon(createIcon("./images/blue"+ (index+1) +".png"));
    }

	map.addOverlay(marker);
	(function(_marker, _index){
		_marker.addEventListener("click", function(e){    
			var tar = e.point || e.target.point;

            console.log("当前位置"+tar.lng+","+tar.lat);
            if(_marker != activeMarker){//当前点击标注不是当前的正在激活的标注
                _marker.setIcon(createIcon("./images/blue"+ (_index+1) +".png"));
                activeMarker.setIcon(createIcon("./images/red"+ (activeMarker.self_index+1) +".png"));
                activeMarker = _marker;
                activeMarker.self_index = _index;
            }     

            for (var j = 0; j < markerArr.length; j++) {
                if (markerArr[j].point.lng == _marker.getPosition().lng && markerArr[j].point.lat == _marker.getPosition().lat) {

                	showMask();   
                	var mpoint = new BMap.Point(mlng, mlat);
                	var thpoint = new BMap.Point(markerArr[j].point.lng, markerArr[j].point.lat);
                	var distance = ((map.getDistance(mpoint, thpoint))/1000).toFixed(2);

                    $("#udist").html("<i class=\"zmeat-iconfont zmeat-iconfont-distance\"></i>" + distance + "km");
                    $("#ulevel").html("<i class=\"zmeat-iconfont zmeat-iconfont-position\"></i>" + markerArr[j].address);

                    if(markerArr[j].level){//如果存在等级信息，则显示在标题后面
                        $("#utitle").text((j+1)+ "." + markerArr[j].title + "（" + markerArr[j].level +"）");
                    }else{
                        $("#utitle").text((j+1)+ "." + markerArr[j].title);
                    }
                    
                    $("#hidareacode").val(markerArr[j].city);
                    $("#hidlat").val(_marker.getPosition().lat);
		 			$("#hidlng").val(_marker.getPosition().lng);	
		 			$("#alertNote").attr("onClick", "showDetail('"+markerArr[j].detailUrl+"')");
		 			$("#divalert").removeClass("F_hide");

                }
            }
		});	

	})(marker, index)
}
//添加区域折线的方法
function addAreaPolyLine(name, setViewPoints){
	var points = [],prepoints = [];

	getBoundary(name, function(data){
		if(data && data.boundaries){
			var prepoints = data.boundaries;	
			var pointArray = [];

			prepoints.forEach(function(val){
				var polygon = new BMap.Polygon(
					val,    
					{strokeColor:"#ff0000", strokeWeight:2, strokeStyle:"solid", strokeOpacity:1, fillOpacity:0.3, fillColor: "#f8c3bf"}    
				);

				map.addOverlay(polygon);
				pointArray = pointArray.concat(polygon.getPath());

			});

            if(city == '宁夏'){
                map.setViewport(pointArray, {delay: 200});
            }else if(setViewPoints.length <=0){//如果没有点则通过区域边界来调整视野
                map.setViewport(pointArray, {delay: 200});    //调整视野
            }else{
                map.setViewport(setViewPoints, {delay: 200});
            }
           
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
    var title = ($("#utitle").text()).split('.')[1];
    var hr = "http://api.map.baidu.com/direction?origin=latlng:" + $("#hidlat").val() + "," + $("#hidlng").val()
        + "|name:我的位置&destination=latlng:" + mlat + "," + mlng
        + "|name:" + encodeURI(title) + "&mode=driving&origin_region=" + $("#hidareacode").val()
        + "&destination_region=" + $("#hidareacode").val()
        + "&output=html&src=景区";

    window.location.href = hr;
}
function Geolocation(cb){
	var geolocation = new BMap.Geolocation();

	geolocation.getCurrentPosition(function(r){
		if(this.getStatus() == BMAP_STATUS_SUCCESS){
			console.log('您的位置：'+r.point.lng+','+r.point.lat);
			mlat = r.point.lat;
			mlng = r.point.lng;
            if($.isFunction(cb)){
                cb(mlat, mlng);
            }
		}
		else {
			if(!mlng || !mlat){//如果定位失败，换ip定位重试 
                ipGeolocation();
            }
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

//点击每个类型搜索区域的回调方法
function Type(that){
    sortAddressID = $(that).data("sortaddressid");
    $(that).addClass('active').siblings().removeClass("active");

    if(typeMap[sortAddressID]){
        $('.item_box').addClass('F_hide');
        $("#hr2").removeClass('F_hide');
        $("#"+typeMap[sortAddressID]).removeClass('F_hide');
    }else{
        $("#hr2").addClass('F_hide');
        $('.item_box').addClass('F_hide');
    }
}

//点击每个城市搜索区域的回调方法
function City(that){
    $(that).addClass('active').siblings().removeClass("active");
}
//sort_box 下的每个选项的点击事件
function itemClick(that, e){
    e.preventDefault();
    e.stopPropagation();
    $(that).addClass('active').siblings().removeClass('active');
}
function cancel(){
    hideMask();
    hideMenuBox();
}
function doSearch(that){

    city = $(that).closest('.alert_box').find('.city_box .active').text().trim();  
    sortID = $(that).closest('.alert_box').find('.city_box .active').data("sortid");

    type = $(that).closest('.alert_box').find('.type_box .active').text().trim();
    sortAddressID = $(that).closest('.alert_box').find('.type_box .active').data("sortaddressid");

    if(typeMap[sortAddressID]){
        level = $("#"+typeMap[sortAddressID]).find('.active').data('val');
        level_str = $("#"+typeMap[sortAddressID]).find('.active').text().trim();
    }else{
        level = null;
        level_str = null;
    }

    hideMask();
    hideMenuBox();

    Search()

}
//点击列表页跳转到弹出详情框的方法
function showToDetailBox(item, index){

    showMask();   

    var mpoint = new BMap.Point(mlng, mlat);
    var thpoint = new BMap.Point(item.point.lng, item.point.lat);
    var distance = ((map.getDistance(mpoint, thpoint))/1000).toFixed(2);

    $("#udist").html("<i class=\"zmeat-iconfont zmeat-iconfont-distance\"></i>" + distance + "km");
    $("#ulevel").html("<i class=\"zmeat-iconfont zmeat-iconfont-position\"></i>" + item.address);

    if(item.level){//如果存在等级信息，则显示在标题后面
        $("#utitle").text((index+1)+ "." + item.title + "（" + item.level +"）");
    }else{
        $("#utitle").text((index+1)+ "." + item.title);
    }
    
    $("#hidareacode").val(item.city);
    $("#hidlat").val(item.point.lat);
    $("#hidlng").val(item.point.lng);    
    $("#alertNote").attr("onClick", "showDetail('"+item.detailUrl+"')");
    $("#divalert").removeClass("F_hide");
}



//将数字类型的level字段转换为方便战士的level_dispaly
function levelFormat(level){
    if(!sortAddressID){
        return '';
    }else if(!levelMap.hasOwnProperty(sortAddressID)){
        return '';
    }else{
        return levelMap[sortAddressID][level] ? levelMap[sortAddressID][level] : '';
    }

}


//===============================================================================
$(function(){

    //先进行定位 定位成功后开始获取数据，后面的逻辑依耐与定位信息
    Geolocation(function(){
        _ajax(CONFIG_URL+'&timestamp='+Math.random(1), 'GET', '')
        .done(function(data){
            console.log(data);
            createAlertBox(data);
        })
        .error(function(err){
            console.log(err);
        });       
    });

	//注册mask的点击事件
	$(".mask").on('click', function(){
		hideMask();
		hideMenuBox();
		$("#divalert, .sort_box").addClass("F_hide");
	});

	//注册memu菜单的点击事件
	$(".icon_menu").on('click', function(){
		showMask();
		showMenuBox();
	});

});
