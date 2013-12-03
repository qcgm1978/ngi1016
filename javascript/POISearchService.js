var POISearchService = function() {
};
POISearchService.byKeywords = function(searchContext){
    POISearchService.bCancleRequest = false;//初始化请求状态为为取消
    var constant = GLOBAL.Constant;
	if(!GLOBAL.Common.checkNet()){
		var config = {
            id:'msg_box_fail',
            msg:constant.prompt_netFail
        };
        var container = window;//元素所在页面容器
        if($('#iframeDiv').css("visibility")=="visible"){
            container = frames[0].window;
        }
		var layer=new container.GLOBAL.layer(config);
		layer.show();
        $("#aside_spinner",container.document).hide() ;
		return;
	}
	//console.log("查询POI,关键字:" + searchContext.keyword + " , 城市:" + searchContext.region) ;
	
	//设置POI查询类别、每页数量、页数、范围等（类别无须设置）[Number]
	var option = {number: searchContext.number || constant.search_num, batch: searchContext.batch || 1, range: searchContext.range || 3000};
    var poisdk = typeof PoiSDK !=='undefined'  ?  PoiSDK :  parent.window.PoiSDK;
	//测试代码，如未加载sdk接口，则调用全局变量list

		if(typeof poisdk !== 'undefined') {
			var poi = new poisdk.PoiSearch(option);
			poi.byKeywords(searchContext.keyword, searchContext.region, searchContext.successHandler);	
		}else{
			errorHandler();
		}
	function errorHandler(){
		console.log("网络异常...") ;
		var config = {
            id:'msg_box_fail',
            msg:constant.prompt_netFail
        };
        var container = window;//元素所在页面容器
        if($('#iframeDiv').css("visibility")=="visible"){
            container = frames[0].window;
        }
		var layer=new container.GLOBAL.layer(config);
		layer.show();
	}
} ;
POISearchService.byCenPoi = function(searchContext){
    POISearchService.bCancleRequest = false;//初始化请求状态为为取消
    var constant = GLOBAL.Constant;
	if(!GLOBAL.Common.checkNet()){
		var config = {
            id:'msg_box_fail',
            msg:constant.prompt_netFail
        };
        var container = window;//元素所在页面容器
        if($('#iframeDiv').css("visibility")=="visible"){
            container = frames[0].window;
        }
		var layer=new container.GLOBAL.layer(config);
		layer.show();
        $("#aside_spinner",container.document).hide() ;
		return;
	}
	
	//测试代码，如未加载sdk接口，则调用全局变量list
    var poisdk = typeof PoiSDK !=='undefined'  ?  PoiSDK :  parent.window.PoiSDK;
	if (typeof poisdk !== 'undefined') {
		var option = {
				range:searchContext.range || Number(localStorage["Map_poi_range"]),
				number: searchContext.number || 30,
				type:/* '通用特约维修'*/searchContext.type,
                batch: searchContext.batch || 1
			};
		var poi = new poisdk.PoiSearch(option);
        var _thispage = typeof thisPage !== 'undefined' ? thisPage : parent.window.thisPage;
        var mapCenterLocation = _thispage.getMapCenterInfo();
		var center_poi = new poisdk.LngLat(mapCenterLocation.lng, mapCenterLocation.lat);
        poi.byCenPoi(center_poi, searchContext.keyword, searchContext.successHandler);
    }
	else {
        $('aside:has(h3)').hide();
        GLOBAL.layer.normal.show();
	}
} ;
POISearchService.bCancleRequest = false;//取消请求
//取消查询poi请求
POISearchService.cancleRequest = function(){
    POISearchService.bCancleRequest = true;
};
//查询poi请求是否取消
POISearchService.isRequestCancled = function(){
    return POISearchService.bCancleRequest;
};