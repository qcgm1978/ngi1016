// JavaScript Document
$(function() {
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
    var navObj = parent.window.GLOBAL.Constant.nav_obj,config = GLOBAL.Common.LocalSave.read('NaviDestination'),navclass = parent.window.GLOBAL.NavClass ;
    //显示目的地名称，剩余距离和行驶时间
	$('header blockquote').text(config.name ||  GLOBAL.Constant.no_name_road);
	$('dt').text(Tab.unit_conversion(navObj.remain_metre ,1));
	 var miniute = navObj.tbt_remain_miniute;
	$('dd').text( GLOBAL.tools.formatMinute(miniute));

	//拼接光柱
    if (parent.window.tbt && parent.window.tbt.CreateTMCBar) {
        var config = {
            pass: navclass.getPathDistance(navObj) - navclass.getPathRemain(navObj),
            ken: navclass.getPathRemain(navObj)
        };
        var arrLight = parent.window.tbt.CreateTMCBar(config.pass, config.ken);
    }
    else {
        console.log('not find global object tbt or its property CreateTMCBar');
        return false;
    }

	arrLight = Tab.changeTmcLightCrossData(arrLight);
	var arg = {
		arr : arrLight,
		id : 'light_cross',
		total : parseInt($("#light_cross").width()),
		metric : 'width',
		address : 'url(images/'
	};
	var drawFullLightCross = new SimulatorLight(arg);
	var config = drawFullLightCross.generateArg();
	Tab.set_bg(config);
    
    //显示车在路上的相对位置
    var carlocation = (navclass.getPathRemain(navObj) / navclass.getPathDistance(navObj)) * arg.total;
    if(arg.total - carlocation <= 39 )
        carlocation =arg.total- 39; //TODO避免车出现在光柱的外面，39是图片的宽度（可以根据图片宽度自适应，但是需要先把图片加载上）
    else if(carlocation <= 39)
        carlocation = 39;
    else
        carlocation = parseInt(carlocation);//只取整数
    $("#light_cross").append("<img src = 'images/car_mark01.png' style='position:absolute;right:"+carlocation+"px'>");
});