module lie {

	declare var wx, sharedCanvas;

	var $canvas, $instance;		// 不存在的变量别用var

	interface ITFShareInfo {
		xgType: number;
		title: string;
		imgurl: string;
		query?: string;
		success?: (a) => void;
		fail?: (a) => void;
	}

	interface KVData {
		key: string;
		value: string;
	}

	/**
	 * 音乐接口
	 */
	interface ITFMusic {
		play(): void;
		pause(): void;
		src: string;
		loop: boolean;
		volume: number;
		// 微信才有的
		onEnded?(call: Function): void;
		destroy?(): void;
		param?: any;
	}

	/**
	 * 微信广告对象
	 */
	interface ITFBanner {
		isDestroy: boolean;	// 标记属性
		style: any;
		show: () => void;
		onLoad: (call: Function) => void;
		destroy: () => void;
		onResize: (e) => void;
	}

	/**
	 * 用户信息按钮
	 */
	export interface ITFUserInfoBtn {
		show: Function;		// 显示
		hide: Function;		// 隐藏
		destroy: Function;	// 销毁
		text: string;		// 按钮文字，类型为text修改才有效
		onTap: (call: (res) => void) => void;	// 点击事件绑定
	}

	/**
	 * 消息类型
	 */
	export interface IWXMessage {
		action: string;
		data: any;
	}

	/**
	 * 微信平台工具类——微信工具除登录和获取用户信息
	 */
	export class WXUtils {

		protected bgMusic: ITFMusic;								// 背景音乐
		protected effects: { [key: string]: ITFMusic[] } = {};		// 存放播放结束音效
		protected playEff: { [key: string]: ITFMusic[] } = {};		// 存放播放中的音效
		protected bannerCache: { [key: number]: ITFBanner } = {};	// 广告缓存
		protected adsPromise: FPromise<boolean>;					// 视频对象
		protected isShowLoading: boolean;							// 是否显示loading中
		protected isPreviewImg: boolean;							// 是否弹出图片中

		public ipxY: number = 60;									// ipx的距离顶部的偏移值
		public offsetY: number;										// 屏幕适配，Y值偏移

		/**
		 * 打点域名wxgame
		 */
		protected HOSTDOT = 'https://pkwegame.xunguanggame.com/platform-go/';

		protected constructor() {
		}

		/**
		 * 获取唯一的对象
		 */
		public static getInstance(): WXUtils {
			return $instance || ($instance = new WXUtils);
		}

		/**
		 * 游戏进入初始化——调用一次即可
		 */
		public init(): void {
			var self = this;
			// 分享携带ShareTicket
			wx.updateShareMenu({
				withShareTicket: true
			});
			wx.onShow(self.onShow.bind(self));
			wx.onHide(self.onHide.bind(self));
			wx.showShareMenu();	// 自动显示
			// 网络状态变化监听
			wx.onNetworkStatusChange(NetworkUtils.excuteStatusChange);
			// canvas大小
			sharedCanvas.width = 750;
			sharedCanvas.height = 1334;
			// 屏幕适配
			self.offsetY = self.isIPhoneX() ? self.ipxY : 0;
			// xgSdk
			wx.xgSdkInit();
			// 转发分享
			wx.xgOnShareAppMessage(function () {
				let obj = self.getGlobalShareInfo();
				obj.success = function (t) {
					// 用户点击了“转发”按钮
					self.sendClickDot('system_share');
				};
				return obj;
			});
		}

		/**
		 * 微信onShow
		 */
		protected onShow(res: any): void {
			var clzz = AppConfig;
			// 分享打开的链接
			var query = res.query;
			var notice = AppMsg.notice;
			notice(MsgId.onShow);
			// 其他固定操作
			this.playBgMusic();
			clzz.setQuery(query);
			// 分享票据
			var isShare = query.rank == 'true';
			if (isShare) {
				let ticket = res.shareTicket || '1';
				AppConfig.setTicket(ticket);
			}
			// 特殊渠道
			var scene = res.scene;
			if (scene == 1103 || scene == 1104) {
				clzz.startWithShortcut();
			}
			// 模拟分享手机版分享结束，需要延迟，因为真的分享也是onShow之后再触发success的
			// Laya.timer.callLater(null, AppMsg.notice, [MsgId.onImitate]);
		}

		/**
		 * 微信onHide
		 */
		protected onHide(res: any): void {
			var notice = AppMsg.notice;
			notice(MsgId.onHide);
			this.pauseBgMusic();
		}

		/**
		 * 发起post请求
		 */
		protected request(url: string, param: any): void {
			Http.request({
				url,
				param: param,
				method: 'post',
				isText: true
			});
		}

		/**
		 * 发送渠道打点数据
		 */
		public sendChannelDot(): void {
			var self = this;
			var option = wx.getLaunchOptionsSync() || {};
			var {scene, query, shareTicket, isSticky} = option;
			var url = self.HOSTDOT + 'channel';
			var name = query.scene;
			var getd = function (name) {
				return {
					userId: Server.uid,
					appId: appId,
					channel: name
				};
			};
			var post = 'post';
			if (name) {
				// 发送两次渠道打点
				self.request(url, getd(name));
			}
			Laya.timer.once(1000, null, function () {
				self.request(url, getd(appName + '_system_sence_' + scene));
			});
		}

		/**
		 * 发送点击打点数据
		 */
		public sendClickDot(action: string): void {
			// 发送渠道统计数据
			var uid = Server.uid;
			if (uid) {
				let self = this;
				let url = self.HOSTDOT + 'action';
				let param = {
					userId: uid,
					action: appName + '_' + action,	// 加上游戏标志
					appId: appId
				}
				// XG_STATISTICS.send(action, param);
				self.request(url, param);
			}
		}

		/**
		 * 系统信息
		 */
		public getSystemInfo(): any {
			return wx.getSystemInfoSync();
		}

		/**
		 * 登录
		 */
		public login(): Promise<any> {
			return new Promise(function (resolve) {
				wx.login({
					success: function (res) {
						resolve(res);
					}
				});
			});
		}

		/**
		 * 获取用户信息按钮
		 */
		public getUserInfoButton(x: number, y: number, width: number, height: number): ITFUserInfoBtn {
			var info = this.getSystemInfo();
			if (Utils.compareVesion(info.sdk, '2.0.6') >= 0) {
				let scale = info.screenWidth / Laya.stage.width;
				let round = Math.round;
				return wx.createUserInfoButton({
					type: 'text',
					text: '',
					style: {
						left: round(x * scale),
						top: round(y * scale),
						width: round(width * scale),
						height: round(height * scale),
						lineHeight: round(height * scale),
						backgroundColor: '#00ff0000',
						color: '#ffffff',
						textAlign: 'center',
						fontSize: 16,
						borderRadius: 20
					}
				});
			}
		}

		/**
		 * 获取开放域
		 */
		public getShareCanvas(): Laya.Texture {
			return new Laya.Texture(sharedCanvas);
		}

		/**
		 * 根据不同场景的分享
		 * @param type 分享类型
		 * @param query 分享携带参数
		 */
		public showTypeShare(type: number = 0, query?: string, imgUrl?: string): Promise<string> {
			var self = this;
			return new Promise<string>(function (resolve, reject) {
				let obj = self.getGlobalShareInfo(type, imgUrl);
				query && (obj.query += '&' + query);
				// 现在都不给了
				obj.success = function (res) {
					let tickets = res && res.shareTickets;
					resolve(tickets ? tickets[0] : '1');
				};
				obj.fail = function (res) {
					resolve();
				};
				// wx.shareAppMessage(obj);
				// xg test
				wx.xgShareAppMessage(obj);
			});
		}

		/**
		 * 新版模仿分享，新版本时无分享回调会自动触发回调，返回的字符串为'2'时说明是效仿的回调
		 * 注：若不需要分享结果的请使用原来的分享showTypeShare
		 * 注：参数同showTypeShare
		 */
		public showNewShare(type?: number, query?: string): Promise<string> {
			// var self = this;
			// return new Promise<string>(function (resolve) {
			// 	let isExcute = false;	// 检测是否已执行
			// 	// 执行
			// 	let excute = function (ticket) {
			// 		isExcute = true;
			// 		resolve(ticket);
			// 	};
			// 	self.showTypeShare(type, query).then(function (ticket) {
			// 		!isExcute && excute(ticket);
			// 	});
			// 	let info = self.getSystemInfo();
			// 	if (Utils.compareVesion(info.SDKVersion, '2.3.0') >= 0) {
			// 		// 兼容开发者工具（分享onShow没回调），发布时可删
			// 		if (info.platform == 'devtools')
			// 			lie.setTimeout(function () {
			// 				!isExcute && excute('2');
			// 			}, null, 3000);
			// 		else {
			// 			let message = MsgId.onImitate;	// 可查看该对象的使用地方
			// 			let start = Server.getTime();
			// 			AppMsg.register(message, function () {
			// 				AppMsg.remove(message);
			// 				!isExcute && excute(Server.getTime() - start >= 3000 ? '2' : '');
			// 			}, null, true);
			// 		}
			// 	}
			// });
			return this.showTypeShare(type, query);
		}

		/**
		 * app文字提示
		 */
		public showToast(msg: string, bool?: boolean): void {
			var obj = {
				title: msg,
				icon: bool ? 'success' : 'none'
			};
			wx.showToast(obj);
		}

		/**
		 * 显示模态对话框
		 * @param title 标题
		 * @param content 内容
		 */
		public showModal(title: string, content: string): void {
			wx.showModal({ title, content });
		}

		// 	/**
		// 	 * 设置用户数据
		// 	 */
		// 	public async setUserInfo(map: { [key: string]: any }): Promise<boolean> {
		// 		return new Promise<boolean>(function (resolve, reject) {
		// 			let clzz = AppConfig;
		// 			let datas = <KVData[]>[];
		// 			let setCS = wx.setUserCloudStorage;
		// 			let isObj = function (v) {
		// 				return typeof v === 'object';
		// 			};
		// 			for (let i in map) {
		// 				let v = map[i];
		// 				if (isObj(v))
		// 					v = JSON.parse(v);
		// 				datas.push({ key: i, value: v + '' });
		// 			}
		// 			// 低版本不支持
		// 			setCS ? setCS({
		// 				KVDataList: datas,
		// 				success: function () {
		// 					resolve(true);
		// 				},
		// 				fail: function () {
		// 					resolve(false);
		// 				}
		// 			}) : reject();
		// 		})
		// 	}

		/**
		 * 由主域向开放域推送消息
		 * @param action 消息标志
		 * @param data 消息参数
		 */
		public postMessage(action: string, data?: any): void {
			let msg = <IWXMessage>{};
			msg.action = action;
			msg.data = data;
			wx.postMessage(msg);
		}

		// /**
		//  * 获取玩家信息
		//  */
		// public getUserInfo(): Promise<any> {
		// 	var self = this;
		// 	return new Promise<any>(function (resolve) {
		// 		wx.getUserInfo({
		// 			lang: 'zh_CN',
		// 			success: function () {

		// 			}
		// 		})
		// 	});
		// }

		// 音乐相关

		/**
		 * 获取音乐路径
		 */
		private getMusicSrc(resName: string): string {
			return 'res/sound/' + resName + '.mp3';
		}

		/**
		 * 创建音乐对象并播放，同音效
		 */
		public createEffect(resName: string): void {
			if (/*AppConfig.isOpenEffect()*/AppConfig.isOpenMusic()) {
				let self = this;
				let effects = self.effects;
				let playeff = self.playEff;
				let effect = effects[resName] || (effects[resName] = []);
				let playE = playeff[resName] || (playeff[resName] = []);
				let audio = effect.pop(), newLen = playE.length;
				if (!audio) {
					audio = <any>wx.createInnerAudioContext();
					audio.onEnded(function () {
						playE.splice(newLen, 1);
						effect.push(audio);
					});
					audio.src = self.getMusicSrc(resName);
				}
				playE.push(audio);
				audio.play();
				// audio.volume = .4;
			}
		}

		/**
		 * 移除音效
		 */
		public removeEffect(resName: string): void {
			var playEff = this.playEff;
			var playE = playEff[resName];
			for (let i in playE) {
				let audio = playE[i];
				audio.pause();
			}
			playEff[resName] = [];
		}

		// 	/**
		// 	 * 清除音效
		// 	 */
		// 	public clearEffect(): void {
		// 		var self = this;
		// 		var effects = self.effects;
		// 		for (let i in effects) {
		// 			let audios = effects[i];
		// 			for (let j in audios) {
		// 				audios[j].destroy();
		// 			}
		// 		}
		// 		self.effects = {};
		// 	}

		/**
		 * 设置背景音乐，注意背景音乐是循环播放的
		 */
		public setBgMusic(resName: string): ITFMusic {
			var self = this;
			var audio = self.bgMusic;
			if (!audio) {
				audio = self.bgMusic = wx.createInnerAudioContext();
				// 重写播放
				let play = audio.play;
				audio.play = function () {
					AppConfig.isOpenMusic() &&
						play.call(audio);
				};
			}
			if (audio.param != resName) {
				audio.param = resName;
				audio.src = self.getMusicSrc(resName);
				audio.volume = .2;
				audio.loop = true;
				audio.play();
			}
			return audio;
		}

		/**
		 * 播放背景音乐
		 */
		public playBgMusic(): void {
			var music = this.bgMusic;
			music && music.play();
		}

		/**
		 * 停止播放
		 */
		public pauseBgMusic(): void {
			var music = this.bgMusic;
			music && music.pause();
		}

		/**
		 * 振动
		 * @param isLong 是否长振动
		 */
		public vibrate(isLong?: boolean): void {
			if (AppConfig.isOpenVibrate()) {
				if (isLong)
					wx.vibrateLong();
				else {
					wx.vibrateShort();
				}
			}
		}

		// 	/**
		// 	 * 显示更多
		// 	 */
		// 	public showMore(): void {
		// 		var self = this;
		// 		var isIPhone = self.isIPhone();
		// 		var customer = AppConfig.other.customer;
		// 		var url = (isIPhone ? customer.imgUrl2 : customer.imgUrl1) || customer.imgUrl;
		// 		self.previewImage(url).then(function () {
		// 			self.sendClickDot('more_game_' + self.getMobile(isIPhone));
		// 		});
		// 	}

		// 	/**
		// 	 * 显示试玩游戏
		// 	 */
		// 	public showTrialGame(): void {
		// 		var self = this;
		// 		var isIPhone = self.isIPhone();
		// 		var trialGame = AppConfig.other.trialGame;
		// 		var url = isIPhone ? trialGame.imgUrl2 : trialGame.imgUrl1;
		// 		self.previewImage(url).
		// 			then(function () {
		// 				self.sendClickDot('trial_game_' + self.getMobile(isIPhone));
		// 			});
		// 	}

		// 	/**
		// 	 * 显示关注
		// 	 */
		// 	public showFollow(): void {
		//		var self = this;
		// 		Dialog.showSingleDialog('关注“寻光游戏”公众号，免费领取美国队长皮肤。',
		// 			function (bool) {
		// 				bool && self.showCustomer();
		// 			}
		// 		).setBtnText('去关注');
		// 	}

		// /**
		//  * 点击显示客服，显示不了则弹出图片
		//  * @returns 返回是否关注了
		//  */
		// public showCustomer(): Promise<boolean> {
		// 	var self = this;
		// 	if (!self.isPreviewImg) {
		// 		let sdk = self.getSystemInfo().SDKVersion;
		// 		let customer = AppConfig.weChat.customer;
		// 		self.isPreviewImg = true;
		// 		return new Promise<boolean>(function (resolve) {
		// 			let endc = function (bool) {
		// 				self.isPreviewImg = false;
		// 				resolve(bool);
		// 			};
		// 			// 打得开客服就打开，否则打开更多游戏
		// 			if (sdk >= '2.0.3') {
		// 				Dialog.showSingleDialog(customer.content, function (bool) {
		// 					if (bool) {
		// 						wx.openCustomerServiceConversation({
		// 							showMessageCard: customer.card,
		// 							sendMessageTitle: customer.title,
		// 							sendMessagePath: customer.path,
		// 							sendMessageImg: customer.imgUrl,
		// 							success: function (res) {
		// 								// res.path == customer.path表示点了链接
		// 								self.sendClickDot('customer_service');
		// 								// 如果解锁了皮肤
		// 								let clzz = AppConfig;
		// 								if (!clzz.isFollow) {
		// 									Service.reqReLogin().then(function (info) {
		// 										let bool = info.isFollow;
		// 										if (bool != void 0) {
		// 											clzz.isFollow = bool;
		// 											AppMsg.notice(MsgId.onFollow, bool);
		// 										}
		// 										endc(bool);
		// 									});
		// 								}
		// 								else
		// 									endc(false);
		// 							},
		// 							fail: function () {
		// 								endc(false);
		// 							}
		// 						});
		// 					}
		// 					else
		// 						endc(false);
		// 				});
		// 			}
		// 			else {
		// 				self.previewImage(customer.imgUrl).then(function () {
		// 					endc(false);
		// 				});
		// 			}
		// 		});
		// 	}
		// }

		/**
		 * 显示图片
		 */
		protected previewImage(url: string): Promise<boolean> {
			return new Promise<boolean>(function (resolve) {
				wx.previewImage({
					urls: [url],
					success: function () {
						resolve(true);
					},
					fail: function () {
						resolve(false);
					}
				});
			})
		}

		// /**
		//  * 跳转到小程序
		//  */
		// public toMiniProgram(): Promise<boolean> {
		// 	var miniProgram = AppConfig.weChat.miniProgram;
		// 	var toMini = wx.navigateToMiniProgram;
		// 	var path = toMini && miniProgram.path;
		// 	if (path) {
		// 		return new Promise<boolean>(function (resolve) {
		// 			toMini({
		// 				appId: miniProgram.appId,
		// 				path: path,
		// 				extraData: miniProgram.extraData,
		// 				success: function (res) {
		// 					resolve(true);
		// 				},
		// 				fail: function (res) {
		// 					resolve(false);
		// 				}
		// 			});
		// 		});
		// 	}
		// 	else
		// 		return this.previewImage(miniProgram.imgUrl);
		// }

		/**
		 * 显示loading，禁止点击
		 */
		public showLoading(): void {
			var self = this;
			if (!self.isShowLoading) {
				self.isShowLoading = true;
				wx.showLoading({ mask: true });
			}
		}

		/**
		 * 关闭loading
		 */
		public hideLoading(): void {
			var self = this;
			if (self.isShowLoading) {
				self.isShowLoading = false;
				wx.hideLoading();
			}
		}

		// 	/**
		// 	 * 返回游戏圈按钮
		// 	 * @param x 屏幕坐标
		// 	 * @param y
		// 	 * @param size 大小
		// 	 */
		// 	public createGameClub(x: number, y: number, size: number): GameClub {
		// 		var create = wx.createGameClubButton;
		// 		if (create) {
		// 			let round = math.round;
		// 			let info = wx.getSystemInfoSync();
		// 			let scaleWidth = info.screenWidth / 750;
		// 			// let disHeight = (info.screenHeight - scaleWidth * 1334) / 2;	// 高度间隔
		// 			let style = {
		// 				left: round(x * scaleWidth),
		// 				top: round(y * scaleWidth),
		// 				width: round(size * scaleWidth),
		// 				height: round(size * scaleWidth)
		// 			};
		// 			return create({
		// 				icon: 'white',
		// 				style: style
		// 			});
		// 		}
		// 		return new GameClub;
		// 	}

		/**
		 * 显示视频
		 * @param type 类型
		 * @param unShow 是否不显示提示（默认文字提示，不需要时请设为true）
		 */
		public showAds(type: number = 0, unShow?: boolean): FPromise<boolean> {
			var self = this;
			return self.adsPromise || (
				self.adsPromise = new FPromise<boolean>(function (resolve, reject) {
					let sdk = self.getSystemInfo().SDKVersion;
					let show = UIDialog.showText;
					// 转换回调
					let turnCall = function (str) {
						self.adsPromise = null;
						!unShow && UIDialog.showText(str);
						resolve(false);
					};
					// 成功回调
					let success = function () {
						// Service.reqAddWatch();
						resolve(true);
					};
					// 字符串
					if (Utils.compareVesion(sdk, '2.0.4') >= 0) {
						let videoAd = wx.createRewardedVideoAd({
							adUnitId: adUnitIds[type]
						});
						videoAd.load().then(() => {
							// 监听回调
							let call = videoAd.onClose(function (res) {
								self.adsPromise = null;
								videoAd.offClose(call);
								if (sdk >= '2.1.0' && res) {
									if (res.isEnded) {
										success();
									} else {
										self.showToast('广告未看完无法获得奖励');
										resolve(false);
									}
								} else {
									success();
								}
							});
							videoAd.show();
						}).catch(err => {
							turnCall('已达到该时段内看视频次数上限，请稍后重试');
						});
					}
					else {
						turnCall('该微信版本暂不支持广告播放，请升级！');
					}
				}));
		}

		/**
		 * 显示banner广告
		 * @param type 0结算页，1选择关卡
		 * @param code 界面的标志
		 */
		public showBannerAds(type: number, code: number): Promise<void> {
			var self = this;
			var cache = self.bannerCache;
			return new Promise<void>(function (resolve, reject) {
				let banner = cache[code];
				if (banner)
					resolve();
				else {
					let info = self.getSystemInfo();
					let sdk = info.SDKVersion;
					// 字符串
					if (sdk >= '2.0.4') {
						let stage = Laya.stage;
						let sWidth = stage.width;
						let floor = Math.floor;
						let width = 600, height = 174;
						let x = (sWidth - width) / 2;
						let y = stage.height - height;
						let scaleWidth = info.screenWidth / sWidth;
						let style = {
							left: floor(x * scaleWidth),
							top: floor(y * scaleWidth),
							width: floor(width * scaleWidth),
							height: floor(height * scaleWidth)
						};
						let bannerAd = cache[code] = <ITFBanner>wx.createBannerAd({
							adUnitId: adUnitIds[4 + type],
							style: style
						});
						// 监听是否销毁
						bannerAd.onLoad(function () {
							if (bannerAd.isDestroy) {
								bannerAd.destroy();
							}
						});
						// 重置对齐
						if (bannerAd.onResize) {
							bannerAd.onResize(function (e) {
								let bStyle = bannerAd.style;
								if (bStyle) {
									bStyle.top = info.windowHeight - e.height;
									bStyle.left = (info.windowWidth - e.width) / 2;
								}
							});
						}
						bannerAd.show();
					}
				}
			});
		}

		/**
		 * 销毁banner广告
		 * @param code 界面的标志
		 */
		public hideBannerAds(code: number): Promise<void> {
			var cache = this.bannerCache;
			return new Promise<void>(function (resolve, reject) {
				let bannerAd = cache[code];
				if (bannerAd) {
					bannerAd.isDestroy = true;
					bannerAd.destroy();
					delete cache[code];
				}
			});
		}

		/**
		 * 是否有我的小程序功能
		 */
		public hasShortcut(): boolean {
			var self = this;
			return self.isIPhone() && self.getSystemInfo().version >= '6.6.7';
		}

		// 	/**
		// 	 * 发起支付
		// 	 * @param 元
		// 	 * @returns 返回带一个布尔值，表示充值是否成功
		// 	 */
		// 	public async requestPaymemts(money: number): Promise<boolean> {
		//		var self = this;
		// 		return new Promise<boolean>(function (resolve, reject) {
		// 			let payment = wx.requestMidasPayment;
		// 			if (payment && !self.isIPhone())
		// 				// 说明：offerId应用ID，详情看公众号，buyQuantity这里指金币数，
		// 				// buyQuantity的值实际金额必须符合微信文档要求
		// 				payment({
		// 					mode: 'game',
		// 					offerId,
		// 					buyQuantity: 100 * money,
		// 					zoneId: 1,
		// 					env: 0,
		// 					currentType: "CNY",
		// 					platform: "android",
		// 					success(res) {
		// 						resolve(true);
		// 					},
		// 					fail() {
		// 						resolve(false);
		// 					}
		// 				});
		// 			else
		// 				reject();
		// 		});
		// 	}

		// 	// 服务器相关

		/**
		 * 登录服务器
		 */
		public async loginGame(): Promise<void> {
			wx.login({
				success: function (info) {
					var code = info && info.code;
					if (code) {
						Http.post(ActionType.login, {
							code: code
						}).then(Server.onLogin);
					}
				}
			});
		}

		// 不暴露出去的方法

		/**
		 * 获取全局分享数据
		 */
		protected getGlobalShareInfo(type: number = 0, imgUrl?: string): ITFShareInfo {
			var random = Math.random;
			var shares = shareConfigs[0];	// 只有一种
			var title = shares[random() * shares.length | 0];
			// 自定义分享图，这里CDN4张
			var imageUrl = imgUrl || Server.CDN + 'share/share' + (random() * 4 | 0) + '.jpg';
			return {
				xgType: 1,
				title: title,
				imgurl: imageUrl,
				query: 'rid=' + Server.uid
			};
		}

		// canvas画图相关

		/**
		 * 获取分享图片Url
		 * @param 分数
		 */
		protected getRoleImageUrl(roleId: number): Promise<string> {
			var canvas = this.getCanvas();
			var context = canvas.getContext('2d');
			var getRes = RES.getRes;
			var bg = <Laya.Texture>getRes('loading_bg_png');
			var iconA = <lie.IAtlas>getRes('icon_atlas');
			var iconP = <Laya.Texture>getRes('icon_png'); getRes(AppConfig.getRoleIcon(roleId));	// 纹理是子图，但路径是合图
			var img0 = new Image;
			var img1 = new Image;
			return new Promise<string>(function (resolve) {
				let count = 0;
				let call = function () {
					if (++count >= 2) {
						let frame = iconA.frames['role' + roleId + '.png'].frame;
						let w = frame.w, h = frame.h, sw = canvas.width = 750, sh = canvas.height = 938;
						context.clearRect(0, 0, sw, sh);
						context.drawImage(img0, 0, 0, sw, sh, 0, 0, sw, sh);
						context.drawImage(img1, frame.x, frame.y, w, h, (sw - w) / 2, (sh - h) / 2, w, h);
						resolve((<any>canvas).toTempFilePathSync());	// 微信自带的方法
					}
				};
				img0.src = bg.bitmap.src;
				img1.src = iconP.bitmap.src;
				img0.onload = call;
				img1.onload = call;
			});
		}

		/**
		 * 获取canvas对象
		 */
		private getCanvas(): HTMLCanvasElement {
			return $canvas || ($canvas = wx.createCanvas());
		}

		// 	/**
		// 	 * 获取机型
		// 	 */
		// 	private getMobile(isIPhone: boolean): string {
		// 		return isIPhone ? 'ios' : 'android';
		// 	}

		// 其他

		// 	/**
		// 	 * 检测登录状态
		// 	 * @returns 返回是否还处于登录状态，即sessionkey还未过期
		// 	 */
		// 	public checkLogin(): Promise<boolean> {
		// 		var self = this;
		// 		if (self.isCheckLogin) return;
		// 		self.isCheckLogin = true;
		// 		return new Promise<boolean>(function (resolve, reject) {
		// 			let end = function (bool) {
		// 				self.isCheckLogin = false;
		// 				resolve(bool);
		// 			};
		// 			wx.checkSession({
		// 				success: function () {
		// 					end(true)
		// 				},
		// 				fail: function () {
		// 					end(false)
		// 				}
		// 			});
		// 		});
		// 	}

		/**
		 * 获取系统描述
		 */
		public getSystem(): string {
			return this.getSystemInfo().system;
		}

		/**
		 * 检测是不是ipx
		 */
		public isIPhoneX(): boolean {
			var info = this.getSystemInfo();
			return info.model.indexOf('iPhone X') > -1 &&
				Laya.stage.height == 1624;
		}

		/**
		 * 检测是否是ios
		 */
		public isIPhone(): boolean {
			return this.getSystem().indexOf('iOS') > -1;
		}

		/**
		 * 弹出人物分享
		 */
		public async showRoleShare(roleId: number): Promise<void> {
			var imgUrl = await this.getRoleImageUrl(roleId);
			pfUtils.showTypeShare(1, '', imgUrl);
		}

		// 	/**
		// 	 * 弹出充值界面
		// 	 */
		// 	public showRechageView(): Promise<void> {
		// 		var self = this;
		// 		return new Promise<void>(function (resolve, reject) {
		// 			self.showLoading();
		// 			// 结束回调
		// 			let endCall = function (func) {
		// 				self.hideLoading();
		// 				func();
		// 			};
		// 			// 二维码获取+uid+小程序appid
		// 			let image = new Image;
		// 			image.onload = function () {
		// 				// 背景
		// 				let res = <egret.Texture>RES.getRes('code_bg_jpg');
		// 				let canvas = self.getCanvas();
		// 				let context = canvas.getContext('2d');
		// 				let width = canvas.width = res.textureWidth;
		// 				let height = canvas.height = res.textureHeight;
		// 				context.clearRect(0, 0, width, height);
		// 				context.drawImage(res.$bitmapData.source, 0, 0, width, height);
		// 				// 二维码
		// 				let size = 230;
		// 				let codeX = 750 - size >> 1;
		// 				let codeY = 500;
		// 				// iphone第一次显示不出来
		// 				let time = self.hasRechage ? 0 : 20;
		// 				self.hasRechage = true;
		// 				egret.setTimeout(function () {
		// 					context.drawImage(image, codeX, codeY, size, size);
		// 					// 弹出界面
		// 					let url = (<any>canvas).toTempFilePathSync();
		// 					self.previewImage(url);
		// 					endCall(resolve);
		// 				}, null, time);
		// 			};
		// 			image.onerror = function () {
		// 				endCall(reject);
		// 			};
		// 			image.src = 'https://pkwegame.xunguanggame.com/token-go/?action=getQRCode&id=' + iosPayCodeId + '&userId=' +
		// 				Server.uid + '&appId=wx5b64f80ea9265a46';
		// 		})
		// 	}
	}

	/**
	 * 网络状态类型
	 */
	export type NetworkType = '2g' | '3g' | '4g' | 'wifi' | 'none' | 'unknown';

	/**
	 * 网络状态工具——基于微信
	 */
	export class NetworkUtils {

		private static $netCall: [[(type: NetworkType) => void, any, boolean]] = <any>[];

		/**
		 * 获取当前网络状态
		 */
		public static getNetworkType(): Promise<NetworkType> {
			return new Promise<NetworkType>(function (resolve) {
				wx.getNetworkType({
					success: function (res) {
						resolve(res.networkTyp);
					}
				});
			});
		}

		/**
		 * 判断类型是否是最佳网络状态
		 */
		public static isBestNetworkType(type: NetworkType): boolean {
			return type == '4g' || type == 'wifi';
		}

		/**
		 * 判断网络状态是否提升
		 * @param oldType 旧类型
		 * @param newType 新类型
		 */
		public static networkUpgrade(oldType: NetworkType, newType: NetworkType): boolean {
			var types = ['none', 'unknown', '2g', '3g', '4g', 'wifi'];
			var index0 = types.indexOf(oldType);
			var index1 = types.indexOf(newType);
			return index1 > index0;
		}

		/**
		 * 添加网络变化回调
		 * @param call 回调，参数是当前的网络状态
		 * @param thisObj 回调对象
		 * @param isOnce 是否是一次性的回调，即回调结束下次网络变化不再接受
		 */
		public static addNetworkStatusChange(call: (type: NetworkType) => void, thisObj?: any, isOnce?: boolean): void {
			NetworkUtils.$netCall.push([call, thisObj, isOnce]);
		}

		/**
		 * 移除网络变化回调
		 * @param call 回调，参数是当前的网络状态
		 * @param thisObj 回调对象
		 * @returns 返回移除结果
		 */
		public static removeNetworkStatusChange(call: (type: NetworkType) => void, thisObj?: any): boolean {
			var netCall = NetworkUtils.$netCall;
			for (let i = 0, len = netCall.length; i < len; i++) {
				let item = netCall[i];
				if (item[0] == call && item[1] == thisObj) {
					netCall.splice(i, 1);
					return true;
				}
			}
			return false;
		}

		/**
		 * 执行网络变化回调——请勿手动调用
		 */
		public static excuteStatusChange(type: NetworkType): void {
			var netCall = NetworkUtils.$netCall;
			for (let i = 0, len = netCall.length; i < len; i++) {
				let item = netCall[i];
				item[0].call(item[1], type);
				// 删除一次性回调
				if (item[2]) {
					netCall.splice(i, 1);
					i--;
				}
			}
		}
	}

	/////////////////////微信分包配置/////////////////////

	// 分享配置
	var shareConfigs = [
		// 0普通分享
		[
			'宫里怎么了',
			'清宫版跳一跳，震撼上线',
			'一个板子引发的宫廷血案',
			'跟着本皇，冲'
		]
	];
	// appid
	var appId = 'wxd1310c2db2b680e2';
	// 充值应用ID
	// var offerId = 1450014901;
	// ios 支付二维码id
	// var iosPayCodeId = 3;
	// 视频ID，分别是：钻石领取、复活、结算钥匙、图鉴领取、结算页、选择关卡
	var adUnitIds = [
		'adunit-c0d437264149fb48',
		'adunit-931a966dfb8e1a3b',
		'adunit-48ddc5694077e54d',
		'adunit-6e7e9b608baba718',
		'adunit-ee67198612ccab22',
		'adunit-4cdddeed09457f7a'
	];
	// 应用名
	export var appName = 'bridge';
}