/**
 * 收藏夹明细显示
 * @COPYRIGHT Shanghai RaxTone-Tech Co.,Ltd.
 * @Title: favoriteDetail.js
 * @Description: 收藏夹明细显示
 * @author chengpawang
 * @date 2012-4-23
 * @version V1.0
 * Modification History:
 */

$(function () {
    $('img[alt="返回按钮"],img[alt="返回地图按钮"]').live('click',function(){
        var _event = parent.GLOBAL.Event,nextState = _event.NGIStateManager.getNextState();//获取返回的状态
        var backUrl =parent.GLOBAL.Constant.NGIStatesURL[nextState];
        _event.NGIStateManager.goToPreviousState(_event.NavScreenEvent.ShowPreviousScreen, {'backUrl': backUrl});
    });
    GLOBAL.namespace("favoriteDetail");
    GLOBAL.favoriteDetail.favoriteService = new FavoriteService();

    // 加载收藏夹对应id数据
    GLOBAL.favoriteDetail.favoriteService.findById(parent.GLOBAL.Constant.favor_id, show);
    GLOBAL.favoriteDetail.updatePOIbyId = function (options) {
        var config = options.config;
        var successcb = options.successcb;
        var errorcb = options.errorcb;
        var ret = GLOBAL.favoriteDetail.favoriteService.updateById(config, successcb, errorcb);
        if (ret != -1)
            return true;
        else
            return false;
    };
    GLOBAL.favoriteDetail.deletePOIbyId = function (options) {
        var config = options.config;
        var successcb = options.successcb;
        var errorcb = options.errorcb;
        var ret = GLOBAL.favoriteDetail.favoriteService.deleteById(config, successcb, errorcb);
        if (ret != -1)
            return true;
        else
            return false;
    };
    // 在页面内添加收藏数据信息
    function show(tx, rs) {
        var constant = GLOBAL.Constant;
        if (rs) {
            var item = rs.rows.item(0);
            $('#name').val(GLOBAL.tools.isBlank(item.name) ? constant.null_value : item.name);
            $('#address').val(GLOBAL.tools.isBlank(item.address) ? constant.null_value : item.address);
            $('#tel').val(GLOBAL.tools.isBlank(item.tel) ? constant.null_value : item.tel);
        }
    }

    $("#name").bind("blur", function () {
        checkInput($(this), 30);
    });
    $("#address").bind("blur", function () {
        checkInput($(this), 30);
    });
    $("#tel").bind("blur", function () {
        checkInput($(this), 30);
    });

    // 绑定删除按钮事件

    $('#delete').click(function () {
        var config = {
            id:'msg_box_delete',
            pre:parent.window.GLOBAL.Constant.prompt_delete,
            callback:function() {
                var handler = function () {
                    location.href = 'type.html';
                }
                var options = {
                    favor_id:parent.GLOBAL.Constant.favor_id,
                    successHandler:handler,
                    errorHandler:handler,
                    favoriteService:GLOBAL.favoriteDetail.favoriteService
                };
                parent.window.GLOBAL.Event.NGIStateManager.goToPreviousState(GLOBAL.favoriteDetail.favoriteService.deleteById, options);
            }
        };
        GLOBAL.layer.deleteLayer(config);
    });

    // 绑定地图查看按钮事件
    $('#view_map').click(function () {
        var data;
        GLOBAL.favoriteDetail.favoriteService.findById(parent.GLOBAL.Constant.favor_id, function (tx, rs) {
            data = rs.rows.item(0);
            GLOBAL.Common.savePoiData(data);
        });
		if(typeof(parent.window.iframeObj)!='undefined'){
			var topWindow = parent.window;
//			GLOBAL.layer.retMainPage.resultDisplay(data,topWindow);
            parent.window.GLOBAL.Event.NGIStateManager.goToNextState(GLOBAL.Constant.NGIStates.MapWithPoi,parent.window.GLOBAL.Event.NavScreenEvent.showSearchResultInMapScreen,data);
        };
	});

    // 绑定设为目的地图片点击事件
    $('#set_destn').click(function () {
        GLOBAL.favoriteDetail.favoriteService.findById(parent.GLOBAL.Constant.favor_id, function (tx, rs) {
            var data = rs.rows.item(0);
            GLOBAL.Common.savePoiData(data);
            if (Tab.validate_poi()) {
                if (typeof(parent.window.iframeObj) != 'undefined') {
                    var topWindow = parent.window,_event = topWindow.GLOBAL.Event;
                    _event.NGIStateManager.returnToMapDirectly(_event.NavScreenEvent.showReturnToMapDirectlyScreen, {'backUrl': parent.GLOBAL.Constant.NGIStatesURL.Map});
                    topWindow.GpsNav.prepareRequestPath();
                }
            }
            else {
                var layer = new GLOBAL.layer({
                    id:'msg_box_fail',
                    msg:GLOBAL.Constant.prompt_doublication
                });
                layer.show();
                // 设为目的地按钮改为灰色图片，尚未提供图片
                // 代码写在这
            }
        });

    });
    // 绑定确定按钮点击事件
    $('#confirm').click(function () {
        //检查输入的字符长度
        if (!checkInput($("#name"), 50)) return;
        if (!checkInput($("#address"), 50)) return;
        if (!checkInput($("#tel"), 50)) return;

        // 修改数据库中的信息
        var handler = function () {
            location.href = 'type.html';
        };
        var options = {
            favor_id:parent.GLOBAL.Constant.favor_id,
            name:$('#name').val(),
            address:$('#address').val(),
            tel:$('#tel').val(),
            successHandler:handler,
            errorHandler:handler,
            favoriteService:GLOBAL.favoriteDetail.favoriteService
        };

        parent.window.GLOBAL.Event.NGIStateManager.goToPreviousState(GLOBAL.favoriteDetail.favoriteService.updateById, options);
    });

    /**
     * 检查输入，字数限制
     * @param o 要检查的对dom对象
     * @param maxLength 最大限制数
     */
    function checkInput(o, maxlength) {
        if ($.trim(o.val()).length > maxlength) {
            GLOBAL.layer.normal.show();
            $("#msg_box img[alt='确定按钮']").click(function () {
                GLOBAL.layer.normal.hide();
            });
            o.focus();
            return false;
        } else {
            return true;
        }
    }
});