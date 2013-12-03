// JavaScript Document

$(function() {
	$('img[alt="出厂设置"]').click(function() {
		GLOBAL.layer.normal.show();		
		$('img[alt="恢复设置确定按钮"]').click(function() {
			//恢复出厂设置
			$.each(system_ini, function(i, n) {
				localStorage[i] = n;
			});
            GLOBAL.layer.normal.hide();
            var pt = new parent.MMap.LngLat(localStorage['Map_lng'],localStorage['Map_lat']);
            parent.Event.mapObj.getOverlays('current').setPosition(pt);//修改自车位置
            parent.GLOBAL.Event.NavScreenEvent.initTrafficMessageBubbles();//初始化情报板开关状态
		});
		$('img[alt="取消按钮"]').click(function() {
			GLOBAL.layer.normal.hide();
		});
	});	 
	$('td img[alt="GPS信息"]').click(function(){
		parent.GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.GpsInfo, showGpsInfoScreen);
	});
	$('td img[alt="版本信息"]').click(function(){
		parent.GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.VersionInfo, showVersionInfoScreen);
	});
	//显示gps信息界面
	function showGpsInfoScreen(){
	    location.href = 'gps.html';
	    return true;
	}
	//显示版本信息界面
	function showVersionInfoScreen(){
	    location.href='version.html';
		return true;
	}
	//显示图例说明界面
	function showTrafficLegendScreen(){
	    location.href = 'legend.html';
	    return true;
	}
    $('img[alt="返回按钮"],img[alt="返回地图按钮"]').live('click',function(){
        var _event = parent.GLOBAL.Event;
        if($(this).attr('alt')=='返回地图按钮'){
            _event.NGIStateManager.returnToMapDirectly(_event.NavScreenEvent.showReturnToMapDirectlyScreen, {'backUrl': parent.GLOBAL.Constant.NGIStatesURL.Map});
        }
        else{
            var nextState = _event.NGIStateManager.getNextState();//获取返回的状态
            var backUrl =parent.GLOBAL.Constant.NGIStatesURL[nextState];
            _event.NGIStateManager.goToPreviousState(_event.NavScreenEvent.ShowPreviousScreen, {'backUrl': backUrl});
        }
    });
});