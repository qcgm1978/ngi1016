//var constant = GLOBAL.Constant,
	tbtConst = [
        localStorage['Map_system_style'],
        localStorage['Map_system_prompt'],
        localStorage['Map_system_eye'],
        localStorage['Map_system_volume'],
        localStorage['Map_system_voice']
	];
// 初始化页面设置

$('article img').attr('class', function(index,attr) {
	//地图风格和语音提示
	switch(attr) {
		case tbtConst[0]:
		case tbtConst[1]: {
			$(this).attr('src',function(index,src){
				return src.replace(/(\.png)/,'_on$1');
			});
		}
	}
	//电子眼提示
	if (attr === 'eye' && eval(tbtConst[2])) {
		$(this).attr('src',function(index,src){
			return src.replace(/(\.png)/,'_on$1');
		});
	}
	//音量设定
	/*if(!eval(tbtConst[4])){
		$('#volume').css('visibility','hidden');
	}else{
		var src = $('#volume').attr('src');
		src = src.replace(/\d{2}/, tbtConst[3]);
		$('#volume').attr('src', src);
	}*/
});



//使用事件委托，监视article元素点击事件，根据被点击图片的class属性值进行判定处理
$('article').on('click', 'img', function(e) {
	var $target = $(e.target);
	var class_target = $target.attr('class');
	
	//$('.' + class_target).mousedown();
    switch(class_target) {
        case "daytime":{
            if(!$target.attr('src').match(/_on\.png$/)){
                $target.parent().find('img').attr('src',function(index,src){
                    return src.replace(/(\.png)/,'_on$1');
                });
                $target.parent().siblings().find('img').attr('src',function(index,src){
                    return src.replace(/_on(\.png)/,'$1');
                });
            }

            localStorage['Map_system_style'] = 'daytime';
        };
            break;
        case 'night':{
            if(!$target.attr('src').match(/_on\.png$/)){
                $target.parent().find('img').attr('src',function(index,src){
                    return src.replace(/(\.png)/,'_on$1');
                });
                $target.parent().siblings().find('img').attr('src',function(index,src){
                    return src.replace(/_on(\.png)/,'$1');
                });
            }
            localStorage['Map_system_style'] = 'night';
        };
            break;
        case 'switcher': {
            if(!$target.attr('src').match(/_on\.png$/)){
                $target.parent().find('img').attr('src',function(index,src){
                    return src.replace(/(\.png)/,'_on$1');
                });
                $target.parent().siblings().find('img').attr('src',function(index,src){
                    return src.replace(/_on(\.png)/,'$1');
                });
            }
            localStorage['Map_system_style'] = 'switcher';
        };
            break;
        case 'concise':
            if(!$target.attr('src').match(/_on\.png$/)){
                $target.parent().find('img').attr('src',function(index,src){
                    return src.replace(/(\.png)/,'_on$1');
                });
                $target.parent().siblings().find('img').attr('src',function(index,src){
                    return src.replace(/_on(\.png)/,'$1');
                });
            }
            localStorage['Map_system_prompt'] = 'concise';
            break;
        case 'detailed': {
            if(!$target.attr('src').match(/_on\.png$/)){
                $target.parent().find('img').attr('src',function(index,src){
                    return src.replace(/(\.png)/,'_on$1');
                });
                $target.parent().siblings().find('img').attr('src',function(index,src){
                    return src.replace(/_on(\.png)/,'$1');
                });
            }
            localStorage['Map_system_prompt'] = 'detailed';
        }
            break;
        case 'eye': {
            var bool = !!$target.attr('src').match(/_on\.png$/);
            localStorage['Map_system_eye'] = !bool;
			if(typeof tbt !="undefined")
				tbt.SetEleyePrompt(localStorage['Map_system_eye']=="true"?1:0);
            if(bool){
                $target.parent().find('img').attr('src',function(index,src){
                    return src.replace(/_on(\.png)/,'$1');
                });
            }else{
                $target.parent().find('img').attr('src',function(index,src){
                    return src.replace(/(\.png)/,'_on$1');
                });
            }
        }
            break;
        //点击静音按钮
       /* case 'mute': {
            if (!$target.attr('src').match(/_on/)) {
                $('.heighten, .lower')
                    .attr('src', function(index, attr) {
                        if (!attr.match(/_gray/)) {
							if(attr.match(/_on/)){
								attr = attr.replace(/_on(\.png)$/, '_gray$1');
							}else{
								 attr = attr.replace(/(\.png)$/, '_gray$1');
							}                           
                            return attr;
                        }
                    })
                    .off();
                $('.mute').attr('src',function(index,src){
                    return src.replace(/(\.png)/,'_on$1');
                });
                $('#volume').css('visibility','hidden');
                localStorage['Map_system_voice'] = false;
            }
            else {
                $('.heighten, .lower').attr('src', function(index, attr) {
                    attr = attr.replace(/_gray(\.png)$/, '_on$1');
                    return attr;
                });
                $('.lower').click(lower_click);
                $('.heighten').click(heighten_click);
                $('.mute').attr('src',function(index,src){
                    return src.replace(/_on(\.png)/,'$1');
                });
                $('#volume').css('visibility','visible');
                localStorage['Map_system_voice'] = true;
            }
            break;
        }*/

        default : {
            console.log('no get correct value');
        }
    };
});
//放大、缩小音量按钮点击事件,不适用事件委托，否则解除绑定的off()事件无效，不知是否有其他解决方法
//音量选择,不支持拖动
/*
$('.lower').click(lower_click);
function lower_click() {
			var num = $('#volume').attr('src').match(/\d{2}/)[0];
			num = (num === '00' ? num : ('0' + (num - 1)));
			var src = $('#volume').attr('src').replace(/\d{2}/, num);
			$('#volume').attr('src', src);
			localStorage['Map_system_volume'] = num; 
			
			if (num === '00') {
				$(this)
				.attr('src', "images/volume_down_gray.png");
			}
			$('.heighten').attr('src', "images/volume_up.png");
}
		
$('.heighten').click(heighten_click);
function heighten_click() {
			var num = $('#volume').attr('src').match(/\d{2}/)[0];
			num = (num === '10' || num === '09' ? '10' : ('0' + (Number(num) + 1)));
			var src = $('#volume').attr('src').replace(/\d{2}/, num);
			$('#volume').attr('src', src);
			localStorage['Map_system_volume'] = num; 
			if (num === '10') {
				$(this)
				.attr('src', "images/volume_up_gray.png");
			}
			$('.lower').attr('src', "images/volume_down.png");
}

//是否静音,放置在绑定事件语句之后，off()语句才能解除绑定
if (!eval(tbtConst[4])) {
	$('.mute').attr('src',function(index,src){
				return src.replace(/(\.png)/,'_on$1');
			});
	$('.heighten, .lower').off();
	$('.heighten, .lower')
	.attr('src', function(index, attr) {
		if (!attr.match(/_gray/)) {
			attr = attr.replace(/(\.png)$/, '_gray$1');
			return attr;					
		}
	});
}*/
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