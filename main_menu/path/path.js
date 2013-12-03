GLOBAL.namespace('PathOptions');
(function (Obj) {
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
    Obj.stopNavigation = function () {
        var constant = parent.window.GLOBAL.Constant;
        if (parent.window.iframeObj != undefined) {
            GLOBAL.layer.normal.hide();
            parent.window.iframeObj.remove();
            constant.nav_obj.StopEmulator();
            constant.nav_obj.StopGpsNavi();
            parent.window.ui.interface.iniState('mapIni');
            parent.window.MapEvent.deleteOverlays();
        }
        return true;
    }
})(GLOBAL.PathOptions);
$(function () {
    //绑定终止导航图标点击事件
    $('img[alt="终止导航"]')
        .click(function () {
            GLOBAL.layer.normal.show();
        })
        .mouseover(function () {
            $(this).css('cursor', 'pointer');
        });
    $('#msg_box').click(function (e) {
        $target = $(e.target);
        if ($target.attr('alt') == '是按钮') {
            parent.window.GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.Map, GLOBAL.PathOptions.stopNavigation);
        }
        if ($target.attr('alt') == '否按钮') {
            GLOBAL.layer.normal.hide();
        }

    });
    /**
     * @event 设置返程图标显示状态，绑定返程图标点击事件.
     */
    if (parent.window.GLOBAL.Constant.nav_obj.tbt_enable_ret && !parent.window.GLOBAL.Constant.nav_obj.naviStatus.emulNaviStatus) {
        $('img[alt="返程"]')
            .click(function () {
                /**
                 * @description 重置控制返程图标显示的本地变量，因为返程后是否继续显示返程需要重新计算导航的移动距离
                 */
                var constant = parent.window.GLOBAL.Constant;
                constant.poi_search_result = {
                    lng:constant.nav_obj.start.x,
                    lat:constant.nav_obj.start.y,
                    name:"",
                    tel:"",
                    address:""
                }
                if (typeof(parent.window.iframeObj) != 'undefined') {
                    parent.window.iframeObj.remove();
                    try {
                        parent.window.GpsNav.prepareRequestPath();
                    }
                    catch (e) {
                        TestClass.outputInfo(e.message);
                    }
                }
            });
    }
    else {
        var config = {
            ele:$('img[alt="返程"]'),
            attr:'src'
        };
        Tab.gray_img(config);
    }
    //绑定全图浏览图标点击事件
    $('img[alt="全图浏览"]')
        .click(function () {
            parent.GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.MapOverview, parent.window.GLOBAL.Event.NavScreenEvent.showMapOverviewScreen);
        })
        .mouseover(function () {
            $(this).css('cursor', 'pointer');
        });
    /**
     * @event 绑定分段浏览点击事件
     */
    $('img[alt="分段浏览"]')
        .click(function () {
            parent.window.GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.RoadSegInfo, parent.window.GLOBAL.Event.NavScreenEvent.showRoadSegInfoScreen);
        })
        .mouseover(function (e) {
            $(this).css('cursor', 'pointer');
        });

    /**
     * @event 绑定模拟导航图标点击事件,如果在模拟导航状态，不允许用户再次点击模拟导航，否则容易发生错误
     */
    var parentConstant = parent.GLOBAL.Constant;
    if(parentConstant.nav_obj.naviStatus.emulNaviStatus == true){
        var config = {
            ele:$('img[alt="模拟导航"]'),
            attr:'src'
        };
        Tab.gray_img(config);
    }
    else{
        $('img[alt="模拟导航"]')
        .click(function () {
            parent.window.GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.Navigation, parent.window.GLOBAL.Event.NavScreenEvent.showEmulatorScreen);
        })
        .mouseover(function (e) {
            $(this).css('cursor', 'pointer');
        });
    }

});
