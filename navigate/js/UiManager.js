// JavaScript Document
/**
 * @class 
 * @description ui管理类
 * @param []
 **/
function UiManager(){
	/**
	 * @description 页面跳转方法,根据传入参数跳转相应页面，设置Ui状态
	 * @param options 页面状态及需要的数值，pageState,gpsState,config
     **/	
	this.setPageState=function(options){		
		switch (options.pageState){
			//地图拖动ui设置
			case "dragMap":
				unNaviDragState();
			break;
			//搜索结果ui设置
			case "searchResult":
				view_detail();
			break;
			//双光柱页ui设置
			case "lightCross":
				lightCross_ui();				
			break;
			//分段浏览页ui设置
			case "subsection":
				subsection_ui();
			break;
			//全图浏览ui设置
			case "fitview":
				full_figure();
			break;
			//模拟导航Ui设置
			case "simulator":
				simulator_ui();
			break;
			//非导航和导航正常ui设置
			case "":
                var  localCons = parent.window.GLOBAL === undefined?GLOBAL.Constant:parent.window.GLOBAL.Constant;
                var bool=JSON.parse(localStorage['tbt_state']);

				if(bool || options.gpsState || GLOBAL.Constant.nav_obj.bReroute){
					naviInitialState();	
				}else{
					unNaviInitialState();
				}
				thisPage.reSetNormalEvent();	
			break;
			default :
				break;
		}
	};
	/**
	 * @description 未导航初始状态
     **/
	function unNaviInitialState(){
        var constant = GLOBAL.Constant;
		if(iframeObj != undefined){
			iframeObj.remove();	
		}
		$('#center, #name,#name p,#current_pos,#right li:not("#btn_main_page"), #details,#mark,#simulator,#subsection,#poi_current, svg,#navi_menu_warp_left,#navi_menu_warp_right,#light_cross_html').hide();
        thisPage.setMapWithCompassMode("NorthUp");
        $('#compassContainer').unbind().bind('click',thisPage.setCompass);
		$('#reach_time').css('visibility', 'hidden');
		$('#gps,#btn_main_page,#right,#navi_menu_warp,.navi_menu,#shortcut,#search').show();
		$('.navi_menu li').slice(2, 5).show();	
		$('#pull_back_btn img').attr({'alt': constant.alt_lower_left_button.contract
		,'src':constant.contract_img});
		//切换设终点按钮
		$('#menu_first').attr({src: 'images/images/main_menu.png',alt: '主菜单按钮'});
        constant.centerAfterDragging = null;
	};
	/**
	 * @description 未导航地图拖动状态
     **/
	function unNaviDragState(){
        var constant = GLOBAL.Constant;
		if(Event.mapObj.getStatus().dragEnable){
			$('#target,#center').show();
			$('#pull_back_btn img').attr({
				'src': 'images/images/menu_back.png',
				'alt': constant.ret_map_ini
			});
			$('#menu_first').attr({
				'src': GLOBAL.Constant.set_destination,
				'alt': '设终点按钮'	
			});
			//确保设终点等图片为显示状态
			$('.navi_menu li').slice(2, 5).add('#navi_menu_warp').show();
			$('#navi_menu_warp_left,#navi_menu_warp_right').hide();			
			constant.centerAfterDragging = Event.mapObj.getCenter();
			var target = new MMap.LngLat(constant.centerAfterDragging.lng, constant.centerAfterDragging.lat);
			var distance = MapEvent.determin_distance(target);
			//将距离写入地图中心图标的标题元素中
			$('#center figcaption').text(distance);
		}
	};
	/**
	 * @description 未导航搜索结果状态
	 * @param [retValue] 返回按钮的ALT值
     **/
	function view_detail(){
        var constant = GLOBAL.Constant;
		iframeObj.hide();		
		$('#gpsNaviCurrRoad,/* #emulatorNaviCurrRoad,*/#current_pos,#navi_menu_warp_left,#navi_menu_warp_right').hide();
        if($("#mark").css("display") == "block") //隐藏车道mark
            $("#mark").hide();
		//确保设终点等图片为显示状态
		$('#navi_menu_warp').show();
		$('#pull_back_btn img').attr({
			src: constant.src_ret,					
			alt: constant.alt_lower_left_button.ret_pre
		});
		$('#center img')
		.show()
		.attr({
		src: constant.target_img,
		alt: constant.alt_target
		})
		.parent()
		.show();

        //显示poi信息
        var poiInfo = GLOBAL.Constant.poi_search_result;
        $('#poi_current').text(poiInfo.name);
        var coord_target = new MMap.LngLat(poiInfo.lng, poiInfo.lat);
        //Event.mapObj.setCenter(coord_target);
        uiManager.mapSetCenter(coord_target);
        var distance = MapEvent.determin_distance(coord_target);
        //将距离写入地图中心图标的标题元素中,该搜索结果到自车的距离
        $('#center figcaption').text(distance);
        constant.centerAfterDragging = null;
        //MapEvent.add_current_overlay();
        Event.mapObj.setStatus({dragEnable:false});
        MapEvent.setZoom_17();

		$('#name, #poi_current').show();
        var detailBtn =$('#details[alt="详细按钮"]');
        detailBtn.show();
        if(!detailBtn.parent().is(':visible')) detailBtn.parent().show();
		$('#menu_first').attr({
			'src': constant.set_destination,
			'alt': '设终点按钮'	
		});
        var reach_time = $('#reach_time');//如果是导航状态并且旅行时间未显示，则显示旅行时间
        if(localStorage['tbt_state']=='true' && !reach_time.is(':visible')) $('#reach_time').show();
        
		$('.navi_menu li').slice(2, 5).show();
        $("#compassContainer").unbind();
        $('#compass').attr('src',function(index,src){
            return  'images/images/compass_gray.png';
        });
        localStorage['Navi_Compass_Mode'] = "NorthUp";
		scrollText();
	    function scrollText(){
			var $gr=$('#gpsNaviCurrRoad'),
			    $pc=$('#poi_current'),
                _p = 0;
			var oEle = $gr.is(':visible') ? $gr : $pc;
            var m_str = oEle.val();
//            console.log(m_str);
			 if(m_str.length>15){
				 oEle.css('text-align','left');
                 var intervalId = setInterval( function(){moveTxt();},500);
				function moveTxt(){
                    if (($('#iframeDiv').css("visibility")=="hidden") && _p <= m_str.length) {
                        oEle.val(m_str.substr(_p, m_str.length));
                        _p++;
                    }
                    else {
                        _p = 0;
                        oEle.val(m_str/*.substr(_p,m_str.length)*/);
                        clearInterval(intervalId);
                        oEle.css('text-align', 'center');
                    }
				}
			 }
		};
	};
	/**
	 * @description 双光柱页状态
     **/
	function lightCross_ui(){
		if ($('svg')[0]) {
			$('svg').show();
		}
		$('#gps,#right,#navi_menu_warp,.navi_menu,#shortcut,#navi_menu_warp_left,#navi_menu_warp_right,#map header,#center, #mark').hide();
		$('#light_cross_html').children().andSelf().show();
	};
	/**
	 * @description 路线详细页状态
	 * @param [config] 当前点对象
     **/
	function subsection_ui() {
        var constant = GLOBAL.Constant;
		iframeObj.hide();
		if($('#light_cross_html').is(':visible')){					
			$('#gps, .navi_menu, header,')
			.show();	
			$('#light_cross_html').hide();				
		}
		$('#reach_time').css('visibility', 'hidden');
		$('#right, #mark,#shortcut,#search,#center,#current_pos,#navi_menu_warp').add($('.navi_menu li').slice(2, 5)).add($('#name').find('div:not("#poi_current")')).hide();
		//$('#scale img').attr('src', "images/images/50m.png");//by Zhen Xia
        $("#compassContainer").unbind();
		$('#compass').attr('src',function(index,src){
				return  'images/images/compass_gray.png';
		 });
        localStorage['Navi_Compass_Mode'] = "NorthUp";
		$('#subsection,#navi_menu_warp_left,#navi_menu_warp_right,#poi_current').show();
        if($("#roadCrossPanel").css("display") == "block")
            $("#roadCrossPanel").addClass("none");
        if($("#mark").css("display") == "block")
            $("#mark").hide();
		$('#pull_back_btn img')
		.attr({
			src: constant.src_ret,					
			alt: constant.alt_lower_left_button.ret_pre
		})
	};
	/**
	 * @description 导航初始状态
     **/
	function naviInitialState(){
        var constant = GLOBAL.Constant,segRemainDist,routeRemainDist,routeRemainTime;
		iframeObj.remove();	
		$('svg').show();
		$('#pull_back_btn img').attr({src: 'images/images/menu_open.png',alt: '显示菜单栏'});
		//切换设终点按钮
		$('#menu_first').attr({src: 'images/images/main_menu.png',alt: '主菜单按钮'});
        constant.centerAfterDragging = null;
		/*$('#compass').attr('src','images/images/compass.png');*/
        $('#compassContainer').unbind().bind('click',thisPage.setCompass);
        thisPage.setMapWithCompassMode(localStorage['Navi_Compass_Mode']);
		//显示下一条道路所在元素		
		$('#navi_menu_warp_left,#navi_menu_warp_right,/*#emulatorNaviCurrRoad,*/#light_cross_html,#center,#subsection,#simulator,#details, #poi_current').hide();
		if(eval(localStorage['Map_tbt_conditions'])){
			$('#gps,#navi_menu_warp,.navi_menu,#current_pos,#right,#right li, header,#search,#shortcut,#reach_time,#mark').show();			
		}else{
			$('#gps,#navi_menu_warp,.navi_menu,#current_pos,#right,#right li:not(:last), header,#search,#shortcut,#reach_time,#mark').show();	
			$('#right li:last').hide();	
		}	
		$('#btn_main_page').hide();	
		$('#bg_light_cross').parent("a").show();
        if(constant.nav_obj.NavigationInfo != null){
            segRemainDist = Tab.unit_conversion(constant.nav_obj.NavigationInfo.nSegRemainDist, 1);
            routeRemainDist =  constant.nav_obj.NavigationInfo.nRouteRemainDist;
            routeRemainTime = constant.nav_obj.NavigationInfo.nRouteRemainTime;
        } else {
            segRemainDist = constant.nav_obj.firstSegLength;
            routeRemainDist = tbt.GetRouteLength();
            routeRemainTime = tbt.GetRouteTime();
        }

        $("#right figcaption").html(segRemainDist);
		$('#current_pos').text(constant.nav_obj.currentRoadName != null?constant.nav_obj.currentRoadName : constant.no_name_road);
		modify_lower_left_gps();							
		display_dynamic_bar();
		//设置导航状态预计到达时间面板显示状态，需调用tbt接口改写里面的值，这里只切换其显示状态
        GLOBAL.NavClass.updateTimeDistance({nRouteRemainDist:routeRemainDist,nRouteRemainTime:routeRemainTime},constant.nav_obj);
        $('#reach_time').css('visibility', 'visible');
        $('.navi_menu li').slice(2, 5).hide();
		$('#gpsNaviCurrRoad').text(constant.nav_obj.nextRoadName != null?constant.nav_obj.nextRoadName : constant.no_name_road);
		$('#name div')
		.hide()
		.filter('#gpsNaviCurrRoad')
		.show();		
		function modify_lower_left_gps() {
			var alt = $('#pull_back_btn img').attr('alt');
			if (alt == '收缩按钮') {
				$('#pull_back_btn img').attr({
					src: 'images/images/menu_open.png',
					alt: '显示菜单栏'
				});
			}
			else if (alt == constant.ret_map_ini) {
				$('#pull_back_btn img').attr({
					src: 'images/images/menu_close.png',
					alt: '收缩按钮'
				});
			}
		};
        _restoreLaneInfo();
	};
	/**
	 * @description 导航下全图浏览状态
     **/
	function full_figure() {
        var constant = GLOBAL.Constant;
		iframeObj.hide();
		$('#pull_back_btn img')		
		.attr({
			src: constant.src_ret,					
			alt: constant.alt_lower_left_button.ret_pre
		});
		$('#poi_current')
		.text('全图浏览')
		.show()
		.siblings()
		.hide();
        $("#compassContainer").unbind();
		$('#compass').attr('src',function(index,src){
				return  'images/images/compass_gray.png';
		 });
        localStorage['Navi_Compass_Mode'] = "NorthUp";
		$('#center,#subsection,#right, #search, #current_pos,#shortcut,#mark,#navi_menu_warp').hide();
		$('#reach_time').css('visibility', 'hidden');
        if($("#roadCrossPanel").css("display") == "block")
            $("#roadCrossPanel").addClass("none");
        if($("#mark").css("display") == "block")
            $("#mark").hide();
		$('#navi_menu_warp_left,#navi_menu_warp_right').show();	
		$('#gprs img').attr('src', 'images/images/gprs01.png');
		$('.navi_menu li').slice(2, 5).hide();				
	};
	/**
	 * @description 模拟导航状态
     **/
	function simulator_ui() {
		iframeObj.remove();
		$('#pull_back_btn img').attr({
			alt: GLOBAL.Constant.alt_lower_left_button.expand_simulator,
			src: 'images/images/menu_open.png'
		});
		$('#navi_menu_warp,#name div,#current_pos,#subsection,#center,#details').add($('.navi_menu li').slice(2, 5)).hide();
		$('#navi_menu_warp_left,#navi_menu_warp_right,#simulator,#gpsNaviCurrRoad,svg').show();

		if(eval(localStorage['Map_tbt_conditions'])){
			$('#gps,.navi_menu,#right,#right li, header,#search,#shortcut,#reach_time,#mark').show();			
		}else{
			$('#gps,.navi_menu,#right,#right li:not(:last), header,#search,#shortcut,#reach_time,#mark').show();	
			$('#right li:last').hide();	
		}	
		$('#btn_main_page').hide();	
		$('#bg_light_cross').parent("a").show();

		display_dynamic_bar();
		//设置导航状态预计到达时间面板显示状态，需调用tbt接口改写里面的值，这里只切换其显示状态
		$('#reach_time').css('visibility', 'visible');
        $('#compass').attr('src','images/images/compass.png');
        $('#compassContainer').unbind().bind('click',function(){
            thisPage.setCompass();
        } );
        _restoreLaneInfo();

	};	
	function display_dynamic_bar() {
		var bg_img = $('#bg_light_cross').css('background-image');
		var bg_light_new = bg_img.replace(/(.*bar_).*(?=km\.png)/, "$1" + localStorage['Map_tbt_view']);
		$('#bg_light_cross').css('background-image', bg_light_new);
       GLOBAL.NavClass.drawDynamicLightCross(GLOBAL.Constant.nav_obj);//初始化导航界面右侧光柱的值
	};
    //恢复显示车道信息，如果车道信息隐藏，则显示；如果保存有车道信息数据，但未显示，则显示车道信息
    function  _restoreLaneInfo() {
         var constant = window.GLOBAL.Constant;
        if($('#mark').html()!="") $('#mark').show();//车道信息隐藏
        else if(constant.nav_obj.laneInfo != null){//车道信息没有显示，恢复显示
            var iBackInfo = constant.nav_obj.laneInfo.iBackInfo, iSelectInfo = constant.nav_obj.laneInfo.iSelectInfo;
            GLOBAL.NavClass.addTrafficLaneIcon(iBackInfo, iSelectInfo)
        }
    };
    this.showLightBar = function(){
        display_dynamic_bar();
    };
    //设置自车mark在地图上的方向
    this.changeCarDirection = function(){
        var direction = localStorage['Map_direction'];
        if(typeof direction != "undefined")
            $('#current').css('-webkit-transform' , 'rotate('+ direction +'deg)');
    };
    this.mapPanTo = function(coord){
         Event.mapObj.panTo(coord);
         this.changeCarDirection();
    };
    this.mapSetCenter = function(coord){
        Event.mapObj.setCenter(coord);
       this.changeCarDirection();
    };
}
var uiManager=new UiManager();