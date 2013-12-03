if((localStorage['tbt_state'] != undefined) && (JSON.parse(localStorage['tbt_state']) || parent.window.GLOBAL.Constant.nav_obj.naviStatus.emulNaviStatus)){
	$('article').height('329px');
	$('#return_map').show();
}
$(function() {
    $('img[alt="返回按钮"],img[alt="返回地图按钮"]').live('click',function(){
        //双光柱，路线详细页返回
        var _event = parent.GLOBAL.Event,constant = parent.GLOBAL.Constant;
        if (!JSON.parse(localStorage['tbt_state']) && !constant.nav_obj.naviStatus.emulNaviStatus && !constant.nav_obj.bReroute) {
            _event.NGIStateManager.goToPreviousState(_event.NavScreenEvent.BackToLightCrossScreen);
        }
        else if($(this).attr('alt')=='返回地图按钮'){
            _event.NGIStateManager.returnToMapDirectly(_event.NavScreenEvent.showReturnToMapDirectlyScreen, {'backUrl': constant.NGIStatesURL.Map});
        }
        else{
            var nextState = _event.NGIStateManager.getNextState();//获取返回的状态
            var backUrl = constant.NGIStatesURL[nextState];
            _event.NGIStateManager.goToPreviousState(_event.NavScreenEvent.ShowPreviousScreen, {'backUrl': backUrl});
        }
    });
    parent.window.tbt.SelectRoute(localStorage['route_type']);
    var data = {
		xmlStr: parent.window.tbt.GetNaviGuideList(),
		callback: callback
	};
	//@deprecated ajax请求会造成跨域访问问题
	//$.getJSON('data.json', callback, 'xml');
	data.callback(data.xmlStr);
	function callback(data) {
        var constant = parent.window.GLOBAL.Constant;
		var obj = constant.icon_direction_sub;
		for (var len = data.length, i = len - 1 ; i >= 0; i --) {
			var list = data[i];
			list.ordinal = i + 1;
			var orient = list.directionIcon, 
				name = list.roadName || '无名道路', 
				distance = list.distance,
				lng = list.startLon,
				lat = list.startLat;
			//转换距离为米或千米，并加上单位
			distance = Tab.unit_conversion(distance, 1);			
			if (i == len - 1 ) {
				$('table').append('<tr><td></td><td class="long_bg"></td><td class="short_bg"></td></tr>');
				$('td:first').attr({
					'rowspan': len + 1,
					'id': 'action'
				});
                var destination =  GLOBAL.Common.LocalSave.read('NaviDestination');
				var config = {
                    //startLon: parent.window.Event.mapObj.getOverlays('target').position.lng,
                    //startLat: parent.window.Event.mapObj.getOverlays('target').position.lat,
                    startLon:destination.lng,
                    startLat:destination.lat,
                    roadName:destination.name,
                    ordinal:len + 1
                };

                if(parent.window.Event.NGIStateManager.getNextState() !== constant.NGIStates.LightCross)
                    $('tr:last td:eq(1)')
                    .text('目的地')
                    .click(closureItem(config));
                else
                    $('tr:last td:eq(1)')
                        .text('目的地');
			}
            
			$('table').append('<tr><td class="long_bg"></td><td class="short_bg"></td></tr>');
			//追加道路名称和距离
            if(parent.window.Event.NGIStateManager.getNextState() !== constant.NGIStates.LightCross)
                $('tr:last td:eq(0)')
			        .text(name)
			        .click(closureItem(list));
            else
                $('tr:last td:eq(0)')
                    .text(name);
			$('tr:last td:eq(1)').text(distance);
			$.each(obj, function(i, n) {
				if (orient == 0) {
					var bottom = $('table td:first img:last').css('margin-bottom');
					$('table td:first img:last').css('margin-bottom', parseInt(bottom) + 49);
					return false;	
				}
				if (parseInt(i) == orient && String(parseInt(i)).length == String(orient).length) {
					$('<img>', {
						src: n/*,
						id: orient*/
					})
					//方向图标追加到第一个表格内部
					.appendTo('td:first');
					return false;	
				}
			});
            var curSegIndex = -1;
            if(constant.nav_obj.NavigationInfo != null)
                curSegIndex = constant.nav_obj.NavigationInfo.nCurSegIndex || -1;
			if(curSegIndex != -1 && i == curSegIndex) break;//不显示已走过的路 by Zhen Xia
		}

		$('<img>', {
			'src': obj['1自车'],
			'id': 'current_car'
		}).appendTo('td:first');
	}
	//ui 设置滚动条相对顶部的偏移，始终显示当前自车所在路段 by Zhen Xia
    var height = $('article table').height();
	$('article').scrollTop(height);
	//解除mark及其背景图片点击闪动效果
	$('tr:first td:first, tr:first td:first img').off('mousedown mouseup');
	
	//工具函数，以闭包形式返回循环中的每项数据
	function closureItem(listItem) {
		return function() {
            var constant = GLOBAL.Constant,parentglobal = parent.window.GLOBAL;
			GLOBAL.Common.LocalSave.save('Map_seg_center', {
				lng : listItem.startLon,
				lat : listItem.startLat,
				name : listItem.roadName||constant.no_name_road,
				ordinal : listItem.ordinal 
			});
			if (typeof parentglobal.Constant.newSubsection=='undefined') {
                parentglobal.Constant.newSubsection=false;
			}
            parentglobal.Constant.newSubsection = !parentglobal.Constant.newSubsection;
            parentglobal.Event.NGIStateManager.goToNextState(constant.NGIStates.MapRoadSegment, parentglobal.Event.NavScreenEvent.showMapRoadSegmentScreen);
			
		}
	}
    if(-[1,]){
        var myScroll =  DragClass.create(document.getElementsByTagName('table')[0]);
    }
});