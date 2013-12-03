$(function() {
	//初始化按钮选中状态
	var constant = GLOBAL.Constant;
	var showtmc = JSON.parse(localStorage['Map_tbt_display']),
		conditions = JSON.parse(localStorage['Map_tbt_conditions']), //path
        tmcReroute = JSON.parse(localStorage['TMCReroute']) ,
        tmcRerouteprompt = JSON.parse(localStorage['TMCReroutePrompt']),
        tmcBroadcast = JSON.parse(localStorage["TMCBroadcast"]);
    //选中按钮时更换图片src
    function disSelectButton(obj){
        obj.each(function(){
            var imgsrc = $(this).attr("src");
            var newsrc = imgsrc.replace(/_on(\.png)$/, '$1');
            if(newsrc == imgsrc)
                newsrc = imgsrc.replace(/_gray(\.png)$/, '$1');
            $(this).attr("src",newsrc);
        });

    }
    //撤销选中时按钮更换图片src
    function selectButton(obj){
        obj.each(function(){
            var imgsrc = $(this).attr("src");
            var newsrc = imgsrc.replace(/_gray(\.png)$/, '_on$1');
            if(newsrc == imgsrc)
                newsrc = imgsrc.replace(/(\.png)$/, '_on$1');
            $(this).attr("src",newsrc);
        });
    }
    //按钮不可用时采用灰化图片
    function disableButton(obj){
        obj.each(function(){
            var imgsrc = $(this).attr("src");
            var newsrc = imgsrc.replace(/_on(\.png)$/, '_gray$1');
            if(newsrc == imgsrc)
                newsrc = imgsrc.replace(/(\.png)$/, '_gray$1');
            $(this).attr("src",newsrc);
        });
    }
	//设置是否选中动态交通信息按钮
    if(!conditions){
        disSelectButton($('#path img'));
    }
	if (!showtmc) {
        disSelectButton($('#dynamic img'));
	}
    if (!tmcReroute) {
        disSelectButton($('#TMCReroute img'));
        disableButton($('#TMCReroutePrompt img'));
	}
    if (tmcReroute && !tmcRerouteprompt) {
        disSelectButton($('#TMCReroutePrompt img'));
	}
    if (!tmcBroadcast) {
        disSelectButton($('#TMCBroadcast img'));
	}

	//绑定返回按钮点击事件,对相关本地变量进行赋值，并返回上一级页面
	$('img[alt="返回按钮"],img[alt="返回地图按钮"]').click(function() {
        if(JSON.parse(localStorage['Map_tbt_display'])){
            parent.window.MapEvent.addTmc();
        }else{
            parent.window.MapEvent.removeTmc();
        }
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

	$('#path img').click(function(){
		if($(this).attr('src').match(/_on(\.png)$/)){
            disSelectButton($('#path img'));
            localStorage['Map_tbt_conditions'] = false;
		}else{
            selectButton($('#path img'));
            localStorage['Map_tbt_conditions'] = true;
		}
	});
    $('#dynamic img').click(function(){
        if($(this).attr('src').match(/_on(\.png)$/)){
            disSelectButton($('#dynamic img'));
            localStorage['Map_tbt_display'] = false;
        }else{
            selectButton($('#dynamic img'));
            localStorage['Map_tbt_display'] = true;
        }
    });
	$('#TMCReroute img').click(function(){
			if($(this).attr('src').match(/_on(\.png)$/)){
                disSelectButton($('#TMCReroute  img'));
                localStorage['TMCReroute'] = false;
                disableButton($('#TMCReroutePrompt  img'));
                $('#TMCReroutePrompt  img').unbind("click");
			}else{
                selectButton($('#TMCReroute img'));
                localStorage['TMCReroute'] = true;
                if(JSON.parse(localStorage['TMCReroutePrompt'])){
                    selectButton($('#TMCReroutePrompt img'));
                }else{
                    disSelectButton($('#TMCReroutePrompt img'));
                }
                $('#TMCReroutePrompt  img').click(function(){
                    ShowTMCReroutePrompt($(this));
                });
			}
	});
    if($('#TMCReroutePrompt  img').attr('src').match(/_gray(\.png)$/) == null){
        $('#TMCReroutePrompt  img').click(function(){
            ShowTMCReroutePrompt($(this));
        });
    }
    $('#TMCBroadcast img').click(function(){
			if($(this).attr('src').match(/_on(\.png)$/)){
                disSelectButton($('#TMCBroadcast  img'));
                localStorage["TMCBroadcast"] = false;
			}else{
                selectButton($('#TMCBroadcast  img'));
                localStorage["TMCBroadcast"] = true;
			}
	});
    function ShowTMCReroutePrompt(obj){
        if(obj.attr('src').match(/_on(\.png)$/)){
            disSelectButton($('#TMCReroutePrompt  img'));
            localStorage['TMCReroutePrompt'] = false;
        }else{
            selectButton($('#TMCReroutePrompt  img'));
            localStorage['TMCReroutePrompt'] = true;
        }
    }
	
});