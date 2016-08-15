'use strict';
mode.tafang={
	canvasUpdates2:[],
	importChess:{
		element:{
			card:['moveTo'],
			player:['createRangeShadow','move']
		}
	},
	start:function(){
		"step 0"
		game.loadMode('chess');
		"step 1"
		for(var i in result.element){
			for(var j in result.element[i]){
				if(j!='dieAfter'){
					lib.element[i][j]=result.element[i][j];
				}
			}
		}
		for(var i in lib.skill){
			if(lib.skill[i].changeSeat){
				lib.skill[i]={};
				if(lib.translate[i+'_info']){
					lib.translate[i+'_info']='此模式下不可用';
				}
			}
		}
		lib.init.css(lib.assetURL+'layout/mode','chess');
		ui.chesssheet=document.createElement('style');
		document.head.appendChild(ui.chesssheet);
		var playback=localStorage.getItem(lib.configprefix+'playback');
		lib.mechlist=[];
        for(var i in lib.characterPack.mode_tafang){
            if(i.indexOf('chess_mech_')==0){
                lib.mechlist.push(i);
            }
            lib.character[i]=lib.characterPack.mode_tafang[i];
            if(!lib.character[i][4]){
                lib.character[i][4]=[];
            }
        }
		ui.create.cards();
		game.finishCards();
		ui.chessContainer=ui.create.div('#chess-container',ui.arena);
		lib.setScroll(ui.chessContainer);
		ui.chess=ui.create.div('#chess',ui.chessContainer);
		ui.canvas2=document.createElement('canvas');
		ui.canvas2.id='canvas2';
		ui.chess.appendChild(ui.canvas2);
		ui.ctx2=ui.canvas2.getContext('2d');
		game.me=ui.create.player();
		if(playback){
			for(var i in lib.characterPack){
				for(var j in lib.characterPack[i]){
					lib.character[j]=lib.character[j]||lib.characterPack[i][j];
				}
			}
			game.pause();
			ui.system.style.display='none';
			_status.playback=playback;
			localStorage.removeItem(lib.configprefix+'playback');
			var store=lib.db.transaction(['video'],'readwrite').objectStore('video');
			store.get(parseInt(playback)).onsuccess=function(e){
				if(e.target.result){
					event.video=e.target.result.video;
					game.resume();
				}
				else{
					alert('播放失败：找不到录像');
					game.reload();
				}
			}
		}
		_status.mylist=[];
        _status.enemylist=[];
		"step 2"
		ui.arena.classList.add('chess');
		var mylistmap,enemylistmap;
		if(event.video){
			var videocontent;
			for(var ii=0;ii<event.video.length;ii++){
				if(event.video[ii].type=='init'){
					videocontent=event.video[ii].content;
					break;
				}
			}
			mylistmap=[];
			enemylistmap=[];
			for(var i=0;i<videocontent.length;i++){
				if(videocontent[i].lord){
					_status.lord=videocontent[i].name;
				}
				if(videocontent[i].identity=='friend'){
					_status.mylist.push(videocontent[i].name);
					mylistmap.push(videocontent[i].position);
				}
				else{
					_status.enemylist.push(videocontent[i].name);
					enemylistmap.push(videocontent[i].position);
				}
			}
			game.playerMap=lib.posmap;
		}
		ui.chesswidth=parseInt(get.config('tafang_size'));
		ui.chessheight=11;
		ui.chess.style.height=148*ui.chessheight+'px';
		ui.chess.style.width=148*ui.chesswidth+'px';
		if(!lib.config.touchscreen){
			ui.chess.addEventListener('mousedown',function(e){
				if(Array.isArray(e.path)){
					for(var i=0;i<e.path.length;i++){
						var itemtype=get.itemtype(e.path[i]);
						if(itemtype=='button'||itemtype=='card'||itemtype=='player'){
							return;
						}
					}
				}
				this._chessdrag=[e,this.parentNode.scrollLeft,this.parentNode.scrollTop];
			});
			ui.chess.addEventListener('mouseleave',function(){
				this._chessdrag=null;
			});
			ui.chess.addEventListener('mouseup',function(){
				if(this._chessdrag){
					this._chessdrag=null;
				}
			});
			ui.chess.addEventListener('mousemove',function(e){
				if(this._chessdrag){
					this.parentNode.scrollLeft=this._chessdrag[1]-e.x+this._chessdrag[0].x;
					this.parentNode.scrollTop=this._chessdrag[2]-e.y+this._chessdrag[0].y;
					_status.clicked=true;
				}
				e.preventDefault();
			});
			ui.chessContainer.addEventListener('mousewheel',function(){
				if(_status.currentChessFocus){
					clearInterval(_status.currentChessFocus);
					delete _status.currentChessFocus;
				}
			});
		}

		ui.chessscroll1=ui.create.div('.chessscroll.left',ui.chessContainer);
		ui.chessscroll2=ui.create.div('.chessscroll.right',ui.chessContainer);
		var chessscroll=function(){
			if(lib.config.touchscreen) return;
			var direction=this.direction;
			var speed=parseInt(get.config('chessscroll_speed'));
			if(!speed) return;
			var interval=setInterval(function(){
				ui.chessContainer.scrollLeft+=speed*direction;
			},16);
			_status.chessscrolling=interval;
		};
		var leavescroll=function(){
			if(_status.chessscrolling){
				clearInterval(_status.chessscrolling);
				delete _status.chessscrolling;
			}
		};
		ui.chessscroll1.direction=-1;
		ui.chessscroll1.addEventListener('mouseenter',chessscroll);
		ui.chessscroll1.addEventListener('mouseleave',leavescroll);

		ui.chessscroll2.direction=1;
		ui.chessscroll2.addEventListener('mouseenter',chessscroll);
		ui.chessscroll2.addEventListener('mouseleave',leavescroll);

		for(var i=0;i<ui.chesswidth;i++){
			for(var j=0;j<ui.chessheight;j++){
				var pos='[data-position="'+(i+j*ui.chesswidth)+'"]';
				ui.chesssheet.sheet.insertRule('#arena.chess #chess>.player'+pos+
				'{left:'+(14+i*148)+'px;top:'+(14+j*148)+'px}',0);
				ui.chesssheet.sheet.insertRule('#arena.chess #chess>.card'+pos+
				'{left:'+(22+i*148)+'px;top:'+(22+j*148)+'px}',0);
				ui.chesssheet.sheet.insertRule('#arena.chess #chess>.popup'+pos+
				'{left:'+(19+i*148)+'px;top:'+(142+j*148)+'px}',0);
			}
		}

		var grids=[];
		var gridnum=ui.chessheight*ui.chesswidth;
		for(var i=0;i<gridnum;i++){
			grids.push(i);
		}
		event.obs=[];
		if(!event.video){
			var tafanglist=[0,2,3,5,6,8,9,11,12];
			for(var i=0;i<ui.chessheight-1;i++){
				for(var j=0;j<ui.chesswidth;j++){
					if(i>=8&&j!=0&&j!=ui.chesswidth-1) continue;
					if(tafanglist.contains(j)){
						var cg=i*ui.chesswidth+j;
						grids.remove(cg);
						game.addObstacle(cg.toString(),false);
						event.obs.push(cg.toString());
					}
				}
			}
			for(var i=0;i<ui.chesswidth;i++){
				switch(ui.chesswidth){
					case 6:if(i==2||i==3) continue;break;
					case 9:if(i==3||i==4||i==5) continue;break;
					case 12:if(i==4||i==5||i==6||i==7) continue;break;
				}
				var cg=(ui.chessheight-1)*ui.chesswidth+i;
				grids.remove(cg);
				game.addObstacle(cg.toString(),false);
				event.obs.push(cg.toString());
			}
		}
		_status.enemyCount=0;
		_status.friendCount=0;

		lib.setPopped(ui.create.system('手牌',null,true),function(){
			var uiintro=ui.create.dialog('hidden');
			var added=false;
			for(var i=0;i<game.players.length;i++){
				if(game.players[i].side==game.me.side&&game.players[i]!=game.me){
					added=true;
					uiintro.add(get.translation(game.players[i]));
					var cards=game.players[i].get('h');
					if(cards.length){
						uiintro.addSmall(cards,true);
					}
					else{
						uiintro.add('（无）');
					}
				}
			}
			if(!added){
				uiintro.add('无队友');
			}
			return uiintro;
		},220);

		ui.create.me();
		ui.create.fakeme();

		ui.chessinfo=ui.create.div('.fakeme.player',ui.me,function(e){
			e.stopPropagation();
		});
		lib.setScroll(ui.chessinfo);

		game.arrangePlayers();
		"step 3"
		ui.control.style.display='';
		if(event.video){
			game.playVideoContent(event.video);
			game.setChessInfo();
			return;
		}
		_status.videoInited=true;
		game.addVideo('init',null,[]);
		if(game.friendZhu){
			game.addVideo('identityText',game.friendZhu,'将');
			game.addVideo('identityText',game.enemyZhu,'帅');
			if(game.friendViceZhu){
				game.addVideo('identityText',game.friendViceZhu,'仕');
				game.addVideo('identityText',game.enemyViceZhu,'士');
			}
		}
		if(event.obs){
			game.addVideo('initobs',null,event.obs);
		}

		ui.me.querySelector('.fakeme.player').hide();
		ui.me.querySelector('.fakeme.avatar').hide();

		var list=[];
		for(i in lib.character){
			if(i.indexOf('treasure_')==0) continue;
			if(i.indexOf('chess_mech_')==0) continue;
			if(lib.character[i][4].contains('minskin')) continue;
			if(lib.config.forbidchess.contains(i)) continue;
			if(lib.character[i][4].contains('boss')) continue;
			if(lib.filter.characterDisabled(i)) continue;
			list.push(i);
		}
		list.randomSort();
		_status.characterList=list;
		_status.friends=[];
		_status.enemies=[];
		_status.turnCount=0;
		_status.turnTotal=parseInt(get.config('tafang_turn'));
		ui.turnCount=ui.create.system('',null,true);
		_status.remainingCount=0;

		_status.tafangend=[];
		for(var i=0;i<ui.chesswidth;i++){
			var tafangdes=ui.chesswidth*(ui.chessheight-1)+i;
			if(!lib.posmap[tafangdes]){
				_status.tafangend.push(tafangdes.toString());
			}
		}
        _status.gameStarted=true;
		game.phaseLoopTafang();
	},
	element:{
		player:{
			dieAfter:function(source){
				var player=this;
				if(_status.friends){
					_status.friends.remove(this);
				}
				if(_status.enemies){
					_status.enemies.remove(this);
				}
				delete lib.posmap[player.dataset.position];
				setTimeout(function(){
					player.delete();
				},500);
				for(var i=0;i<ui.phasequeue.length;i++){
					if(ui.phasequeue[i].link==player){
						ui.phasequeue[i].remove();
						ui.phasequeue.splice(i,1);
						break;
					}
				}
				if(player==game.me){
					for(var i=0;i<game.players.length;i++){
						if(game.players[i].side==player.side){
							game.modeSwapPlayer(game.players[i]);
						}
					}
				}
				if(_status.friends.length==0&&ui.fakeme){
					ui.fakeme.hide();
					this.node.handcards1.delete();
					this.node.handcards2.delete();
					game.me=ui.create.player();
					game.me.side=false;
					game.addVideo('removeTafangPlayer');
				}
			},
		},
	},
	game:{
		minskin:true,
		singleHandcard:true,
		chess:true,
		treasures:[],
		obstacles:[],
		getVideoName:function(){
			return [get.translation(game.me.name),'塔防'];
		},
		addChessPlayer:function(name,enemy,num,pos){
			if(typeof num!='number'){
				num=4;
			}
			var player=ui.create.player();
			player.getId();
			if(enemy=='treasure'){
				player.animate('judgestart');
				player.side=null;
				player.identity='neutral';
				player.setIdentity();
				player.node.identity.dataset.color='zhong';
				player.classList.add('treasure');
				player.life=6+Math.floor(Math.random()*6);
				game.treasures.add(player);
			}
			else{
				player.animate('start');
				if(enemy){
					player.side=true;
					player.setIdentity('enemy');
					player.identity='enemy';
				}
				else{
					player.side=false;
					player.setIdentity('friend');
					player.identity='friend';
				}
				player.node.identity.dataset.color=get.translation(player.side+'Color');
				game.players.push(player);
				// if(lib.config.animation){
				// 	setTimeout(function(){
				// 		player.$rare2();
				// 	},300);
				// }
			}
			ui.chess.appendChild(player);
			if(_status.video||(pos&&!lib.posmap[pos])){
				player.dataset.position=pos;
			}
			else{
				var grids=[];
				var gridnum=ui.chessheight*ui.chesswidth;
				for(var i=0;i<gridnum;i++){
					grids.push(i);
				}
				for(var i=0;i<game.players.length;i++){
					grids.remove(parseInt(game.players[i].dataset.position));
				}
				for(var i=0;i<game.obstacles.length;i++){
					grids.remove(parseInt(game.obstacles[i].dataset.position));
				}
				for(var i=0;i<game.treasures.length;i++){
					grids.remove(parseInt(game.treasures[i].dataset.position));
				}
				player.dataset.position=grids.randomGet();
			}
			lib.posmap[player.dataset.position]=player;
			game.addVideo('addChessPlayer',null,[name,enemy,num,player.dataset.position]);
			player.init(name);
			if(num&&!_status.video){
				player.directgain(get.cards(num));
			}
			game.arrangePlayers();
			player.chessFocus();
			if(game.me&&game.me.name){
				game.setChessInfo();
			}
			else if(game.players.length){
				game.setChessInfo(game.players[0]);
			}

			return player;
		},
		addObstacle:function(x,y){
			if(y!==false){
				game.addVideo('addObstacle',null,[x,y]);
			}
			var pos;
			if(typeof x=='string'){
				pos=x;
			}
			else{
				if(x>=ui.chesswidth){
					x=ui.chesswidth-1;
				}
				if(y>=ui.chessheight){
					y=ui.chessheight-1;
				}

				pos=y*ui.chesswidth+x;
			}
			if(!lib.posmap[pos]){
				var grid=ui.create.div('.player.minskin.obstacle',ui.chess).animate('start');
				grid.dataset.position=pos;
				grid.listen(ui.click.obstacle);
				lib.posmap[pos]=grid;
				game.obstacles.push(grid);
			}
		},
		removeObstacle:function(pos){
			var node=lib.posmap[pos];
			if(node&&game.obstacles.contains(node)){
				game.addVideo('removeObstacle',null,pos);
				game.obstacles.remove(node);
				delete lib.posmap[pos];
				node.delete();
			}
		},
		addOverDialog:function(dialog){
			dialog.classList.add('center');
		},
		phaseLoopTafang:function(){
			var next=game.createEvent('phaseLoop');
			next.setContent(function(){
				'step 0'
				_status.turnCount++;
				ui.turnCount.innerHTML='回合'+get.cnNumber(_status.turnCount,true);
				var dialog=ui.create.dialog('剩余行动点：'+(10+_status.remainingCount),'hidden');
				dialog.style.height='260px';
				dialog.style.top='calc(50% - 140px)';
				dialog.classList.add('center');
				dialog.classList.add('noupdate');
				event.dialog=dialog;
				var list=_status.characterList.splice(0,6);
				var map={};
				map.bufang=ui.create.buttons(lib.mechlist,'character',dialog.content);
				var difficulty=parseInt(get.config('tafang_difficulty'));
				for(var i=0;i<map.bufang.length;i++){
					var button=map.bufang[i];
					button.node.name.style.top='8px';
					button.node.intro.classList.add('showintro');
					button.node.intro.classList.add('tafang');
					if(button.link=='chess_mech_nengliangqiu'||
						button.link=='chess_mech_guangmingquan'||
						button.link=='chess_mech_jiguanren'){
						button.count=difficulty+1;
						button.node.intro.innerHTML=get.cnNumber(button.count,true);
					}
					else{
						button.count=difficulty+2;
						button.node.intro.innerHTML=get.cnNumber(button.count,true);
					}
					button._link='布防';
				}
				map.zhaomu=ui.create.buttons(list,'character',dialog.content);
				for(var i=0;i<map.zhaomu.length;i++){
					var button=map.zhaomu[i];
					button.node.intro.classList.add('showintro');
					button.node.intro.classList.add('tafang');
					button.count=difficulty+4;
					button.node.intro.innerHTML=get.cnNumber(button.count,true);
					button._link='招募';
				}
				if(_status.friends.length){
					map.xingdong=ui.create.buttons(_status.friends,'player',dialog.content);
					for(var i=0;i<map.xingdong.length;i++){
						var button=map.xingdong[i];
						button.node.intro.classList.add('showintro');
						button.node.intro.classList.add('tafang');
						if(difficulty<2){
							button.count=1;
						}
						else{
							button.count=2;
						}
						button.node.intro.innerHTML=get.cnNumber(button.count,true);
						button._link='行动';
					}
				}
				else{
					map.xingdong=[];
				}
				var updateSelected=function(){
					var count=10+_status.remainingCount;
					var selected=dialog.querySelectorAll('.button.selected');
					var selectedZhaomu=0;
					for(var i=0;i<selected.length;i++){
						count-=selected[i].count;
						if(selected[i]._link=='招募'){
							selectedZhaomu++;
						}
					}
					for(var i in map){
						for(var j=0;j<map[i].length;j++){
							map[i][j].classList.remove('unselectable');
							if(map[i][j].count>count){
								map[i][j].classList.add('unselectable');
							}
							else if(i=='zhaomu'&&_status.friends.length+selectedZhaomu>=ui.chesswidth){
								map[i][j].classList.add('unselectable');
							}
							else if(i=='bufang'){
								var numbufang=0;
								for(var k=0;k<game.treasures.length;k++){
									if(game.treasures[k].name==map[i][j].link){
										numbufang++;
									}
									if(numbufang>=3){
										map[i][j].classList.add('unselectable');
										break;
									}
								}
							}
						}
					}
					ui.dialog.content.firstChild.innerHTML='剩余行动点：'+count;
				}
				var clickOrder=0;
				event.custom.replace.button=function(button){
					if(!button.classList.contains('unselectable')||
						button.classList.contains('selected')){
						button.classList.toggle('selected');
						button._clickOrder=clickOrder++;
					}
					updateSelected();
				}
				event.custom.add.window=function(clicked){
					if(clicked) return;
					if(event.step>1) return;
					for(var i in map){
						for(var j=0;j<map[i].length;j++){
							map[i][j].classList.remove('selected');
							map[i][j].classList.remove('unselectable');
						}
					}
					updateSelected();
				}
				var update=function(link){
					for(var i in map){
						for(var j=0;j<map[i].length;j++){
							if(map[i][j]._link!=link){
								map[i][j].style.display='none';
							}
							else{
								map[i][j].style.display='';
							}
						}
					}
					for(var i=0;i<event.control.childNodes.length;i++){
						if(event.control.childNodes[i].innerHTML==link){
							event.control.childNodes[i].classList.add('thundertext');
						}
					}
					_status.lastTafangCommand=link;
				}
				event.control=ui.create.control('布防','招募','行动',function(link,node){
					if(link=='行动'&&_status.friends.length==0) return;
					if(link=='招募'&&_status.friends.length>=ui.chesswidth) return;
					var current=node.parentNode.querySelector('.thundertext');
					if(current==node) return;
					if(current){
						current.classList.remove('thundertext');
					}
					update(link);
				});
				if(!_status.friends.length){
					event.control.lastChild.style.opacity=0.5;
					if(_status.lastTafangCommand=='行动'){
						_status.lastTafangCommand='招募';
					}
				}
				if(_status.friends.length>=ui.chesswidth){
					event.control.childNodes[1].style.opacity=0.5;
					if(_status.lastTafangCommand=='招募'){
						_status.lastTafangCommand='行动';
					}
				}
				_status.imchoosing=true;
				ui.auto.hide();
				var eventdong=function(){
					var selected=dialog.querySelectorAll('.button.selected');
					event.bufang=[];
					event.zhaomu=[];
					event.xingdong=[];
					var xingdongs=[];
					_status.remainingCount+=10;
					for(var i=0;i<selected.length;i++){
						switch(selected[i]._link){
							case '布防':event.bufang.push(selected[i].link);break;
							case '招募':event.zhaomu.push(selected[i].link);break;
							case '行动':xingdongs.push(selected[i]);break;
						}
						_status.remainingCount-=selected[i].count;
					}
					_status.remainingCount=Math.ceil(_status.remainingCount/2);
					xingdongs.sort(function(a,b){
						return a._clickOrder-b._clickOrder;
					});
					for(var i=0;i<xingdongs.length;i++){
						event.xingdong.push(xingdongs[i].link);
					}
					game.resume();
				};
				event.done=ui.create.control('完成',eventdong);
				if(_status.lastTafangCommand){
					update(_status.lastTafangCommand);
				}
				else{
					update('招募');
				}
				if(_status.characterList.length<6){
					game.over(true);
					event.done.close();
					event.control.close();
					return;
				}
				setTimeout(function(){
					dialog.open();
					updateSelected();
				},50);
				event.switchToAuto=eventdong;
				if(!_status.auto){
					game.pause();
				}
				else{
					eventdong();
				}
				'step 1'
				event.dialog.close();
				event.control.close();
				event.done.close();
				delete event.dialog;
				delete event.control;
				delete event.done;
				'step 2'
				event.chooseObstacle=false;
				if(event.bufang.length){
					event.obstacles=game.obstacles.slice(0);
					for(var i=0;i<event.obstacles.length;i++){
						event.obstacles[i].classList.add('glow');
					}
					event.chooseObstacle=true;
					event.currentBufang=event.bufang.shift();
					event.dialog=ui.create.dialog('选择一个位置放置【'+get.translation(event.currentBufang)+'】');
					if(!_status.auto){
						game.pause();
					}
					else{
						event.obstacle=event.obstacles.randomGet();
					}
					event.switchToAuto=function(){
						event.obstacle=event.obstacles.randomGet();
						game.resume();
					};
				}
				else{
					delete event.bufang;
				}
				'step 3'
				if(event.dialog){
					event.dialog.close();
					delete event.dialog;
				}
				if(event.chooseObstacle){
					game.removeObstacle(event.obstacle.dataset.position);
					game.addChessPlayer(event.currentBufang,'treasure',0,event.obstacle.dataset.position).life=3;
					event.chooseObstacle=false;
					event.goto(2);
				}
				else{
					if(event.obstacles){
						for(var i=0;i<event.obstacles.length;i++){
							event.obstacles[i].classList.remove('glow');
						}
						delete event.obstacles;
					}
					delete event.obstacle;
					delete event.currentBufang;
				}
				'step 4'
				if(event.dialog){
					event.dialog.close();
					delete event.dialog;
				}
				if(event.zhaomu.length){
					event.currentZhaomu=event.zhaomu.shift();
					event.dialog=ui.create.dialog('选择一个位置安排【'+get.translation(event.currentZhaomu)+'】');
					var size=ui.chesswidth*(ui.chessheight-1);
					var clickGrid=function(){
						var player=game.addChessPlayer(event.currentZhaomu,false,4,this.dataset.position);
						_status.friends.push(player);
						if(!game.me.name){
							game.me=player;
							game.me.classList.add('current_action');
							ui.me.querySelector('.fakeme.avatar').show();
							ui.me.querySelector('.fakeme.player').show();
							ui.create.fakeme();
							ui.handcards1=player.node.handcards1.animate('start').fix();
							ui.handcards2=player.node.handcards2.animate('start').fix();
							ui.handcards1Container.appendChild(ui.handcards1);
							ui.handcards2Container.appendChild(ui.handcards2);
							ui.updatehl();
							game.setChessInfo();
							game.addVideo('tafangMe',player);
						}
						this.delete();
						event.redo();
						game.resume();
					}
					if(!event.playergrids){
						event.playergrids=[]
						for(var i=ui.chesswidth;i<size;i++){
							if(!lib.posmap[i.toString()]){
								var grid=ui.create.div('.player.minskin.playerblank.glow',clickGrid,ui.chess);
								grid.animate('start');
								grid.dataset.position=i;
								event.playergrids.push(grid);
							}
						}
					}
					game.pause();
					if(_status.auto){
						setTimeout(function(){
							clickGrid.call(event.playergrids.randomGet());
						},50);
					}
					event.switchToAuto=function(){
						clickGrid.call(event.playergrids.randomGet());
					}
				}
				else{
					delete event.zhaomu;
				}
				'step 5'
				_status.imchoosing=false;
				ui.auto.show();
				game.delay();
				if(event.dialog){
					event.dialog.close();
					delete event.dialog;
				}
				if(event.playergrids){
					for(var i=0;i<event.playergrids.length;i++){
						event.playergrids[i].delete();
					}
					delete event.playergrids;
				}
				delete event.currentZhaomu;
				'step 6'
				var shalldelay=false;
				for(var i=0;i<ui.chesswidth;i++){
					if(lib.posmap[i]&&game.players.contains(lib.posmap[i])){
						for(var j=0;j<ui.chessheight;j++){
							var pos=i+j*ui.chesswidth;
							if(lib.posmap[pos]&&lib.posmap[pos].movable(0,1)){
								break;
							}
						}
						if(j<ui.chessheight){
							shalldelay=true;
							for(var k=j;k>=0;k--){
								var pos=i+k*ui.chesswidth;
								if(lib.posmap[pos]){
									lib.posmap[pos].moveDown();
								}
							}
						}
					}
				}
				if(shalldelay) game.delay();
				'step 7'
				event.justadded=[];
				if(_status.characterList.length){
					if(_status.enemies.length<ui.chesswidth*2){
						var list1=[];
						for(var i=0;i<ui.chesswidth;i++){
							if(!lib.posmap[i]){
								list1.push(i);
							}
						}
						if(list1.length){
							var enemy=game.addChessPlayer(_status.characterList.shift(),true,4,list1.randomRemove());
							_status.enemies.push(enemy);
							event.justadded.push(enemy.name);
							if(game.players.length==1){
								ui.me.querySelector('.fakeme.player').show();
								game.setChessInfo(game.players[0]);
							}
							game.delay();
						}
						// var difficulty=get.config('tafang_difficulty');
						// if(_status.turnCount>=10&&list1.length&&difficulty>1){
						// 	var enemy=game.addChessPlayer(_status.characterList.shift(),true,4,list1.randomRemove());
						// 	_status.enemies.push(enemy);
						// 	event.justadded.push(enemy.name);
						// }
						// if(_status.turnCount>=20&&list1.length&&difficulty>1){
						// 	var enemy=game.addChessPlayer(_status.characterList.shift(),true,4,list1.randomRemove());
						// 	_status.enemies.push(enemy);
						// 	event.justadded.push(enemy.name);
						// }
						// if(list1.length&&difficulty>2){
						// 	var enemy=game.addChessPlayer(_status.characterList.shift(),true,4,list1.randomRemove());
						// 	_status.enemies.push(enemy);
						// 	event.justadded.push(enemy.name);
						// }
					}
				}
				else{
					game.over(true);
				}
				'step 8'
				if(event.xingdong.length){
					var toact=event.xingdong.shift();
					if(game.players.contains(toact)){
						toact.phase();
					}
					event.redo();
				}
				else{
					event.xingdong=_status.enemies.slice(0);
				}
				'step 9'
				if(event.xingdong.length){
					var enemy=event.xingdong.shift();
					if(!event.justadded.contains(enemy.name)&&game.players.contains(enemy)){
						enemy.phase();
					}
					event.redo();
				}
				else{
					event.mechlist=game.treasures.slice(0);
				}
				'step 10'
				if(event.mechlist.length){
					var mech=event.mechlist.shift();
					var info=lib.skill[mech.name+'_skill'];
					if(!info.filter||info.filter(mech)){
						var next=game.createEvent('chessMech');
						next.player=mech;
						next.setContent(info.content);
						mech.chessFocus();
						if(lib.config.animation&&!lib.config.low_performance){
							mech.$epic2();
						}
						game.delay();
					}
					if(mech.life--<=0){
						game.treasures.remove(mech);
						setTimeout(function(){
							mech.delete();
						},500);
						delete lib.posmap[mech.dataset.position];
						game.addVideo('deleteChessPlayer',mech);
						game.addObstacle(mech.dataset.position);
						game.log(get.translation(mech)+'使用期限已到');
					}
					event.redo();
				}
				'step 11'
				delete event.xingdong;
				delete event.mechlist;
				if(_status.turnCount>=_status.turnTotal){
					game.over(true);
				}
				else{
					event.goto(0);
					game.delay();
				}
			});
		},
		isChessNeighbour:function(a,b){
			if(a&&a.dataset){
				a=a.dataset.position;
			}
			if(b&&b.dataset){
				b=b.dataset.position;
			}
			var ax=a%ui.chesswidth;
			var ay=Math.floor(a/ui.chesswidth);

			var bx=b%ui.chesswidth;
			var by=Math.floor(b/ui.chesswidth);

			if(ax==bx&&Math.abs(ay-by)==1) return true;
			if(ay==by&&Math.abs(ax-bx)==1) return true;

			return false;
		},
		draw2:function(func){
			lib.canvasUpdates2.push(func);
			if(!lib.status.canvas2){
				lib.status.canvas2=true;
				game.update(game.updateCanvas2);
			}
		},
		updateCanvas2:function(time){
			if(lib.canvasUpdates2.length===0){
				lib.status.canvas2=false;
				return false;
			}
			ui.canvas2.width=ui.chess.offsetWidth;
			ui.canvas2.height=ui.chess.offsetHeight;
			ui.canvas2.style.left=0;
			ui.canvas2.style.top=0;
			var ctx=ui.ctx2;
			ctx.shadowBlur=5;
			ctx.shadowColor='rgba(0,0,0,0.3)';
			ctx.fillStyle='white';
			ctx.strokeStyle='white';
			ctx.lineWidth=3;
			ctx.save();
			for(var i=0;i<lib.canvasUpdates2.length;i++){
				ctx.restore();
				ctx.save();
				var update=lib.canvasUpdates2[i];
				if(!update.starttime){
					update.starttime=time;
				}
				if(update(time-update.starttime,ctx)===false){
					lib.canvasUpdates2.splice(i--,1);
				}
			}
		},
		setChessInfo:function(p){
			if(!p){
				if(ui.phasequeue&&ui.phasequeue.length){
					p=ui.phasequeue[0].link;
				}
				else{
					p=game.me;
				}
			}
			ui.chessinfo.innerHTML='';
			ui.phasequeue=[];
			for(var i=0;i<game.players.length;i++){
				var node=ui.create.div('.avatar',ui.chessinfo);
				node.style.backgroundImage=p.node.avatar.style.backgroundImage;
				node.link=p;
				node.listen(ui.click.chessInfo);
				p.instance=node;
				if(_status.currentPhase==p){
					node.classList.add('glow2');
				}
				ui.phasequeue.push(node);
				p=p.next;
			}
		},
		modeSwapPlayer:function(player){
			var content=[game.me.dataset.position,player.dataset.position];
			game.me.classList.remove('current_action');
			player.classList.add('current_action');
			game.addVideo('chessSwap',null,content);
			game.swapControl(player);
			player.chessFocus();
			ui.create.fakeme();
		}
	},
	skill:{
		chess_mech_weixingxianjing_skill:{
			filter:function(player){
				for(var i=0;i<_status.enemies.length;i++){
					if(!_status.enemies[i].isTurnedOver()&&
						get.chessDistance(player,_status.enemies[i])<=2){
						return true;
					}
				}
				return false;
			},
			content:function(){
				var list=[];
				for(var i=0;i<_status.enemies.length;i++){
					if(!_status.enemies[i].isTurnedOver()&&
						get.chessDistance(player,_status.enemies[i])<=2){
						list.push(_status.enemies[i]);
					}
				}
				if(list.length){
					game.log('小型陷阱发动');
					var target=list.randomGet();
					target.turnOver();
					player.line(target,'green');
				}
			}
		},
		chess_mech_nengliangqiu_skill:{
			filter:function(player){
				for(var i=0;i<_status.friends.length;i++){
					if(get.chessDistance(player,_status.friends[i])<=3){
						return true;
					}
				}
				return false;
			},
			content:function(){
				var list1=[],list2=[];
				for(var i=0;i<_status.friends.length;i++){
					if(get.chessDistance(player,_status.friends[i])<=1){
						list2.push(_status.friends[i]);
					}
					else if(get.chessDistance(player,_status.friends[i])<=3){
						list1.push(_status.friends[i]);
					}
					// else if(get.chessDistance(player,_status.friends[i])<=4){
					// 	list2.push(_status.friends[i]);
					// }
				}
				if(list2.length){
					game.asyncDraw(list2,2);
					player.line(list2,'green');
				}
				if(list1.length){
					game.asyncDraw(list1);
					player.line(list1,'green');
				}
				if(list1.length||list2.length){
					game.log('能量球发动');
				}
			}
		},
		chess_mech_mutong_skill:{
			filter:function(player){
				for(var i=0;i<_status.enemies.length;i++){
					if(get.chessDistance(player,_status.enemies[i])<=3){
						return true;
					}
				}
				return false;
			},
			content:function(){
				var list=[];
				for(var i=0;i<_status.enemies.length;i++){
					if(get.chessDistance(player,_status.enemies[i])<=3){
						list.push(_status.enemies[i]);
					}
				}
				if(list.length){
					game.log('木桶发动');
					var targets=list.randomGets(1);
					player.line(targets,'green');
					for(var i=0;i<targets.length;i++){
						targets[i].damage('nosource');
					}
				}
			}
		},
		chess_mech_guangmingquan_skill:{
			filter:function(player){
				for(var i=0;i<_status.friends.length;i++){
					if(_status.friends[i].hp<_status.friends[i].maxHp&&
						get.chessDistance(player,_status.friends[i])<=2){
						return true;
					}
				}
				return false;
			},
			content:function(){
				var list=[];
				for(var i=0;i<_status.friends.length;i++){
					if(_status.friends[i].hp<_status.friends[i].maxHp&&
						get.chessDistance(player,_status.friends[i])<=2){
						list.push(_status.friends[i]);
					}
				}
				if(list.length){
					game.log('光明泉发动');
					player.line(list,'green');
					while(list.length){
						list.shift().recover();
					}
				}
			}
		},
		chess_mech_jiguanren_skill:{
			filter:function(player){
				for(var i=0;i<_status.enemies.length;i++){
					if(get.chessDistance(player,_status.enemies[i])<=3){
						return true;
					}
				}
				return false;
			},
			content:function(){
				'step 0'
				var list=[];
				for(var i=0;i<_status.enemies.length;i++){
					if(get.chessDistance(player,_status.enemies[i])<=3){
						list.push(_status.enemies[i]);
					}
				}
				if(list.length){
					game.log('机关人发动');
					player.line(list,'green');
					event.list=list;
				}
				else{
					event.finish();
				}
				'step 1'
				if(event.list.length){
					var target=event.list.shift();
					var he=target.get('he');
					if(he.length){
						target.discard(he.randomGets(Math.ceil(Math.random()*2)));
					}
					event.redo();
				}
			}
		},
		chess_mech_gongchengche_skill:{
			filter:function(player){
				for(var i=0;i<_status.enemies.length;i++){
					if(get.chessDistance(player,_status.enemies[i])<=2){
						return true;
					}
				}
				return false;
			},
			content:function(){
				'step 0'
				var list=[];
				for(var i=0;i<_status.enemies.length;i++){
					if(get.chessDistance(player,_status.enemies[i])<=2){
						list.push(_status.enemies[i]);
					}
				}
				if(list.length){
					game.log('攻城车发动');
					event.target=list.randomGet();
					player.playerfocus(1000);
					player.line(event.target,'fire');
					game.delay(2);
				}
				else{
					event.finish();
				}
				'step 1'
				if(event.target){
					event.target.damage('fire','nosource');
					event.target.moveUp();
				}
			}
		},
		_attackmove:{
			trigger:{player:'damageEnd'},
			forced:true,
			popup:false,
			priority:50,
			filter:function(event,player){
				if(!get.config('attack_move')) return false;
				if(!event.source) return false;
				if(get.distance(event.source,player,'pure')>2) return false;
				var xy1=event.source.getXY();
				var xy2=player.getXY();
				var dx=xy2[0]-xy1[0];
				var dy=xy2[1]-xy1[1];
				// if(dx*dy!=0) return false;
				if(dx==0&&Math.abs(dy)==2){
					dy/=2;
				}
				if(dy==0&&Math.abs(dx)==2){
					dx/=2;
				}
				return player.movable(dx,dy);
			},
			content:function(){
				var xy1=trigger.source.getXY();
				var xy2=player.getXY();
				var dx=xy2[0]-xy1[0];
				var dy=xy2[1]-xy1[1];
				if(dx==0&&Math.abs(dy)==2){
					dy/=2;
				}
				if(dy==0&&Math.abs(dx)==2){
					dx/=2;
				}
				if(player.movable(dx,dy)){
					player.move(dx,dy);
				}
			}
		},
		_phasequeue:{
			trigger:{player:'phaseBegin'},
			forced:true,
			popup:false,
			content:function(){
				var current=ui.chessinfo.querySelector('.glow2');
				if(current){
					current.classList.remove('glow2');
				}
				if(player.instance){
					player.instance.classList.add('glow2');
					ui.chessinfo.scrollTop=player.instance.offsetTop-8;
				}
			}
		},
		_chessmove:{
			enable:'phaseUse',
			usable:1,
			direct:true,
			delay:false,
			preservecancel:true,
			filter:function(event,player){
				if(!player.movable(0,1)&&!player.movable(0,-1)&&
					!player.movable(1,0)&&!player.movable(-1,0)){
					return false;
				}
				var move=2;
				move=game.checkMod(player,move,'chessMove',player.get('s'));
				return move>0;
			},
			content:function(){
				"step 0"
				var move=2;
				move=game.checkMod(player,move,'chessMove',player.get('s'));
				player.chooseToMove(move).phasing=true;
				"step 1"
				if(!result.bool){
					var skill=player.getStat().skill;
					skill._chessmove--;
					if(typeof skill._chessmovetried=='number'){
						skill._chessmovetried++;
					}
					else{
						skill._chessmovetried=1;
					}
				}
			},
			ai:{
				order:5,
				result:{
					playerx:function(player){
						if(_status.mode=='tafang'&&_status.enemies.contains(player)){
							return 1;
						}
						var nh=player.num('h');
						if(!player.num('h','sha')&&
						!player.num('h','shunshou')&&
						!player.num('h','bingliang')){
							if(nh<=Math.min(3,player.hp)) return Math.random()-0.3;
							else if(nh<=Math.min(2,player.hp)) return Math.random()-0.4;
							return Math.random()-0.5;
						}
						var neighbour;
						neighbour=player.getNeighbour(0,1);
						if(neighbour&&game.players.contains(neighbour)&&neighbour.side!=player.side){
							if(get.distance(player,neighbour,'attack')<1) return 1;
							return 0;
						}
						neighbour=player.getNeighbour(0,-1);
						if(neighbour&&game.players.contains(neighbour)&&neighbour.side!=player.side){
							if(get.distance(player,neighbour,'attack')<1) return 1;
							return 0;
						}
						neighbour=player.getNeighbour(1,0);
						if(neighbour&&game.players.contains(neighbour)&&neighbour.side!=player.side){
							if(get.distance(player,neighbour,'attack')<1) return 1;
							return 0;
						}
						neighbour=player.getNeighbour(-1,0);
						if(neighbour&&game.players.contains(neighbour)&&neighbour.side!=player.side){
							if(get.distance(player,neighbour,'attack')<1) return 1;
							return 0;
						}
						return 1;
					},
					player:function(player){
						if(player.getStat().skill._chessmovetried>=10){
							return 0;
						}
						var x=lib.skill._chessmove.ai.result.playerx(player);
						if(player.isMad()) return -x;
						return x;
					}
				}
			}
		},
		_chessswap:{
			trigger:{player:['phaseBegin','chooseToUseBegin','chooseToRespondBegin','chooseToDiscardBegin','chooseToCompareBegin',
			'chooseButtonBegin','chooseCardBegin','chooseTargetBegin','chooseCardTargetBegin','chooseControlBegin',
			'chooseBoolBegin','choosePlayerCardBegin','discardPlayerCardBegin','gainPlayerCardBegin']},
			forced:true,
			priority:100,
			popup:false,
			filter:function(event,player){
				if(event.autochoose&&event.autochoose()) return false;
				if(lib.config.mode=='chess'&&_status.mode=='combat'&&!get.config('single_control')) return false;
				return player.isUnderControl();
			},
			content:function(){
				game.modeSwapPlayer(player);
			},
		},
		_chesscenter:{
			trigger:{player:['phaseBegin','useCardBegin','useSkillBegin','respondBegin','damageBegin','loseHpBegin'],
			target:'useCardToBegin'},
			forced:true,
			priority:100,
			popup:false,
			content:function(){
				player.chessFocus();
			},
		},
	},
	translate:{
		friend:'友',
		enemy:'敌',
		neutral:'中',
		trueColor:"zhu",
		falseColor:"wei",
		_chessmove:'移动',

		mode_tafang_character_config:'塔防模式',
		mode_tafang_card_config:'塔防模式',

		chess_mech_weixingxianjing:'小型陷阱',
		chess_mech_weixingxianjing_skill:'捕猎',
		chess_mech_weixingxianjing_skill_info:'每一轮令距离你2格以内的一名随机敌人翻面',
		chess_mech_mutong:'木桶',
		chess_mech_mutong_skill:'飞滚',
		chess_mech_mutong_skill_info:'每一轮对距离3格以内的一名随机敌人造成一点伤害',
		chess_mech_nengliangqiu:'能量球',
		chess_mech_nengliangqiu_skill:'充能',
		chess_mech_nengliangqiu_skill_info:'每一轮令距离3格以内的所有友方角色摸1张牌，距离1以内改为摸2张',
		chess_mech_jiguanren:'机关人',
		chess_mech_jiguanren_skill:'掠夺',
		chess_mech_jiguanren_skill_info:'每一轮弃置3格以内的所有敌方角色各1~2张牌',
		chess_mech_gongchengche:'攻城车',
		chess_mech_gongchengche_skill:'攻坚',
		chess_mech_gongchengche_skill_info:'每一轮对距离2格以内的一名随机敌方角色造成1点火焰伤害，并将目标击退1格',
		chess_mech_guangmingquan:'光明泉',
		chess_mech_guangmingquan_skill:'圣疗',
		chess_mech_guangmingquan_skill_info:'每一轮令距离2格以内的所有友方角色各回复一点体力',
	},
	ui:{
		create:{
			playergrid:function(player,x,y){
				var pos=player.getDataPos(x,y);
				if(_status.mode=='tafang'){
					if(pos<ui.chesswidth) return false;
					if(pos/ui.chesswidth>=ui.chessheight-1) return false;
				}
				var node=ui.create.div('.player.minskin.playergrid',player.parentNode);
				node.link=player;
				node.dataset.position=pos;
				return node;
			},
			fakeme:function(){
				if(ui.fakeme){
					ui.fakeme.delete();
				}
				ui.fakeme=ui.create.div('.fakeme.avatar',ui.me);
				ui.fakeme.style.backgroundImage=game.me.node.avatar.style.backgroundImage;
			}
		},
		click:{
			chessInfo:function(e){
				if(this.link.isAlive()){
					this.link.chessFocus();
					if(this.link.classList.contains('selectable')||
						this.link.classList.contains('selected')){
						ui.click.target.call(this.link,e);
						ui.click.window.call(ui.window,e);
					}
					e.stopPropagation();
				}
			},
			playergrid:function(){
				if(!_status.paused) return;
				var pos=parseInt(this.dataset.position);
				this.link.moveTo(pos%ui.chesswidth,Math.floor(pos/ui.chesswidth));
				if(ui.movegrids){
					while(ui.movegrids.length){
						ui.movegrids.shift().delete();
					}
				}
				_status.event.result={
					bool:true,
					move:this.link.dataset.position
				};
				game.resume();
			},
			obstacle:function(){
				if(_status.event.chooseObstacle&&_status.paused&&
					_status.event.obstacles&&_status.event.obstacles.contains(this)){
					_status.event.obstacle=this;
					game.resume();
				}
			}
		}
	},
	get:{
		chessDistance:function(from,to){
			var fxy=from.getXY();
			var txy=to.getXY();
			return Math.abs(fxy[0]-txy[0])+Math.abs(fxy[1]-txy[1]);
		},
	},
	ai:{
		get:{
			attitude:function(from,to){
				if(!from||!to) return 0;
				var t=(from.side===to.side?1:-1);
				if(from.isMad()){
					t=-t;
				}
				else if(to.isMad()){
					t=0;
				}
				return 6*t;
			}
		}
	},
	characterPack:{
		mode_tafang:{
			chess_mech_guangmingquan:['','',0,['chess_mech_guangmingquan_skill'],['boss']],
			chess_mech_nengliangqiu:['','',0,['chess_mech_nengliangqiu_skill'],['boss']],
			chess_mech_jiguanren:['','',0,['chess_mech_jiguanren_skill'],['boss']],
			chess_mech_weixingxianjing:['','',0,['chess_mech_weixingxianjing_skill'],['boss']],
			chess_mech_mutong:['','',0,['chess_mech_mutong_skill'],['boss']],
			chess_mech_gongchengche:['','',0,['chess_mech_gongchengche_skill'],['boss']],
		}
	},
	cardPack:{
		mode_tafang:[]
	},
	posmap:{},
	help:{
		'塔防模式':
		'<ul><li>阻上敌人到达最下方的出口，坚持到给定的回合数即获得胜利<li>'+
		'每轮可获得10个行动点，用来布置机关、招募武将，或令武将行动。游戏难度将影响不同操作消耗的行动点数。未用完的行动点将减半并累积到下一轮<li>'+
		'每一轮在最上方的一个随机位置增加一名敌人，若最上方已有角色，则将其下移一格<li>'+
		'战场上最多出现3个相同的机关，每个机关在置入战场3轮后消失。战场上最多招募10名友方角色。<li>'+
		'敌方角色到达底部出口时游戏失败，已方角色到达底部出口，将被移出游戏',
	},
}
